import { FunctionComponent, SVGProps } from "react";
import {
  DB_MYSQL,
  DB_POSTGRESQL,
  DB_SQLITE,
  LIST_BAR_DB,
  LIST_BAR_FUNC,
  LIST_BAR_TABLE,
  LIST_BAR_VIEW,
  MAIN_AREA_ADD_CONNECTION,
  MAIN_AREA_EDIT_CONNECTION,
  MAIN_AREA_SETTINGS,
  MAIN_AREA_SQL_EDITOR,
  MAIN_AREA_TABLE_EDITOR,
  MAIN_AREA_WELCOME,
  STR_EMPTY,
  TAB_CONSTRAINT,
  TAB_DATA,
  TAB_DDL,
  TAB_FOREIGN_KEY,
  TAB_PARTITION,
  TAB_STRUCTURE,
} from "@/constants";

// 数据库返回的数据 | Data returned from the database
export type DbResult = {
  // 列表数组的 json, 仅查询的时候有数据
  // JSON for list arrays, with data available only during queries
  columnName: string;
  // 查询结果, 实际是 json 字符串
  // The query result is actually a JSON string
  data: string;
  errorMessage: string;
};

// 数据库的查询(query)结果 | Returned (query) results from database
export type QueryResult = {
  // 列表数组的 json
  // JSON for list arrays
  columnName: string;
  // 查询结果, 实际是 json 字符串
  // The query result is actually a JSON string
  data: string;
};

// 数据库的执行(exec)结果 | Execution (exec) results of the database
export type ExecResult = {
  affectedRows: number;
  lastInsertId: number;
};

// 数据库类型 | Database type
export type DbType = typeof DB_MYSQL | typeof DB_POSTGRESQL | typeof DB_SQLITE;

// 数据库里每一行的数据
export type RowData = Record<string, any>;

// 列表栏的类型
export type ListBarType = typeof LIST_BAR_DB | typeof LIST_BAR_TABLE | typeof LIST_BAR_VIEW | typeof LIST_BAR_FUNC;

// 主要区域的类型
// Types of main area
export type MainAreaType =
  | typeof MAIN_AREA_ADD_CONNECTION
  | typeof MAIN_AREA_EDIT_CONNECTION
  | typeof MAIN_AREA_SETTINGS
  | typeof MAIN_AREA_SQL_EDITOR
  | typeof MAIN_AREA_TABLE_EDITOR
  | typeof MAIN_AREA_WELCOME;

// 主要区域的标签页 | Tabs for main area
export type MainAreaTab =
  | typeof STR_EMPTY
  | typeof TAB_CONSTRAINT
  | typeof TAB_DATA
  | typeof TAB_DDL
  | typeof TAB_FOREIGN_KEY
  | typeof TAB_PARTITION
  | typeof TAB_STRUCTURE;

// 导入的 svg 的属性 | Properties of imported SVG
export type SvgComponentProps = SVGProps<SVGSVGElement> & {
  desc?: string;
  descId?: string;
  title?: string;
  titleId?: string;
};
export type SvgComponentType = FunctionComponent<SvgComponentProps>;
