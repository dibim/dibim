import { FunctionComponent, SVGProps } from "react";
import {
  DB_TYPE_MYSQL,
  DB_TYPE_POSTGRESQL,
  DB_TYPE_SQLITE,
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_EDIT_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
  MAIN_CONTEN_TYPE_TABLE_EDITOR,
  MAIN_CONTEN_TYPE_WELCOME,
  SUB_SIDEBAR_TYPE_DB_LIST,
  SUB_SIDEBAR_TYPE_FUNC_LIST,
  SUB_SIDEBAR_TYPE_TABLE_LIST,
  SUB_SIDEBAR_TYPE_VIEW_LIST,
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

// 表结构
export type MainContentStructure = {
  getData: () => void;
};

// 数据库类型
export type DbType = typeof DB_TYPE_MYSQL | typeof DB_TYPE_POSTGRESQL | typeof DB_TYPE_SQLITE;

// 次级侧边栏的类型
export type SubSidebarType =
  | typeof SUB_SIDEBAR_TYPE_DB_LIST
  | typeof SUB_SIDEBAR_TYPE_TABLE_LIST
  | typeof SUB_SIDEBAR_TYPE_VIEW_LIST
  | typeof SUB_SIDEBAR_TYPE_FUNC_LIST;

// 主要区域的类型
export type MainContenType =
  | typeof MAIN_CONTEN_TYPE_WELCOME
  | typeof MAIN_CONTEN_TYPE_SETTINGS
  | typeof MAIN_CONTEN_TYPE_ADD_CONNECTION
  | typeof MAIN_CONTEN_TYPE_EDIT_CONNECTION
  | typeof MAIN_CONTEN_TYPE_TABLE_EDITOR
  | typeof MAIN_CONTEN_TYPE_SQL_EDITOR;

// 导入的 svg 的属性
export type SvgComponentProps = SVGProps<SVGSVGElement> & {
  title?: string;
  titleId?: string;
  desc?: string;
  descId?: string;
};
export type SvgComponentType = FunctionComponent<SvgComponentProps>;
