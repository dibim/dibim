import { DbConnectionParams, GetTableDataParam } from "../types";
import { invoker } from "./invoke";

const testConnName = "testPg";

/**
 * 连接到 postgre_sql
 *
 * "postgres://user:password@localhost:5432/mydb?sslmode=require";
 *
 *
 */
export async function connect(p: DbConnectionParams) {
  return await invoker.connect(
    testConnName,
    // `host=${p.host} port=${p.port} user=${p.user} password=${p.password} dbname=${p.dbname}`,
    `postgres://${p.user}:${p.password}@${p.host}:${p.port}/${p.dbname}`,
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

  const dbRes = await invoker.query(testConnName, sql);

  // 把表名整理成一维数组
  const dataArr = dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [];

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dataArr.map((item) => item.tablename),
  };
}

// 获取表格数据
export async function getTableData(p: GetTableDataParam) {
  // TODO: 添加分页
  const sql = `
    SELECT * 
    FROM ${p.tableName}
    ${p.orderBy ? "ORDER BY " + p.orderBy : ""}
    LIMIT ${p.pageSize}
    ;`;

  const dbRes = await invoker.query(testConnName, sql);

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [],
  };
}
