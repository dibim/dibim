import { invoker } from "@/invoker";
import { SqlValueCommon } from "../types";
import { formatToSqlValueCommon } from "../utils";

const testConnName = "testPg";

/**
 * 判断是否是函数调用的形式
 * 函数名：MySQL 允许函数名不加括号（如 NOW 和 NOW() 都合法）
 * 反引号：MySQL 允许使用反引号 ` 包裹标识符（如 `column`）
 * 字符串引号：MySQL 支持单引号 'str' 和双引号 "str"（取决于 ANSI_QUOTES 模式）
 * @param str
 * @returns
 */
export function isMySQLFunctionCall(str: string): boolean {
  return /^[a-z_][a-z0-9_]*(\s*\(.*\))?$/i.test(str);
}

// MySQL 特有类型处理
export function formatMySQLValue(value: unknown): string {
  try {
    return formatToSqlValueCommon(value as SqlValueCommon);
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

  const dbRes = await invoker.querySql(testConnName, sql);

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [],
  };
}
