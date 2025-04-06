import { reIsSingletQuery, reWhereClause } from "@/constants";
import { FieldStructure, SqlValueCommon } from "./types";

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

  if (reIsSingletQuery.test(sql)) {
    const match = sql.match(reWhereClause);

    if (match) {
      res.tableName = match[1];
      res.condition = match[2] ? match[2] : "";
    }
  }

  return res;
}
