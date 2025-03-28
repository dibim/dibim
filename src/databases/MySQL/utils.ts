import { CommonSQLValue } from "../types";
import { formatToSqlValueCommon } from "../utils";
import { invoker } from "./invoke";

const testConnName = "testPg";

// MySQL 特有类型处理
export function formatMySQLValue(value: unknown): string {
  try {
    return formatToSqlValueCommon(value as CommonSQLValue);
  } catch {
    // 处理MySQL特有类型
    if (value instanceof Uint8Array) {
      return `0x${Buffer.from(value).toString("hex")}`;
    }

    if (typeof value === "object" && value !== null) {
      // JSON类型
      return `CAST('${JSON.stringify(value)}' AS JSON)`;
    }

    throw new Error(`Unsupported MySQL type: ${typeof value}`);
  }
}

// 获取表结构
export async function getTableStructureMysql(tbName: string) {
  const sql = `
    SELECT *
    FROM information_schema.columns
    WHERE table_name = '${tbName}';
    ;`;

  const dbRes = await invoker.query(testConnName, sql);

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [],
  };
}
