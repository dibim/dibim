import { BuilderPg } from "@/databases/postgresql/builder";
import { invoker } from "@/invoker";
import { coreState } from "@/store/core";
import { DB_MYSQL, DB_POSTGRESQL, DB_SQLITE } from "./constants";
import { getDataTypeCategoryMysql } from "./mysql/icon";
import { fieldTypeOptionsMysql } from "./mysql/select_options";
import { BuilderMysql } from "./mysql/builder";
import { getDataTypeCategoryPg } from "./postgresql/icon";
import { fieldTypeOptionsPg } from "./postgresql/select_options";
import { getDataTypeCategorySqlite } from "./sqlite/icon";
import { fieldTypeOptionsSqlite } from "./sqlite/select_options";
import { BuilderSqilte } from "./sqlite/builder";
import { AllAlterAction, DbConnectionParam, FieldWithValue, GetTableDataParam } from "./types";

// 连接数据库
export async function connect(p: DbConnectionParam) {
  const { currentConnType, currentConnName } = coreState;
  if (currentConnType === DB_MYSQL) return BuilderMysql.connect(currentConnName, p);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.connect(currentConnName, p);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.connect(currentConnName, p);
}

// 断开数据库
export async function disconnect(currentConnName: string) {
  return await invoker.disconnectSql(currentConnName);
}

// 查询语句
export async function query(sql: string, streaming?: boolean, page?: number, pageSize?: number) {
  const { currentConnName } = coreState;
  return await invoker.querySql(currentConnName, sql, streaming, page, pageSize);
}

// 执行语句
export async function exec(sql: string) {
  const { currentConnName } = coreState;
  return await invoker.execSql(currentConnName, sql);
}

// 执行语句
export async function execMany(sql: string) {
  const { currentConnName } = coreState;
  return await invoker.execManySql(currentConnName, sql);
}

// 获取所有表名
export async function getAllTableName() {
  const { currentConnType, currentConnName } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.getAllTableName(currentConnName);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.getAllTableName(currentConnName);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.getAllTableName(currentConnName);
}

// 获取所有表格的大小
export async function getAllTableSize() {
  const { currentConnType, currentConnName } = coreState;
  if (currentConnType === DB_MYSQL) return BuilderMysql.getAllTableSize(currentConnName);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.getAllTableSize(currentConnName);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.getAllTableSize(currentConnName);
}

// 获取表表结构
export async function getTableStructure(tbName: string) {
  const { currentConnType, currentConnName } = coreState;

  if (currentConnType === DB_MYSQL) BuilderMysql.getTableStructure(currentConnName, tbName);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.getTableStructure(currentConnName, tbName);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.getTableStructure(currentConnName, tbName);
}

// 获取表格的 DDL
export async function getTableDdl(tbName: string) {
  const { currentConnType, currentConnName } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.getTableDdl(currentConnName, tbName);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.getTableDdl(currentConnName, tbName);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.getTableDdl(currentConnName, tbName);
}

// 获取分页的统计
export async function getPageCount(connName: string, tableName: string, pageSize: number, condition: string) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.getPageCount(connName, tableName, pageSize, condition);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.getPageCount(connName, tableName, pageSize, condition);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.getPageCount(connName, tableName, pageSize, condition);
}

// 获取表格数据
export async function getTableData(params: GetTableDataParam) {
  const { currentConnType, currentConnName } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.getTableData(currentConnName, params);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.getTableData(currentConnName, params);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.getTableData(currentConnName, params);
}

// 生成重命名表格的语句
export function genRenameTableCmd(oldName: string, newName: string) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.genRenameTableCmd(oldName, newName);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genRenameTableCmd(oldName, newName);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genRenameTableCmd(oldName, newName);

  return "";
}

// 生成截断表格的语句
export function genTruncateTableCmd(tbName: string) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.genTruncateTableCmd(tbName);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genTruncateTableCmd(tbName);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genTruncateTableCmd(tbName);

  return "";
}

// 生成删除表格的语句
export function genDeleteTableCmd(tbName: string) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.genDeleteTableCmd(tbName);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genDeleteTableCmd(tbName);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genDeleteTableCmd(tbName);

  return "";
}

// 生成删除表格的语句
export function genRenameFieldCmd(tbName: string, oldName: string, newName: string) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.genRenameFieldCmd(tbName, oldName, newName);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genRenameFieldCmd(tbName, oldName, newName);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genRenameFieldCmd(tbName, oldName, newName);

  return "";
}

// 生成删除表格的语句
export function genDeleteFieldCmd(tbName: string, fieldName: string) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.genDeleteFieldCmd(tbName, fieldName);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genDeleteFieldCmd(tbName, fieldName);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genDeleteFieldCmd(tbName, fieldName);

  return "";
}

// 生成修改语句
export function genAlterCmd(val: AllAlterAction[]) {
  const { currentConnType } = coreState;

  // if (currentConnType === DB_MYSQL) return GeneratorMysql.genAlterCmd(val); // TODO:
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genAlterCmd(val);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genAlterCmd(val);

  return "";
}

// 生成变更一行的字段
export function genUpdateFieldCmd(tbName: string, uniqueField: FieldWithValue, fieldArr: FieldWithValue[]) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.genUpdateFieldCmd(tbName, uniqueField, fieldArr);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genUpdateFieldCmd(tbName, uniqueField, fieldArr);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genUpdateFieldCmd(tbName, uniqueField, fieldArr);

  return "";
}

// 生成删除多行的字段
export function genDeleteRowsCmd(tbName: string, fieldName: string, fieldValues: any[]) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.genDeleteRowsCmd(tbName, fieldName, fieldValues);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genDeleteRowsCmd(tbName, fieldName, fieldValues);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genDeleteRowsCmd(tbName, fieldName, fieldValues);

  return "";
}

// 生成插入多行数据
export function genInsertRowsCmd(tbName: string, fieldNames: string[], fieldValues: any[]) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.genInsertRowsCmd(tbName, fieldNames, fieldValues);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genInsertRowsCmd(tbName, fieldNames, fieldValues);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genInsertRowsCmd(tbName, fieldNames, fieldValues);

  return "";
}

// 生成复制表格的语句
export function genCopyTableCmd(tbName: string, tbNameNew: string) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return BuilderMysql.genCopyTableCmd(tbName, tbNameNew);
  if (currentConnType === DB_POSTGRESQL) return BuilderPg.genCopyTableCmd(tbName, tbNameNew);
  if (currentConnType === DB_SQLITE) return BuilderSqilte.genCopyTableCmd(tbName, tbNameNew);
}

// 根据数据类型名称返回对应的分类常量
export function getDataTypeCategory(val: string) {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return getDataTypeCategoryMysql(val);
  if (currentConnType === DB_POSTGRESQL) return getDataTypeCategoryPg(val);
  if (currentConnType === DB_SQLITE) return getDataTypeCategorySqlite(val);

  return "";
}

// 字段外形的下拉选项
export function fieldTypeOptions() {
  const { currentConnType } = coreState;

  if (currentConnType === DB_MYSQL) return fieldTypeOptionsMysql;
  if (currentConnType === DB_POSTGRESQL) return fieldTypeOptionsPg;
  if (currentConnType === DB_SQLITE) return fieldTypeOptionsSqlite;

  return [];
}
