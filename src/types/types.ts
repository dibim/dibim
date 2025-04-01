import { FunctionComponent, SVGProps } from "react";
import {
  DB_TYPE_MYSQL,
  DB_TYPE_POSTGRESQL,
  DB_TYPE_SQLITE,
  LIST_BAR_TYPE_DB_LIST,
  LIST_BAR_TYPE_FUNC_LIST,
  LIST_BAR_TYPE_TABLE_LIST,
  LIST_SUB_SIDEBAR_TYPE_VIEW_LIST,
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_EDIT_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
  MAIN_CONTEN_TYPE_TABLE_EDITOR,
  MAIN_CONTEN_TYPE_WELCOME,
  STR_EMPTY,
  TAB_CONSTRAINT,
  TAB_DATA,
  TAB_DDL,
  TAB_FOREIGN_KEY,
  TAB_PARTITION,
  TAB_STRUCTURE,
} from "@/constants";
import { INDEX_PRIMARY_KEY, INDEX_UNIQUE } from "@/databases/constants";

// 数据库返回的数据
// Data returned from the database
export type DbResult = {
  // 列表数组的 json, 仅查询的时候有数据
  // JSON for list arrays, with data available only during queries
  columnName: string;
  // 查询结果, 实际是 json 字符串
  //  The query result is actually a JSON string
  data: string;
  errorMessage: string;
};

// 数据库的查询(query)结果
// Returned (query) results from database
export type QueryResult = {
  // 列表数组的 json
  // JSON for list arrays
  columnName: string;
  // 查询结果, 实际是 json 字符串
  // The query result is actually a JSON string
  data: string;
};

// 数据库的执行(exec)结果
// Execution (exec) results of the database
export type ExecResult = {
  affectedRows: number;
  lastInsertId: number;
};

// 数据库类型
// Database type
export type DbType = typeof DB_TYPE_MYSQL | typeof DB_TYPE_POSTGRESQL | typeof DB_TYPE_SQLITE;

// 唯一约束, 主键或唯一索引
// Unique constraint, primary key or unique index
export type UniqueConstraint = typeof STR_EMPTY | typeof INDEX_PRIMARY_KEY | typeof INDEX_UNIQUE;

// 列表栏的类型
export type ListBarType =
  | typeof LIST_BAR_TYPE_DB_LIST
  | typeof LIST_BAR_TYPE_TABLE_LIST
  | typeof LIST_SUB_SIDEBAR_TYPE_VIEW_LIST
  | typeof LIST_BAR_TYPE_FUNC_LIST;

// 主要区域的类型
// Types of main content
export type MainContenType =
  | typeof MAIN_CONTEN_TYPE_WELCOME
  | typeof MAIN_CONTEN_TYPE_SETTINGS
  | typeof MAIN_CONTEN_TYPE_ADD_CONNECTION
  | typeof MAIN_CONTEN_TYPE_EDIT_CONNECTION
  | typeof MAIN_CONTEN_TYPE_TABLE_EDITOR
  | typeof MAIN_CONTEN_TYPE_SQL_EDITOR;

// 主要区域的标签页
// Tabs for main content
export type MainContentTab =
  | typeof STR_EMPTY
  | typeof TAB_DATA
  | typeof TAB_STRUCTURE
  | typeof TAB_DDL
  | typeof TAB_CONSTRAINT
  | typeof TAB_FOREIGN_KEY
  | typeof TAB_PARTITION;

// 导入的 svg 的属性
// Properties of imported SVG
export type SvgComponentProps = SVGProps<SVGSVGElement> & {
  title?: string;
  titleId?: string;
  desc?: string;
  descId?: string;
};
export type SvgComponentType = FunctionComponent<SvgComponentProps>;
