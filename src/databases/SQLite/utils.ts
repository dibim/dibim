import { invoker } from "./invoke";

const testConnName = "testPg";

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
