import { CommonSQLValue } from "../types";

// 成员的属性名为字段名
export type PrimaryKeysRes = {
  column_name: string;
};

// 成员的属性名为字段名
export type ForeignKeysRes = {
  constraint_name: string;
  referenced_table: string;
  referencing_column: string;
  referenced_column: string;
};

// 成员的属性名为字段名
export type UniqueKeysResRes = {
  column_name: string;
  constraint_name: string;
};

// 成员的属性名为字段名
export type NotNullRes = {
  column_name: string;
  is_nullable: boolean;
};

// 成员的属性名为字段名
export type CheckConstraintsRes = {
  constraint_name: string;
  check_condition: boolean;
};

// 成员的属性名为字段名
export type CommentRes = {
  column_name: string;
  comment: string;
};

// PostgreSQL 特有类型
export type PGValue =
  | CommonSQLValue // 继承通用类型
  | Uint8Array // PostgreSQL 的 bytea 类型
  | Record<string, any> // JSON/JSONB 类型
  | any[] // 数组类型（PostgreSQL 有更丰富的数组支持）
  | RegExp // 可以转换为 TEXT 或 JSON
  | Map<any, any> // 可以转换为 JSON
  | Set<any>; // 可以转换为 JSON 数组
