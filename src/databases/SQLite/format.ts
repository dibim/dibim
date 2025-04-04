import { CommonSQLValue } from "../types";
import { formatToSqlValueCommon } from "../utils";

/**
 * 判断是否是函数调用的形式
 * 函数名：SQLite 必须 带括号（如 date() 合法，但 date 不合法）
 * 字符串引号：SQLite 支持单引号 'str' 和双引号 "str"（双引号通常用于列名）
 * 特殊函数：SQLite 有一些独特函数（如 json_extract()、regexp()）
 * @param str
 * @returns
 */
export function isSqliteFunctionCall(str: string): boolean {
  return /^[a-z_][a-z0-9_]*\s*\(.*\)$/i.test(str);
}

/**
 * 格式化  SQLite 的数据类型
 * @param value
 * @param allowFuncAcll 是否允许函数调用的形式
 * @returns
 */
export function formatToSqlValueSqlite(value: CommonSQLValue, allowFuncAcll?: boolean): string {
  // 首先检查是否是调用 PostgreSQL 函数
  if (allowFuncAcll && typeof value === "string" && isSqliteFunctionCall(value)) {
    return value;
  }

  try {
    return formatToSqlValueCommon(value);
  } catch {
    // SQLite的特殊处理较少，主要处理BLOB
    if (value instanceof Uint8Array) {
      return `X'${Buffer.from(value).toString("hex")}'`;
    }

    // SQLite没有专门的JSON类型，但可以存储为TEXT
    if (typeof value === "object" && value !== null) {
      return `'${JSON.stringify(value)}'`;
    }

    throw new Error(`Unsupported SQLite type: ${typeof value}`);
  }
}
