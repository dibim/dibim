/**
 * 修改字段的功能 - SQLite版本
 */
import { STR_ADD, STR_DELETE, STR_EDIT, STR_FIELD, STR_TABLE } from "@/constants";
import { appState } from "@/store/valtio";
import { getTableDdl } from "../adapter,";
import { INDEX_PRIMARY_KEY, INDEX_UNIQUE } from "../constants";
import { AllAlterAction, FieldAlterAction, TableAlterAction } from "../types";
import { formatToSqlValueSqlite } from "./format";
import { TableStructure, generateCreateTableDdl, parseCreateTableDdl, test } from "./utils";

function genSizeStr(faa: FieldAlterAction) {
  if (!faa.fieldSize) return "";
  const size = parseInt(faa.fieldSize);
  return Number.isInteger(size) && size > 0 ? `(${size})` : "";
}

function genFieldDefault(faa: FieldAlterAction) {
  if (faa.fieldDefalut === null || faa.fieldIndexType === INDEX_PRIMARY_KEY) return "";
  return faa.fieldDefalut ? `DEFAULT ${formatToSqlValueSqlite(faa.fieldDefalut, true)}` : "";
}

function genNotNull(faa: FieldAlterAction) {
  return faa.fieldIsNullable ? "NOT NULL" : "";
}

function genPrimaryKey(faa: FieldAlterAction) {
  return faa.fieldIndexType === INDEX_PRIMARY_KEY ? "PRIMARY KEY" : "";
}

function genAutoIncrement(faa: FieldAlterAction) {
  return faa.fieldIndexPkAutoIncrement ? "AUTOINCREMENT" : "";
}

// TODO: 支持符合主键
function genIndxConstraint(faa: FieldAlterAction) {
  if (faa.fieldIndexType === INDEX_UNIQUE) {
    return `CONSTRAINT "${faa.fieldIndexName}" UNIQUE ("${faa.fieldName}")`;
  } else return "";
}

function genFieldSql(faa: FieldAlterAction) {
  const parts = [
    `"${faa.fieldName}"`,
    faa.fieldType + genSizeStr(faa),
    genPrimaryKey(faa),
    genAutoIncrement(faa),
    genNotNull(faa),
    genFieldDefault(faa),
  ];
  return parts.filter((p) => p).join(" ");
}

function handleSqliteAlterColumn(table: string, retainedFieldsNames: string, def: string) {
  return [
    `PRAGMA foreign_keys = off;`,
    `BEGIN TRANSACTION;`,
    `CREATE TEMPORARY TABLE "${table}_backup"(${def});`,
    `INSERT INTO ${table}_backup SELECT ${retainedFieldsNames} FROM ${table};`,
    `DROP TABLE ${table};`,
    `CREATE TABLE ${table}(${def});`,
    `INSERT INTO ${table} SELECT * FROM ${table}_backup;`,
    `DROP TABLE ${table}_backup;`,
    `COMMIT;`,
    `PRAGMA foreign_keys = on;`,
  ];
}

const isTypeChange = (faa: FieldAlterAction) => faa.fieldType !== faa.fieldTypeOld || faa.fieldSize !== faa.fieldSize; // 类型变化
const isIndexTypeChange = (faa: FieldAlterAction) => faa.fieldIndexType !== faa.fieldIndexTypeOld; // 索引变化
const isNotNullChange = (faa: FieldAlterAction) => faa.fieldIsNullable !== faa.fieldNotNullOld;

export function genAlterFieldEdit(faa: FieldAlterAction) {
  const newFaa = {
    ...faa,
    fieldName: faa.fieldNameExt,
  };

  const newDef = genFieldSql(newFaa);

  // FIXME: 重新建表要改成一次性执行
  if (isTypeChange(faa) || isIndexTypeChange(faa)) {
    return handleSqliteAlterColumn(
      `${faa.tableName}`,
      `${faa.fieldNameExt}`, // FIXME: 这里应该是要保留的字段
      newDef, // 新字段定义
    );
  }

  if (isNotNullChange(faa)) {
    handleSqliteAlterColumn(
      `${faa.tableName}`,
      `${faa.fieldNameExt}`, // FIXME: 这里应该是要保留的字段
      genFieldSql({ ...faa, fieldName: faa.fieldNameExt }),
    );
  }

  const res: string[] = [];

  if (faa.fieldName !== faa.fieldNameExt) {
    // SQLite 3.25.0 (2018-09-15 发布) 开始原生支持 RENAME COLUMN 语法. 之前的版本，必须使用表重建方式
    res.push(`ALTER TABLE "${faa.tableName}" RENAME COLUMN "${faa.fieldName}" TO "${faa.fieldNameExt}";`);
  }

  if (faa.fieldDefalut !== null) {
    const fv = formatToSqlValueSqlite(faa.fieldDefalut, true);
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.fieldNameExt}" SET DEFAULT ${fv};`);
  } else {
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.fieldNameExt}" DROP DEFAULT;`);
  }

  return res;
}

// 保持以下函数完全不变
export function genAlterFieldAdd(faa: FieldAlterAction) {
  return [
    `ALTER TABLE "${faa.tableName}" ADD COLUMN ${genFieldSql(faa)};`,
    ...(faa.fieldIndexType === INDEX_UNIQUE
      ? [`CREATE UNIQUE INDEX "${faa.fieldIndexName}" ON "${faa.tableName}"("${faa.fieldName}");`]
      : []),
  ];
}

export function genAlterFieldDel(faa: FieldAlterAction) {
  return handleSqliteAlterColumn(
    `${faa.tableName}`,
    `"${faa.fieldName}"`,
    appState.currentTableStructure
      ?.filter((f) => f.name !== faa.fieldName)
      .map((f) => genFieldSql(faa))
      .join(", ") || "",
  );
}

