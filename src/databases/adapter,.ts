import { DB_TYPE_MYSQL, DB_TYPE_POSTGRESQL, DB_TYPE_SQLITE } from "@/constants";
import {
  connectPg,
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
import { coreStore } from "@/store";
import { genAlterCmdPg } from "./PostgreSQL/alter";
import { ColumnAlterAction, DbConnectionParam, GetTableDataParam } from "./types";

// 连接数据库的参数不同, 直接调用各自目录里的

/**
 * postgres://user:pass@host:port/db  # PostgreSQL
 * mysql://user:pass@host:port/db     # MySQL
 * sqlite:///path/to/database.db      # SQLite
 */

// 获取所有表名
export async function connect(p: DbConnectionParam) {
  const dbType = coreStore.getState().currentDbType;
  const connName = coreStore.getState().currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return connectPg(connName, p);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

/**
 *
 * @param dbType
 * @returns
 */

// 获取所有表名
export async function getAllTableName() {
  const dbType = coreStore.getState().currentDbType;
  const connName = coreStore.getState().currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getAllTableNamePg(connName);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取所有表格的大小
export async function getAllTableSize() {
  const dbType = coreStore.getState().currentDbType;
  const connName = coreStore.getState().currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getAllTableSizePg(connName);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取表格数据
export async function getTableStructure(tbName: string) {
  const dbType = coreStore.getState().currentDbType;
  const connName = coreStore.getState().currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getTableStructurePg(connName, tbName);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取表格的 DDL
export async function getTableDdl(tbName: string) {
  const dbType = coreStore.getState().currentDbType;
  const connName = coreStore.getState().currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getTableDdlPg(connName, tbName);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取表格数据
export async function getTableData(params: GetTableDataParam) {
  const dbType = coreStore.getState().currentDbType;
  const connName = coreStore.getState().currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getTableDataPg(connName, params);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 生成重命名表格的语句
export function exec(sql: string) {
  const dbType = coreStore.getState().currentDbType;
  const connName = coreStore.getState().currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return execPg(connName, sql);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:

  return "";
}

// 生成重命名表格的语句
export function genRenameTableCmd(oldName: string, newName: string) {
  const dbType = coreStore.getState().currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genRenameTableCmdPg(oldName, newName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成截断表格的语句
export function genTruncateTableCmd(tbName: string) {
  const dbType = coreStore.getState().currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genTruncateTableCmdPg(tbName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成删除表格的语句
export function genDeleteTableCmd(tbName: string) {
  const dbType = coreStore.getState().currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genDeleteTableCmdPg(tbName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成删除表格的语句
export function genRenameFieldCmd(tbName: string, oldName: string, newName: string) {
  const dbType = coreStore.getState().currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genRenameFieldCmdPg(tbName, oldName, newName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成删除表格的语句
export function genDeleteFieldCmd(tbName: string, fieldName: string) {
  const dbType = coreStore.getState().currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genDeleteFieldCmdPg(tbName, fieldName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成建表语句
// FIXME: 实现功能
export function genCreateTableCmd(tbName: string) {
  const dbType = coreStore.getState().currentDbType;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genCreateTableCmdPg(tbName);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:

  return "";
}

// 生成修改语句
export function genAlterCmd(val: ColumnAlterAction[]) {
  const dbType = coreStore.getState().currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genAlterCmdPg(val);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}
