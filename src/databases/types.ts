import { STR_ADD, STR_DELETE, STR_EDIT } from "@/constants";
import { TableStructurePostgresql } from "./PostgreSQL/types";
import {
  FIELD,
  FIELD_COMMENT,
  FIELD_DEFAULT,
  FIELD_INDEX_TYPE,
  FIELD_NAME,
  FIELD_NOT_NULL,
  FIELD_TYPE,
  SSL_MODE_ALLOW,
  SSL_MODE_DISABLE,
  SSL_MODE_PREFER,
  SSL_MODE_REQUIRE,
  SSL_MODE_VERIFY_CA,
  SSL_MODE_VERIFY_FULL,
  TABLE_COMMENT,
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

/**
 * SQL通用数据类型（所有主流数据库支持的基础类型）
 */
export type CommonSQLValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | bigint
  | ArrayBuffer // 二进制数据通用表示
  | Array<CommonSQLValue>; // 数组类型（部分数据库支持）

// 表结构
export type TableStructure = TableStructurePostgresql;

// 变更表更表结构的动作类性
export type AlterAction = typeof STR_ADD | typeof STR_EDIT | typeof STR_DELETE;
// 变更表更表结构的动作目标
export type AlterActionTarget =
  | typeof TABLE_COMMENT
  | typeof FIELD_NAME
  | typeof FIELD_TYPE
  | typeof FIELD_INDEX_TYPE
  | typeof FIELD_NOT_NULL
  | typeof FIELD_DEFAULT
  | typeof FIELD_COMMENT
  | typeof FIELD;

export type AlterActionValue = {
  target: AlterActionTarget;

  // fieldName 是改名时作为新字段名, 设置索引时作为作音的列名
  // TODO: 后续要支持复合索引
  fieldName: string; // 字段名
  fieldType: string; // 字段类型
  fieldSize: string; // 字段大小
  fieldDefalut: string | number | null; // 字段默认值
  fieldNotNull: boolean; // 字段非空
  fieldIndexType: string; // 字段索引类型
  fieldIndexPkAutoIncrement: boolean; // 字段主键自增
  fieldIndexName: string; // 字段索引名
  fieldComment: string; // 字段备注

  tableComment: string; // 表备注
};

// 列的修改数据
export type ColumnAlterAction = {
  tableName: string;
  fieldName: string;
  action: AlterAction;
  actionValues: AlterActionValue[];
};
