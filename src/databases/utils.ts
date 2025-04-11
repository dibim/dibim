import { TableDataChange } from "@/components/EditableTable";
import { RE_IS_SINGLET_QUERY, RE_WHERE_CLAUSE } from "@/constants";
import { NEW_ROW_IS_ADDED_FIELD } from "@/constants";
import { coreState } from "@/store/valtio";
import { genDeleteRowsCmd, genInsertRowsCmd, genUpdateFieldCmd } from "./adapter,";
import { FieldStructure, RowData, SqlValueCommon } from "./types";
import { FieldWithValue } from "./types";

/**
 * 类型守卫函数
 * 类型和 formatSQLValueCommon 一致
 * @param value
 * @returns
 */
export function isCommonSQLValue(value: unknown): value is SqlValueCommon {
  const type = typeof value;
  return (
    type === "string" ||
    type === "boolean" ||
    type === "bigint" ||
    type === "number" ||
    value === null ||
    value === undefined ||
    value instanceof Date ||
    value instanceof ArrayBuffer ||
    Array.isArray(value)
  );
}

/**
 * 格式化所有SQL数据库通用的数据类型
 * 类型和 isCommonSQLValue 一致
 */
export function formatToSqlValueCommon(value: SqlValueCommon): string {
  // 处理空值
  if (value == null) return "NULL";
  // TODO: 好像有问题
  if (value == `""`) return value;
  if (value == "''") return value;

  // 处理基本类型
  switch (typeof value) {
    case "string":
      return `'${value.replace(/'/g, "''")}'`;
    case "boolean":
      return value ? "TRUE" : "FALSE";
    case "bigint":
      return value.toString();
    case "number":
      return Number.isFinite(value) ? String(value) : "NULL"; // 处理NaN/Infinity
  }

  // 处理对象类型
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }

  if (value instanceof ArrayBuffer) {
    const buffer = Buffer.from(value);
    return `X'${buffer.toString("hex")}'`; // 通用16进制二进制格式
  }

  if (Array.isArray(value)) {
    return `(${value.map(formatToSqlValueCommon).join(", ")})`;
  }

  // 默认处理（不应执行到这里）
  throw new Error(`Unsupported common SQL type: ${typeof value}`);
}

/**
 * 找到唯一约束的字段名
 * @param tsa 表结构数据
 * @returns
 */
export function getUniqueFieldName(tsa: FieldStructure[]) {
  // 优先使用主键
  for (const f of tsa) {
    if (f.isPrimaryKey) return f.name;
  }

  // 其次唯一索引
  for (const f of tsa) {
    if (f.isUniqueKey) return f.name;
  }

  return "";
}

/**
 * 目前已弃用
 *
 * 查询表格数据的时候, 必须使用一个排序字段
 *
 * 优先级: 主键 > 唯一索引 > 索引 > 普通字段
 * 普通字段的优先级: 数值、日期/时间类型 > 字符串类型(按字符的编码排序, 比如 UTF-8)
 * BOOLEAN 不能用, JSON 或复杂类型 行为可能未定义或不符合预期
 *
 * @param tsa 表结构数据
 */
export function getDefultOrderField(tsa: FieldStructure[]) {
  // 优先使用索引字段
  for (const f of tsa) {
    // 主键
    if (f.isPrimaryKey) {
      return f.name;
    }

    // 唯一索引
    if (f.isUniqueKey) {
      return f.name;
    }
  }

  // 找不到索引字段的, 找数字或时间字段
  // 找数字字段
  for (const f of tsa) {
    if (
      f.type.includes("int") ||
      f.type.includes("float") ||
      f.type.includes("serial") ||
      f.type.includes("numeric") ||
      f.type.includes("decimal") ||
      f.type.includes("real") ||
      f.type.includes("double") ||
      f.type.includes("money")
    ) {
      return f.name;
    }
  }
  // 找时间字段
  for (const f of tsa) {
    if (f.type.includes("time") || f.type.includes("date")) {
      return f.name;
    }
  }

  // 找字符串字段
  // 找不到索引字段的, 也找数字或时间字段, 找字符串字段
  for (const f of tsa) {
    if (f.type.includes("text") || f.type.includes("char")) {
      return f.name;
    }
  }

  return "";
}

// 匹配 色了传统语句里 where 及之后的部分
export function extractConditionClause(sql: string) {
  const res = {
    tableName: "",
    condition: "",
  };

  if (RE_IS_SINGLET_QUERY.test(sql)) {
    const match = sql.match(RE_WHERE_CLAUSE);

    if (match) {
      res.tableName = match[1];
      res.condition = match[2] ? match[2] : "";
    }
  }

  return res;
}

export function modifyTableData(
  deletedSet: Set<number>,
  changes: TableDataChange[],
  tableData: RowData[],
  addedRows: RowData[],
) {
  const tbName = coreState.currentTableName;

  // 处理变更数据的行
  const rowDataMap = new Map<number, TableDataChange[]>();
  for (const c of changes) {
    // 是删除的行的 index 不处理
    if (deletedSet.has(c.index)) continue;

    if (rowDataMap.has(c.index)) {
      rowDataMap.get(c.index)!.push(c);
    } else {
      rowDataMap.set(c.index, [c]);
    }
  }

  const sqls: string[] = [];
  rowDataMap.forEach((changes, rowIndex) => {
    const uniqueField: FieldWithValue = {
      field: coreState.uniqueFieldName,
      value: tableData[rowIndex][coreState.uniqueFieldName],
    };
    const fieldArr: FieldWithValue[] = [];
    for (const c of changes) {
      fieldArr.push({
        field: c.field,
        value: c.new,
      });
    }

    if (fieldArr.length > 0) sqls.push(genUpdateFieldCmd(tbName, uniqueField, fieldArr));
  });

  // 处理删除行
  const arr = []; // 要删除的唯一字段(主键或唯一索引)的值
  for (let index = 0; index < tableData.length; index++) {
    const row = tableData[index];
    if (deletedSet.has(index)) {
      arr.push(row[coreState.uniqueFieldName]);
    }
  }
  if (arr.length > 0) sqls.push(genDeleteRowsCmd(tbName, coreState.uniqueFieldName, arr));

  // 处理新添加的行
  if (addedRows.length > 0) {
    const fieldNames = Object.keys(addedRows[0]).filter((item) => item !== NEW_ROW_IS_ADDED_FIELD);
    const values: any[][] = [];
    for (const r of addedRows) {
      values.push(fieldNames.map((item) => r[item].value));
    }

    sqls.push(genInsertRowsCmd(tbName, fieldNames, values));
  }

  return sqls;
}
