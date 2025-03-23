import { DB_TYPE_MY_SQL, DB_TYPE_POSTGRES_SQL, DB_TYPE_SQLITE } from "@/constants";
import { getAllTables as getAllTablesPg, getTableData as getTableDataPg } from "@/databases/PostgreSQL/utils";
import { DbType } from "@/types/types";
import { GetTableDataParam } from "./types";

// 连接数据库的参数不同, 直接调用各自目录里的


/**
 * postgres://user:pass@host:port/db  # PostgreSQL
 * mysql://user:pass@host:port/db     # MySQL
 * sqlite:///path/to/database.db      # SQLite
 */

/**
 * 
 * @param dbType 
 * @returns 
 */

// 获取所有表格名
export async function getAllTables(dbType: DbType) {
  if (dbType === DB_TYPE_MY_SQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRES_SQL) {
    return getAllTablesPg();
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}

// 获取表格数据
export async function getTableData(dbType: DbType, params: GetTableDataParam) {
  if (dbType === DB_TYPE_MY_SQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRES_SQL) {
    return getTableDataPg(params);
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}
