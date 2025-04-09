import { DB_MYSQL, DB_POSTGRESQL, DB_SQLITE } from "@/constants";
import {
  connectPg,
  genDeleteFieldCmdPg,
  genDeleteRowsCmdPg,
  genDeleteTableCmdPg,
  genInsertRowsCmdPg,
  genRenameFieldCmdPg,
  genRenameTableCmdPg,
  genTruncateTableCmdPg,
  genUpdateFieldCmdPg,
  getAllTableNamePg,
  getAllTableSizePg,
  getTableDataPg,
  getTableDdlPg,
  getTableStructurePg,
} from "@/databases/PostgreSQL/sql";
import { invoker } from "@/invoker";
import { appState } from "@/store/valtio";
import { fieldTypeOptionsMysql } from "./MySQL/select_options";
import { genAlterCmdPg } from "./PostgreSQL/alter_table";
import { getDataTypeCategoryPg } from "./PostgreSQL/icon";
import { fieldTypeOptionsPg } from "./PostgreSQL/select_options";
import { genAlterCmdSqlite } from "./SQLite/alter_table";
import { getDataTypeCategorySqlite } from "./SQLite/icon";
import { fieldTypeOptionsSqlite } from "./SQLite/select_options";
import {
  connectSqlite,
  genDeleteFieldCmdSqlite,
  genDeleteRowsCmdSqlite,
  genDeleteTableCmdSqlite,
  genInsertRowsCmdSqlite,
  genRenameFieldCmdSqlite,
  genRenameTableCmdSqlite,
  genTruncateTableCmdSqlite,
  genUpdateFieldCmdSqlite,
  getAllTableNameSqlite,
  getAllTableSizeSqlite,
  getTableDataSqlite,
  getTableDdlSqlite,
  getTableStructureSqlite,
} from "./SQLite/sql";
import { AllAlterAction, DbConnectionParam, FieldWithValue, GetTableDataParam } from "./types";

// 连接数据库
export async function connect(p: DbConnectionParam) {
  const { currentDbType, currentConnName } = appState;

  if (currentDbType === DB_MYSQL) return; // TODO:
  if (currentDbType === DB_POSTGRESQL) return connectPg(currentConnName, p);
  if (currentDbType === DB_SQLITE) return connectSqlite(currentConnName, p);
}

// 断开数据库
export async function disconnect(currentConnName: string) {
  return await invoker.disconnectSql(currentConnName);
}

// 查询语句
export async function query(sql: string, streaming?: boolean, page?: number, pageSize?: number) {
  const { currentConnName } = appState;
  return await invoker.querySql(currentConnName, sql, streaming, page, pageSize);
}

// 执行语句
export async function exec(sql: string) {
  const { currentConnName } = appState;
  return await invoker.execSql(currentConnName, sql);
}

// 执行语句
export async function execMany(sql: string) {
  const { currentConnName } = appState;
  return await invoker.execManySql(currentConnName, sql);
}

// 获取所有表名
export async function getAllTableName() {
  const { currentDbType, currentConnName } = appState;

  if (currentDbType === DB_MYSQL) return; // TODO:
  if (currentDbType === DB_POSTGRESQL) return getAllTableNamePg(currentConnName);
  if (currentDbType === DB_SQLITE) return getAllTableNameSqlite(currentConnName);
}

// 获取所有表格的大小
export async function getAllTableSize() {
  const { currentDbType, currentConnName } = appState;

  if (currentDbType === DB_MYSQL) return; // TODO:
  if (currentDbType === DB_POSTGRESQL) return getAllTableSizePg(currentConnName);
  if (currentDbType === DB_SQLITE) return getAllTableSizeSqlite(currentConnName);
}

// 获取表格数据
export async function getTableStructure(tbName: string) {
  const { currentDbType, currentConnName } = appState;

  if (currentDbType === DB_MYSQL) return; // TODO:
  if (currentDbType === DB_POSTGRESQL) return getTableStructurePg(currentConnName, tbName);
  if (currentDbType === DB_SQLITE) return getTableStructureSqlite(currentConnName, tbName);
}

