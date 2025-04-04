import { CommonSQLValue } from "../types";
import { formatToSqlValueCommon } from "../utils";
import { PGValue } from "./types";

/**
 * 判断是否是 SQLite函数调用的形式
 * 函数名： SQLite 必须 带括号（如 now() 合法，但 now 不合法）
 * 字符串引号： SQLite 支持单引号 'str'（字符串值）和双引号 "str"（标识符引用）
 * 特殊函数： SQLite 包含特有函数（如 jsonb_set()、regexp_match()）
 * @param str
 * @returns
 */
export function isPostgresFunctionCall(str: string): boolean {
  return /^[a-z_][a-z0-9_]*\(.*\)$/i.test(str);
}

/**
 * 格式化  SQLite 的数据类型
 * @param value
 * @param allowFuncAcll 是否允许函数调用的形式
 * @returns
 */
export function formatToSqlValueSqlite(value: PGValue, allowFuncAcll?: boolean): string {
  try {
    return formatToSqlValueCommon(value as CommonSQLValue);
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
