import { STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY, STR_FIELD, STR_TABLE } from "@/constants";
import {
  DB_MYSQL,
  DB_POSTGRESQL,
  DB_SQLITE,
  SSL_MODE_ALLOW,
  SSL_MODE_DISABLE,
  SSL_MODE_PREFER,
  SSL_MODE_REQUIRE,
  SSL_MODE_VERIFY_CA,
  SSL_MODE_VERIFY_FULL,
} from "./constants";

// 数据库类型 | Database type
export type DbType = typeof DB_MYSQL | typeof DB_POSTGRESQL | typeof DB_SQLITE;

// 数据库里每一行的数据
export type RowData = Record<string, any>;

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

export type SortField = {
  fieldName: string; // 排序字段名
  direction: "ASC" | "DESC"; // 排序顺序
};

export type GetTableDataParam = {
  currentPage: number;
  fields: string[];
  sortField: SortField[]; // 排序字段
  pageSize: number; // 每页的数据条数
  tableName: string;
  where: string;
};

export type GetTableDataRes = {
  currentPage: number;
  data: string; // 当前页的数据, json 字符串
  pageSize: number; // 每页的数据条数
  total: number; // 数据总条数
};

// 从数据库统计数字的结果, 要搭配字段别名 total
export type DbCountRes = {
  total: number;
};

// 表格及其索引的大小
export type getAllTableSizeRes = {
  indexSize: string;
  tableName: string;
  tableSize: string;
  totalSize: string;
};

/**
 * SQL通用数据类型（所有主流数据库支持的基础类型）
 */
export type SqlValueCommon =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | bigint
  | ArrayBuffer // 二进制数据通用表示
  | Array<SqlValueCommon>; // 数组类型（部分数据库支持）

// 所有 SQL 数据库类性共有的字段属性
export interface SqlFieldDefinitionCommon {
  comment: string;
  defaultValue: string | null;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isUniqueKey: boolean;
  name: string;
  size: string | null;
  type: string;
  checkConstraint?: string | null; //CHECK 约束条件
}

// 所有 SQL 数据库类性共有的表格约束
export type ReferentialAction = "NO ACTION" | "RESTRICT" | "SET NULL" | "SET DEFAULT" | "CASCADE";
export interface SqlTableConstraintCommon {
  type: "PRIMARY_KEY" | "UNIQUE" | "CHECK" | "FOREIGN_KEY"; // 约束类型
  name: string | null; // 约束名称（允许匿名约束）
  columns: string[] | null; // 作用列（CHECK约束可能不需要）
  condition: string | null; // CHECK约束表达式

  // 外键专用属性
  referenceTable: string | null; // 引用表名
  referenceColumns: string[] | null; // 引用表列
  onDelete: ReferentialAction | null; // 级联删除策略
  onUpdate: ReferentialAction | null; // 级联更新策略
}

// 表结构的字段数据
export type FieldStructure = SqlFieldDefinitionCommon & {
  isForeignKey: boolean;
  hasCheckConditions: any;
  indexes?: FieldIndex[]; // 这个字段的索引数据
};

// 字段的索引信息
export interface FieldIndex {
  indexName: string; // 索引名称
  columnName: string;
  indexType: string; // 索引类型 (如 btree, hash 等)
  isUniqueKey: boolean; // 是否唯一索引
  isPrimaryKey: boolean; // 是否主键索引
}

// 变更表更表结构的动作类性
export type AlterAction = typeof STR_EMPTY | typeof STR_ADD | typeof STR_EDIT | typeof STR_DELETE;

export type ActionTarget = typeof STR_FIELD | typeof STR_TABLE;

// 对字段的修改数据
export type FieldAlterAction = {
  target: ActionTarget;
  action: AlterAction;
  tableName: string;

  autoIncrement: boolean;
  comment: string;
  defaultValue: string | null;
  indexName: string; // 索引名
  isNullable: boolean; // 字段可以为空
  isPrimaryKey: boolean;
  isUniqueKey: boolean;
  name: string;
  size: string;
  type: string;
  nameNew: string; // 改名时的新字段名

  // 原先的信息, 用于对比是否修改
  autoIncrementOld: boolean;
  commentOld: string;
  defalutValueOld: string | null;
  indexNameOld: string; // 索引名
  isNullableOld: boolean;
  isPrimaryKeyOld: boolean;
  isUniqueKeyOld: boolean;
  nameOld: string;
  sizeOld: string;
  typeOld: string;
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
