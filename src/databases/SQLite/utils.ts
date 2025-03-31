import { invoker } from "@/invoker";
import { CommonSQLValue } from "../types";
import { formatToSqlValueCommon } from "../utils";

const testConnName = "testPg";

/**
 * 判断是否是函数调用的形式
 * 函数名：SQLite 必须 带括号（如 date() 合法，但 date 不合法）
 * 字符串引号：SQLite 支持单引号 'str' 和双引号 "str"（双引号通常用于列名）
 * 特殊函数：SQLite 有一些独特函数（如 json_extract()、regexp()）
 * @param str
 * @returns
 */
export function isSQLiteFunctionCall(str: string): boolean {
  return /^[a-z_][a-z0-9_]*\s*\(.*\)$/i.test(str);
}

// SQLite 特有类型处理
export function formatSQLiteValue(value: unknown): string {
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

// 获取表结构
export async function getTableStructurePg(tbName: string) {
  const sql = `
  SELECT sql 
  FROM sqlite_master 
  WHERE type = 'table' AND name = '${tbName}';`;

  const dbRes = await invoker.query(testConnName, sql);

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [],
  };
}
