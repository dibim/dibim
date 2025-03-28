import { CommonSQLValue } from "./types";

/**
 * 类型守卫函数
 * 类型和 formatSQLValueCommon 一致
 * @param value
 * @returns
 */
export function isCommonSQLValue(value: unknown): value is CommonSQLValue {
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
export function formatToSqlValueCommon(value: CommonSQLValue): string {
  // 处理空值
  if (value == null) return "NULL";

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

