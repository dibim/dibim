/**
 * 修改字段的功能 - SQLite版本
 */
import { STR_ADD, STR_DELETE, STR_EDIT, STR_FIELD, STR_TABLE } from "@/constants";
import { coreState } from "@/store/valtio";
import { AllAlterAction, FieldAlterAction, TableAlterAction } from "../types";
import { formatToSqlValueSqlite } from "./format";
import { TableStructure, genCreateTableDdl, parseCreateTableDdl } from "./utils";

function genSizeStr(faa: FieldAlterAction) {
  if (!faa.size) return "";
  const size = parseInt(faa.size);
  return Number.isInteger(size) && size > 0 ? `(${size})` : "";
}

function genFieldDefault(faa: FieldAlterAction) {
  if (faa.defaultValue === null || faa.isPrimaryKey) return "";
  return faa.defaultValue ? `DEFAULT ${formatToSqlValueSqlite(faa.defaultValue, true)}` : "";
}

function genNotNull(faa: FieldAlterAction) {
  return faa.isNullable ? "NOT NULL" : "";
}

function genPrimaryKey(faa: FieldAlterAction) {
  return faa.isPrimaryKey ? "PRIMARY KEY" : "";
}

function genAutoIncrement(faa: FieldAlterAction) {
  return faa.autoIncrement ? "AUTOINCREMENT" : "";
}

// TODO: 支持符合主键
function genIndxConstraint(faa: FieldAlterAction) {
  if (faa.isUniqueKey) {
    return `CONSTRAINT "${faa.indexName}" UNIQUE ("${faa.name}")`;
  } else return "";
}

function genFieldSql(faa: FieldAlterAction) {
  const parts = [
    `"${faa.name}"`,
    faa.type + genSizeStr(faa),
    genPrimaryKey(faa),
    genAutoIncrement(faa),
    genNotNull(faa),
    genFieldDefault(faa),
  ];
  return parts.filter((p) => p).join(" ");
}

/**
 * 重新建表
 * @param table 表名
 * @param ddl 建表语句
 * @param tempTable 临时表的表名
 * @param tempDdl 临时表的建表语句
 * @param retainedFieldsNames 要保留的字段名
 * @returns
 */
function genRecreateTable(table: string, ddl: string, newTable: string, retainedFieldsNames: string[]) {
  const fields = `"${retainedFieldsNames.join('","')}"`;
  // 这里开启事务会报错 cannot start a transaction within a transaction
  // 临时注释掉
  return [
    `
    -- 需要重新建表
    PRAGMA foreign_keys = OFF;
    -- BEGIN TRANSACTION;
    
    CREATE TEMPORARY TABLE "temp_backup" AS SELECT ${fields} FROM "${table}";
    ${ddl};
    INSERT INTO "${newTable}"(${fields}) SELECT ${fields} FROM "temp_backup";
    DROP TABLE "${table}";
    ALTER TABLE "${newTable}" RENAME TO "${table}";
    DROP TABLE "temp_backup";

    -- COMMIT;
    PRAGMA foreign_keys = ON;
    `,
  ];
}

const isTypeChange = (faa: FieldAlterAction) => faa.type !== faa.typeOld || faa.size !== faa.size; // 类型变化
const isPrimaryKeyChange = (faa: FieldAlterAction) => faa.isPrimaryKey !== faa.isPrimaryKeyOld;
const isUniqueKeyChange = (faa: FieldAlterAction) => faa.isUniqueKey !== faa.isUniqueKeyOld;
const isNullableChange = (faa: FieldAlterAction) => faa.isNullable !== faa.isNullableOld;
const defaultValueChange = (faa: FieldAlterAction) => faa.defaultValue !== faa.defalutValueOld;

/**
 * 这里只能进行不需要重建表的对字段修改操作, 只有 重命名
 * @param faa
 * @returns
 */
export function genAlterFieldEdit(faa: FieldAlterAction) {
  const res: string[] = [];

  if (faa.name !== faa.nameNew) {
    // SQLite 3.25.0 (2018-09-15 发布) 开始原生支持 RENAME COLUMN 语法. 之前的版本，必须使用表重建方式
    res.push(`ALTER TABLE "${faa.tableName}" RENAME COLUMN "${faa.name}" TO "${faa.nameNew}";`);
  }

  return res;
}

