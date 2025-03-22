import { GetTableDataParam } from "../types";
import { invoker } from "./invoke";

/**
 * 连接到 postgre_sql
 * 连接字符串, 类似 "host=localhost user=postgres password=yourpassword dbname=testdb"
 *
 * TODO: 支持 tls
 *
 */
export async function connect(p: PostgresConnectionParams) {
  return await invoker.connect(
    `host=${p.host} port=${p.port} user=${p.user} password=${p.password} dbname=${p.dbname}`,
  );
}

// 获取所有表格名
export async function getAllTables() {
  const sql = `
    SELECT 
        tablename 
    FROM 
        pg_catalog.pg_tables 
    WHERE 
        schemaname NOT IN ('pg_catalog', 'information_schema')
    ;`;

  const dbRes = await invoker.query(sql);

  // 整理成以为数组
  const data = JSON.parse(dbRes.data) as { tablename: string }[];

  return {
    columnName: JSON.parse(dbRes.columnName) as string[],
    data: data.map((item) => item.tablename),
  };
}

// 获取表格数据
export async function getTableData(params: GetTableDataParam) {
  const sql = `
    SELECT 
        tablename 
    FROM 
        pg_catalog.pg_tables 
    WHERE 
        schemaname NOT IN ('pg_catalog', 'information_schema')
    ;`;

  const dbRes = await invoker.query(sql);

  // 整理成以为数组
  const data = JSON.parse(dbRes.data) as { tablename: string }[];

  return {
    columnName: JSON.parse(dbRes.columnName) as string[],
    data: data.map((item) => item.tablename),
  };
}
