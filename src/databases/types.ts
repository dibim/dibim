import { TableStructurePostgresql } from "./PostgreSQL/types";
import {
  ACTION_C_COLNAME,
  ACTION_C_COL_COMMENT,
  ACTION_C_DATATYPE,
  ACTION_C_DEFAULT,
  ACTION_C_IS_PRIMARY_KEY,
  ACTION_C_IS_UNIQUE,
  ACTION_C_NULLABLE,
  ACTION_C_TBL_COMMENT,
  ACTION_D_COL,
  SSL_MODE_ALLOW,
  SSL_MODE_DISABLE,
  SSL_MODE_PREFER,
  SSL_MODE_REQUIRE,
  SSL_MODE_VERIFY_CA,
  SSL_MODE_VERIFY_FULL,
} from "./constants";

// rust 的 sqlx 在连接字符串中添加 sslmode 参数控制 TLS 行为
export type SslMode =
  | typeof SSL_MODE_ALLOW
  | typeof SSL_MODE_DISABLE
  | typeof SSL_MODE_PREFER
  | typeof SSL_MODE_REQUIRE
  | typeof SSL_MODE_VERIFY_CA
  | typeof SSL_MODE_VERIFY_FULL;

// 链接数据库的参数
export interface DbConnectionParam {
  dbName: string;
  host: string;
  password: string;
  port: number;
  sslmode?: SslMode;
  user: string;
}

export type GetTableDataParam = {
  currentPage: number; // 当前页码
  lastOrderByValue: any; // 上一次查询的结果集里最后一条数据里的和 orderBy 对应的字段的值
  pageSize: number; // 每页的数据条数
  sortField: string; // 排序字段
  sortOrder: "ASC" | "DESC"; // 排序顺序
  tableName: string;
};

export type GetTableDataRes = {
  currentPage: number; // 当前页码
  data: string; // 当前页的数据, json 字符串
  pageSize: number; // 每页的数据条数
  total: number; // 数据总条数
};

// 从数据库统计数字的结果, 要搭配字段别名 total
export type DbCountRes = {
  total: number;
};

// 表结构
export type TableStructure = TableStructurePostgresql;

// 变更表更表结构的动作类性
export type AlterAction =
  | typeof ACTION_C_COLNAME
  | typeof ACTION_C_DATATYPE
  | typeof ACTION_C_IS_PRIMARY_KEY
  | typeof ACTION_C_IS_UNIQUE
  | typeof ACTION_C_NULLABLE
  | typeof ACTION_C_DEFAULT
  | typeof ACTION_C_COL_COMMENT
  | typeof ACTION_C_TBL_COMMENT
  | typeof ACTION_D_COL;

// 列的修改数据
export type ColumnAlterAction = {
  column_name: string;
  action: AlterAction;
  actionValue: any; // 类型根据 action 变化
};