// 获取表格的 DDL
export async function getTableDdl(tbName: string) {
  const { currentDbType, currentConnName } = appState;

  if (currentDbType === DB_MYSQL) return; // TODO:
  if (currentDbType === DB_POSTGRESQL) return getTableDdlPg(currentConnName, tbName);
  if (currentDbType === DB_SQLITE) return getTableDdlSqlite(currentConnName, tbName);
}

// 获取表格数据
export async function getTableData(params: GetTableDataParam) {
  const { currentDbType, currentConnName } = appState;

  if (currentDbType === DB_MYSQL) return; // TODO:
  if (currentDbType === DB_POSTGRESQL) return getTableDataPg(currentConnName, params);
  if (currentDbType === DB_SQLITE) return getTableDataSqlite(currentConnName, params);
}

// 生成重命名表格的语句
export function genRenameTableCmd(oldName: string, newName: string) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return genRenameTableCmdPg(oldName, newName);
  if (currentDbType === DB_SQLITE) return genRenameTableCmdSqlite(oldName, newName);

  return "";
}

// 生成截断表格的语句
export function genTruncateTableCmd(tbName: string) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return genTruncateTableCmdPg(tbName);
  if (currentDbType === DB_SQLITE) return genTruncateTableCmdSqlite(tbName);

  return "";
}

// 生成删除表格的语句
export function genDeleteTableCmd(tbName: string) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return genDeleteTableCmdPg(tbName);
  if (currentDbType === DB_SQLITE) return genDeleteTableCmdSqlite(tbName);

  return "";
}

// 生成删除表格的语句
export function genRenameFieldCmd(tbName: string, oldName: string, newName: string) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return genRenameFieldCmdPg(tbName, oldName, newName);
  if (currentDbType === DB_SQLITE) return genRenameFieldCmdSqlite(tbName, oldName, newName);

  return "";
}

// 生成删除表格的语句
export function genDeleteFieldCmd(tbName: string, fieldName: string) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return genDeleteFieldCmdPg(tbName, fieldName);
  if (currentDbType === DB_SQLITE) return genDeleteFieldCmdSqlite(tbName, fieldName);

  return "";
}

// 生成修改语句
export function genAlterCmd(val: AllAlterAction[]) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return genAlterCmdPg(val);
  if (currentDbType === DB_SQLITE) return genAlterCmdSqlite(val);

  return "";
}

// 生成变更一行的字段
export function genUpdateFieldCmd(tbName: string, uniqueField: FieldWithValue, fieldArr: FieldWithValue[]) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return genUpdateFieldCmdPg(tbName, uniqueField, fieldArr);
  if (currentDbType === DB_SQLITE) return genUpdateFieldCmdSqlite(tbName, uniqueField, fieldArr);

  return "";
}

// 生成删除多行的字段
export function genDeleteRowsCmd(tbName: string, fieldName: string, fieldValues: any[]) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return genDeleteRowsCmdPg(tbName, fieldName, fieldValues);
  if (currentDbType === DB_SQLITE) return genDeleteRowsCmdSqlite(tbName, fieldName, fieldValues);

  return "";
}

// 生成插入多行数据
export function genInsertRowsCmd(tbName: string, fieldNames: string[], fieldValues: any[]) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return genInsertRowsCmdPg(tbName, fieldNames, fieldValues);
  if (currentDbType === DB_SQLITE) return genInsertRowsCmdSqlite(tbName, fieldNames, fieldValues);

  return "";
}

// 根据数据类型名称返回对应的分类常量
export function getDataTypeCategory(val: string) {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return ""; // TODO:
  if (currentDbType === DB_POSTGRESQL) return getDataTypeCategoryPg(val);
  if (currentDbType === DB_SQLITE) return getDataTypeCategorySqlite(val);

  return "";
}

// 字段外形的下拉选项
export function fieldTypeOptions() {
  const { currentDbType } = appState;

  if (currentDbType === DB_MYSQL) return fieldTypeOptionsMysql;
  if (currentDbType === DB_POSTGRESQL) return fieldTypeOptionsPg;
  if (currentDbType === DB_SQLITE) return fieldTypeOptionsSqlite;

  return [];
}