export function genAlterTableEdit(taa: TableAlterAction) {
  const steps: string[] = [];
  if (taa.tableName !== taa.tableNameOld) {
    steps.push(`ALTER TABLE "${taa.tableNameOld}" RENAME TO "${taa.tableName}";`);
  }
  return steps;
}

export function genAlterTableAdd(taa: TableAlterAction, faas: FieldAlterAction[]) {
  let res: string[] = [];

  const fields: string[] = [];
  const indxConstraints: string[] = [];
  for (const faa of faas) {
    fields.push(genFieldSql(faa));
    const constraint = genIndxConstraint(faa);
    if (constraint.length > 0) indxConstraints.push(constraint);
  }

  res.push(`
    CREATE TABLE "${taa.tableName}" (
      ${fields.length > 0 ? fields.join(",\n") : ""}
      ${indxConstraints.length > 0 ? "," + indxConstraints.join(",\n") : ""}      
    );
  `);

  return res;
}

// 用需要重新建表的字段数据更新已有的表结构
function recreateTable(ts: TableStructure, faas: FieldAlterAction[]) {
  for (const faa of faas) {
    if (isTypeChange(faa)) {
      for (let index = 0; index < ts.columns.length; index++) {
        const f = ts.columns[index];
        if (f.name === faa.fieldName) {
          ts.columns[index].type = faa.fieldType;
        }
      }
    }
    if (isNotNullChange(faa)) {
      for (let index = 0; index < ts.columns.length; index++) {
        const f = ts.columns[index];
        if (f.name === faa.fieldName) {
          ts.columns[index].isNullable = faa.fieldIsNullable;
        }
      }
    }
    if (isIndexTypeChange(faa)) {
      for (let index = 0; index < ts.columns.length; index++) {
        const f = ts.columns[index];
        if (f.name === faa.fieldName) {
          ts.columns[index].isPrimaryKey = faa.fieldIndexType === INDEX_PRIMARY_KEY;
          ts.columns[index].autoIncrement = faa.fieldIndexPkAutoIncrement;
          ts.columns[index].isUniqueKey = faa.fieldIndexType === INDEX_UNIQUE;
        }
      }
    }
  }

  const ddlNew = generateCreateTableDdl(ts);

  console.log("新的建表语句据  ", ddlNew);

  // TODO: 重新建表
  // 调用 handleSqliteAlterColumn
}

export function genAlterCmdSqlite(val: AllAlterAction[]) {
  let res: string[] = [];

  // 注意: 如果是建表, 需要把字段的数据全部传过去, 并直接返回
  for (const item of val) {
    if (item.target === STR_TABLE) {
      const taa = item as TableAlterAction;

      if (taa.action === STR_ADD) {
        const faas: FieldAlterAction[] = [];
        val.map((item) => {
          if (item.target === STR_FIELD) {
            faas.push(item as FieldAlterAction);
          }
        });

        res = res.concat(genAlterTableAdd(taa, faas));
        return res.join("");
      }
    }
  }

  /** 
   把需要重新建表的动作分离出来, 生成一条建表语句
   
   🚧🚧必须重建表的操作 🚧🚧

  - 修改列的数据类型
  - 修改或删除主键约束
  - 添加列级唯一约束. 在建表语句的字段定义里使用 UNIQUE
  - 删除表定义中的唯一约束, 如果约束是在表定义中声明的） 例如删除 CREATE TABLE 时定义的 UNIQUE (col1, col2) 约束
  - 删除非空约束(NOT NULL)
  - 添加或删除 CHECK 约束
  - 删除列(在 3.35.0 之前)
  - 重命名列(在 3.25.0 之前)
   */
  const NeedToRecreateTableCmds: FieldAlterAction[] = [];
  // 记录需要建表的动作
  for (const item of val) {
    if (item.target === STR_FIELD) {
      const faa = item as FieldAlterAction;
      if (faa.action === STR_EDIT) {
        if (isTypeChange(faa) || isIndexTypeChange(faa) || isNotNullChange(faa)) {
          NeedToRecreateTableCmds.push(faa);
        }
      }
    }
  }
  // 有导致要重新建表的操作, 先重新建表, 其它修改再执行
  if (NeedToRecreateTableCmds.length > 0) {
    const sql = appState.currentTableDdl;
    try {
      const sd = parseCreateTableDdl(sql);
      recreateTable(sd, NeedToRecreateTableCmds);
    } catch (error) {
      console.log(`parseCreateTableDdl 报错  ${error}`);
    }
  }

  // 处理其它不会触发重新建表的动作
  // 非建表的
  for (const item of val) {
    if (item.target === STR_TABLE) {
      const taa = item as TableAlterAction;
      // 对表的修改
      if (taa.action === STR_EDIT) {
        res = res.concat(genAlterTableEdit(taa));
      }
    }

    if (item.target === STR_FIELD) {
      // 对字段的修改
      const faa = item as FieldAlterAction;
      if (faa.action === STR_EDIT) {
        // 是要重新建表的动作, 先记录,最后执行
        if (isTypeChange(faa) || isIndexTypeChange(faa) || isNotNullChange(faa)) {
          NeedToRecreateTableCmds.push(faa);
          continue;
        }

        res = res.concat(genAlterFieldEdit(faa));
      }
      if (faa.action === STR_ADD) {
        res = res.concat(genAlterFieldAdd(faa));
      }
      if (faa.action === STR_DELETE) {
        res = res.concat(genAlterFieldDel(faa));
      }
    }
  }

  return res.join("\n");
}
