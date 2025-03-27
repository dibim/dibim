import { DB_TYPE_MYSQL, DB_TYPE_POSTGRESQL, DB_TYPE_SQLITE } from "@/constants";
import {
  execPg,
  genCreateTableCmdPg,
  genDeleteFieldCmdPg,
  genDeleteTableCmdPg,
  genRenameFieldCmdPg,
  genRenameTableCmdPg,
  genTruncateTableCmdPg,
  getAllTableNamePg,
  getAllTableSizePg,
  getTableDataPg,
  getTableDdlPg,
  getTableStructurePg,
} from "@/databases/PostgreSQL/utils";
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

// 获取所有表名
export async function getAllTableName(dbType: DbType) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return getAllTableNamePg();

  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取所有表格的大小
export async function getAllTableSize(dbType: DbType) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return getAllTableSizePg();

  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取表格数据
export async function getTableStructure(dbType: DbType, tbName: string) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return getTableStructurePg(tbName);

  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取表格的 DDL
export async function getTableDdl(dbType: DbType, tbName: string) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return getTableDdlPg(tbName);

  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取表格数据
export async function getTableData(dbType: DbType, params: GetTableDataParam) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return getTableDataPg(params);

  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 生成重命名表格的语句
export function exec(dbType: DbType, sql: string) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return execPg(sql);

  if (dbType === DB_TYPE_SQLITE) return; // TODO:

  return "";
}

// 生成重命名表格的语句
export function genRenameTableCmd(dbType: DbType, oldName: string, newName: string) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) {
    return genRenameTableCmdPg(oldName, newName);
  }
  if (dbType === DB_TYPE_SQLITE) return; // TODO:

  return "";
}

// 生成截断表格的语句
export function genTruncateTableCmd(dbType: DbType, tbName: string) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return genTruncateTableCmdPg(tbName);

  if (dbType === DB_TYPE_SQLITE) return; // TODO:

  return "";
}

// 生成删除表格的语句
export function genDeleteTableCmd(dbType: DbType, tbName: string) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return genDeleteTableCmdPg(tbName);

  if (dbType === DB_TYPE_SQLITE) return; // TODO:

  return "";
}

// 生成删除表格的语句
export function genRenameFieldCmd(dbType: DbType, tbName: string, oldName: string, newName: string) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return genRenameFieldCmdPg(tbName, oldName, newName);

  if (dbType === DB_TYPE_SQLITE) return; // TODO:

  return "";
}

// 生成删除表格的语句
export function genDeleteFieldCmd(dbType: DbType, tbName: string, fieldName: string) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return genDeleteFieldCmdPg(tbName, fieldName);

  if (dbType === DB_TYPE_SQLITE) return; // TODO:

  return "";
}

// 生成建表语句
// FIXME: 实现功能
export function genCreateTableCmd(dbType: DbType, tbName: string) {
  if (dbType === DB_TYPE_MYSQL) return; // TODO:

  if (dbType === DB_TYPE_POSTGRESQL) return genCreateTableCmdPg(tbName);

  if (dbType === DB_TYPE_SQLITE) return; // TODO:

  return "";
}
