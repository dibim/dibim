import { TableStructurePostgresql } from "./PostgreSQL/types";
import {
  SSL_MODE_ALLOW,
  SSL_MODE_DISABLE,
  SSL_MODE_PREFER,
  SSL_MODE_REQUIRE,
  SSL_MODE_VERIFY_CA,
  SSL_MODE_VERIFY_FULL,
} from "./constants";

// rust 的 sqlx 在连接字符串中添加 sslmode 参数控制 TLS 行为
export type SslMode =
  | typeof SSL_MODE_DISABLE
  | typeof SSL_MODE_ALLOW
  | typeof SSL_MODE_PREFER
  | typeof SSL_MODE_REQUIRE
  | typeof SSL_MODE_VERIFY_CA
  | typeof SSL_MODE_VERIFY_FULL;

// 链接数据库的参数
export interface DbConnectionParams {
  user: string;
  host: string;
  dbname: string;
  password: string;
  port: number;
  sslmode?: SslMode;
}

export type GetTableDataParam = {
  tableName: string;
  sortField: string; // 排序字段
  sortOrder: "ASC" | "DESC"; // 排序顺序
  currentPage: number; // 当前页码
  pageSize: number; // 每页的数据条数
  lastOrderByValue: any; // 上一次查询的结果集里最后一条数据里的和 orderBy 对应的字段的值
};

export type GetTableDataRes = {
  total: number; // 数据总条数
  currentPage: number; // 当前页码
  pageSize: number; // 每页的数据条数
  data: string; // 当前页的数据, json 字符串
};

// 从数据库统计数字的结果, 要搭配字段别名 total
export type DbCountRes = {
  total: number;
};

// 表结构
export type TableStructure = TableStructurePostgresql;
