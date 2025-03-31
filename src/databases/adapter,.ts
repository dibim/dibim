import { useSnapshot } from "valtio";
import { DB_TYPE_MYSQL, DB_TYPE_POSTGRESQL, DB_TYPE_SQLITE } from "@/constants";
import {
  connectPg,
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
} from "@/databases/PostgreSQL/utils/sql";
import { invoker } from "@/invoker";
import { appState } from "@/store/valtio";
import { genAlterCmdPg } from "./PostgreSQL/utils/alter";
import { getDataTypeCategoryPg } from "./PostgreSQL/utils/icon";
import { AllAlterAction, DbConnectionParam, GetTableDataParam } from "./types";

// 连接数据库
export async function connect(p: DbConnectionParam) {
  const dbType = appState.currentDbType;
  const connName = appState.currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return connectPg(connName, p);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 断开数据库
export async function disconnect(connName: string) {
  return await invoker.disconnectSql(connName);
}

// 查询语句
export async function query(sql: string, streaming?: boolean, page?: number, pageSize?: number) {
  const connName = appState.currentConnName;
  return await invoker.querySql(connName, sql, streaming, page, pageSize);
}

// 执行语句
export async function exec(sql: string) {
  const connName = appState.currentConnName;
  return await invoker.execSql(connName, sql);
}

// 获取所有表名
export async function getAllTableName() {
  const dbType = appState.currentDbType;
  const connName = appState.currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getAllTableNamePg(connName);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取所有表格的大小
export async function getAllTableSize() {
  const dbType = appState.currentDbType;
  const connName = appState.currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getAllTableSizePg(connName);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取表格数据
export async function getTableStructure(tbName: string) {
  const dbType = appState.currentDbType;
  const connName = appState.currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getTableStructurePg(connName, tbName);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取表格的 DDL
export async function getTableDdl(tbName: string) {
  const dbType = appState.currentDbType;
  const connName = appState.currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getTableDdlPg(connName, tbName);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 获取表格数据
export async function getTableData(params: GetTableDataParam) {
  const dbType = appState.currentDbType;
  const connName = appState.currentConnName;

  if (dbType === DB_TYPE_MYSQL) return; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getTableDataPg(connName, params);
  if (dbType === DB_TYPE_SQLITE) return; // TODO:
}

// 生成重命名表格的语句
export function genRenameTableCmd(oldName: string, newName: string) {
  const dbType = appState.currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genRenameTableCmdPg(oldName, newName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成截断表格的语句
export function genTruncateTableCmd(tbName: string) {
  const dbType = appState.currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genTruncateTableCmdPg(tbName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成删除表格的语句
export function genDeleteTableCmd(tbName: string) {
  const dbType = appState.currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genDeleteTableCmdPg(tbName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成删除表格的语句
export function genRenameFieldCmd(tbName: string, oldName: string, newName: string) {
  const dbType = appState.currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genRenameFieldCmdPg(tbName, oldName, newName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成删除表格的语句
export function genDeleteFieldCmd(tbName: string, fieldName: string) {
  const dbType = appState.currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genDeleteFieldCmdPg(tbName, fieldName);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 生成修改语句
export function genAlterCmd(val: AllAlterAction[]) {
  const dbType = appState.currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return genAlterCmdPg(val);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}

// 根据数据类型名称返回对应的分类常量
export function getDataTypeCategory(val: string) {
  const dbType = appState.currentDbType;

  if (dbType === DB_TYPE_MYSQL) return ""; // TODO:
  if (dbType === DB_TYPE_POSTGRESQL) return getDataTypeCategoryPg(val);
  if (dbType === DB_TYPE_SQLITE) return ""; // TODO:

  return "";
}
