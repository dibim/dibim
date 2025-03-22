import {
  DB_TYPE_MY_SQL,
  DB_TYPE_POSTGRES_SQL,
  DB_TYPE_SQLITE,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
  MAIN_CONTEN_TYPE_TABLE_DATA,
  STR_EMPTY,
} from "@/constants";

// 数据库返回的数据
export type DbResult = {
  columnName: string; // 列表数组 json, 仅查询的时候有数据
  data: string; // 查询结果, 实际是 json 字符串
  errorMessage: string; // 错误消息
};

// 数据库的查询(query)结果
export type QueryResult = {
  columnName: string; // 列表数组 json
  data: string; // 查询结果, 实际是 json 字符串
};

// 数据库的执行(exec)结果
export type ExecResult = {
  affectedRows: number;
  lastInsertId: number;
};

// 表格列表
export type TableListData = {};

// 主要区域
export type MainContentData = {
  //
};

// 数据库类型
export type DbType = typeof STR_EMPTY | typeof DB_TYPE_MY_SQL | typeof DB_TYPE_POSTGRES_SQL | typeof DB_TYPE_SQLITE;

// 主要区域的类型
export type MainContenType = typeof STR_EMPTY | typeof MAIN_CONTEN_TYPE_TABLE_DATA | typeof MAIN_CONTEN_TYPE_SQL_EDITOR;
