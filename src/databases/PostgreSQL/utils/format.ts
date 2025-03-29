import { CommonSQLValue } from "../../types";
import { formatToSqlValueCommon } from "../../utils";
import { PGValue } from "../types";

/**
 * 判断是否是PostgreSQL函数调用的形式
 * 函数名：PostgreSQL 必须 带括号（如 now() 合法，但 now 不合法）
 * 字符串引号：PostgreSQL 支持单引号 'str'（字符串值）和双引号 "str"（标识符引用）
 * 特殊函数：PostgreSQL 包含特有函数（如 jsonb_set()、regexp_match()）
 * @param str
 * @returns
 */
export function isPostgresFunctionCall(str: string): boolean {
  return /^[a-z_][a-z0-9_]*\(.*\)$/i.test(str);
}

/**
 * 格式化 PostgreSQL 的数据类型
 * @param value
 * @param allowFuncAcll 是否允许函数调用的形式
 * @returns
 */
export function formatToSqlValuePg(value: PGValue, allowFuncAcll?: boolean): string {
  // 首先检查是否是调用 PostgreSQL 函数
  if (allowFuncAcll && typeof value === "string" && isPostgresFunctionCall(value)) {
    return value;
  }

  // 尝试通用格式化
  try {
    return formatToSqlValueCommon(value as CommonSQLValue);
  } catch (e) {
    // 如果通用格式化失败，继续处理 PG 特有类型
  }

  // 处理 PostgreSQL 特有类型
  if (value instanceof Uint8Array) {
    return `'\\x${Buffer.from(value).toString("hex")}'`; // bytea 格式
  }

  if (value instanceof RegExp) {
    return `'${value.source}'`; // 将正则转换为其字符串形式
  }

  if (value instanceof Map) {
    return formatToSqlValuePg(Object.fromEntries(value)); // 转换为 JSON 对象
  }

  if (value instanceof Set) {
    return formatToSqlValuePg([...value]); // 转换为数组
  }

  // 处理 JSON/JSONB 类型
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return `'${JSON.stringify(value)}'::jsonb`;
  }

  // 处理 PostgreSQL 数组类型（多维数组）
  if (Array.isArray(value)) {
    const formattedArray = value
      .map((v) => {
        // 特殊处理数组中的 null 值
        if (v === null) return "NULL";

        // 递归格式化每个元素
        const element = formatToSqlValuePg(v);

        // 处理元素中的引号和转义
        return typeof v === "string" ? `"${element.replace(/"/g, '""')}"` : element;
      })
      .join(", ");

    return `ARRAY[${formattedArray}]`;
  }

  // 默认处理（不应执行到这里）
  throw new Error(`Unsupported PostgreSQL type: ${typeof value}`);
}