// 保持以下函数完全不变
export function genAlterFieldAdd(faa: FieldAlterAction) {
  return [
    `ALTER TABLE "${faa.tableName}" ADD COLUMN ${genFieldSql(faa)};`,
    ...(faa.isUniqueKey ? [`CREATE UNIQUE INDEX "${faa.indexName}" ON "${faa.tableName}"("${faa.name}");`] : []),
  ];
}

// 删除字段
export function genAlterFieldDel(faa: FieldAlterAction) {
  let res: string[] = [];
  res.push(`ALTER TABLE "${faa.tableName}" DROP COLUMN "${faa.name}";`);
  return res;
}

// 编辑表
export function genAlterTableEdit(taa: TableAlterAction) {
  const steps: string[] = [];
  if (taa.tableName !== taa.tableNameOld) {
    steps.push(`ALTER TABLE "${taa.tableNameOld}" RENAME TO "${taa.tableName}";`);
  }
  return steps;
}

// 创建表
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
        if (f.name === faa.name) {
          ts.columns[index].type = faa.type;
        }
      }
    }
    if (isNullableChange(faa)) {
      for (let index = 0; index < ts.columns.length; index++) {
        const f = ts.columns[index];
        if (f.name === faa.name) {
          ts.columns[index].isNullable = faa.isNullable;
        }
      }
    }
    if (isPrimaryKeyChange(faa)) {
      for (let index = 0; index < ts.columns.length; index++) {
        const f = ts.columns[index];
        if (f.name === faa.name) {
          ts.columns[index].autoIncrement = faa.autoIncrement;
          ts.columns[index].isPrimaryKey = faa.isPrimaryKey;
          ts.columns[index].isUniqueKey = faa.isUniqueKey;
        }
      }
    }
    if (isUniqueKeyChange(faa)) {
      for (let index = 0; index < ts.columns.length; index++) {
        const f = ts.columns[index];
        if (f.name === faa.name) {
          ts.columns[index].autoIncrement = faa.autoIncrement;
          ts.columns[index].isPrimaryKey = faa.isPrimaryKey;
          ts.columns[index].isUniqueKey = faa.isUniqueKey;
        }
      }
    }

    // 其它数据
    for (let index = 0; index < ts.columns.length; index++) {
      const f = ts.columns[index];
      if (f.name === faa.name) {
        ts.columns[index].comment = faa.comment;
        ts.columns[index].defaultValue = faa.defaultValue;
        ts.columns[index].isNullable = faa.isNullable;
        ts.columns[index].name = faa.name;
        ts.columns[index].size = faa.size;
      }
    }
  }
  // FIXME: 还有 indexName

  const newTable = `${ts.tableName}_new`;
  function ddl() {
    ts.tableName = newTable;
    return genCreateTableDdl(ts);
  }

  const retainedFieldsNames = ts.columns.map((item) => item.name);
  return genRecreateTable(ts.tableName, ddl(), newTable, retainedFieldsNames);
}

function needRecreateTable(faa: FieldAlterAction) {
  return (
    isTypeChange(faa) ||
    isPrimaryKeyChange(faa) ||
    isUniqueKeyChange(faa) ||
    isNullableChange(faa) ||
    defaultValueChange(faa)
  );
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
   
  - 修改列数据类型
  - 修改/删除主键约束
  - 为已有列添加唯一约束（列级或表级）
  - 删除任何唯一约束（列级或表级）
  - 删除 NOT NULL 约束
  - 已有列添加 NOT NULL 约束
  - 修改默认值
  - 添加/删除 CHECK 约束 TODO: 待实现
  - 删除列（SQLite < 3.35.0）
  - 重命名列（SQLite < 3.25.0）

  无需重建表的字段修改操作:
  - 重命名表
  - 重命名列（≥3.25.0）
  - 添加新列（带约束）
  - 删除列（≥3.35.0）
   */
  const NeedToRecreateTableCmds: FieldAlterAction[] = [];
  // 记录需要建表的动作
  for (const item of val) {
    if (item.target === STR_FIELD) {
      const faa = item as FieldAlterAction;
      if (faa.action === STR_EDIT) {
        if (needRecreateTable(faa)) {
          NeedToRecreateTableCmds.push(faa);
        }
      }
    }
  }
  // 有导致要重新建表的操作, 先重新建表, 其它修改再执行
  if (NeedToRecreateTableCmds.length > 0) {
    const sql = coreState.currentTableDdl;
    try {
      const sd = parseCreateTableDdl(sql);
      res = res.concat(recreateTable(sd, NeedToRecreateTableCmds));
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
        if (needRecreateTable(faa)) {
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
