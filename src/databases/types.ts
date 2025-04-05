import { STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY, STR_FIELD, STR_TABLE } from "@/constants";
import { UniqueConstraint } from "@/types/types";
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
  filePath: string; // 数据库文件, 用于 SQLite | Database file, used for SQLite
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

// 表结构列表的数据
// 这是从数据库查询的结果
//
// 注意: 命名方式按照数据库的
//
export type TableStructure = {
  column_default: string;
  column_name: string;
  comment: string;
  data_type: string;
  has_check_conditions: any;
  indexes?: ColumnIndex[];
  is_foreign_key: boolean;
  is_not_null: boolean;
  is_primary_key: boolean;
  is_unique_key: boolean;
  size: string;
};

// 字段的索引信息
export interface ColumnIndex {
  name: string; // 索引名称
  type: string; // 索引类型 (如 btree, hash 等)
  isUnique: boolean; // 是否唯一索引
  isPrimary: boolean; // 是否主键索引
}

export interface IndexQueryResult {
  index_name: string;
  column_name: string;
  index_type: string;
  is_unique: boolean;
  is_primary: boolean;
}

// 变更表更表结构的动作类性
export type AlterAction = typeof STR_EMPTY | typeof STR_ADD | typeof STR_EDIT | typeof STR_DELETE;
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

export type ActionTarget = typeof STR_FIELD | typeof STR_TABLE;

// 对字段的修改数据
export type FieldAlterAction = {
  target: ActionTarget;
  action: AlterAction;
  tableName: string;

  fieldName: string;
  fieldNameExt: string; // 改名时作为新字段名, 设置索引时作为作音的列名 TODO: 后续要支持复合索引
  fieldType: string; // 字段类型
  fieldSize: string; // 字段大小
  fieldDefalut: string | null; // 字段默认值
  fieldNotNull: boolean; // 字段非空
  fieldIndexType: UniqueConstraint; // 字段索引类型
  fieldIndexPkAutoIncrement: boolean; // 字段主键自增
  fieldIndexName: string; // 字段索引名
  fieldComment: string; // 字段备注

  // 原先的信息, sqlite 需要对比是否修改
  fieldIndexTypeOld: UniqueConstraint; // 字段索引类型
  fieldTypeOld: string; // 字段类型
  fieldNotNullOld: boolean; // 字段非空
  fieldDefalutOld: string | null; // 字段默认值
};

// 对表的修改数据
export type TableAlterAction = {
  target: ActionTarget;
  action: AlterAction;
  tableName: string;
  tableNameOld: string; // 原先的表名, 重命名的时候用
  comment: string; // 表注释
};

export type AllAlterAction = FieldAlterAction | TableAlterAction;

// 字段名及其值
export type FieldWithValue = { field: string; value: any };
