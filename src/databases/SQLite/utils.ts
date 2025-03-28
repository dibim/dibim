import { CommonSQLValue } from "../types";
import { formatSQLValueCommon } from "../utils";
import { invoker } from "./invoke";

const testConnName = "testPg";

// SQLite 特有类型处理
export function formatSQLiteValue(value: unknown): string {
  try {
    return formatSQLValueCommon(value as CommonSQLValue);
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
