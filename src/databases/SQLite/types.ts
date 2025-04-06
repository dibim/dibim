import { SqlFieldDefinitionCommon, SqlTableConstraintCommon } from "../types";

export interface FieldDefinitionSqlite extends SqlFieldDefinitionCommon {
  /** 自增标识 (AUTOINCREMENT) */
  autoIncrement: boolean;
  /** 排序规则 */
  collation: "BINARY" | "NOCASE" | "RTRIM" | null;
  /** 生成列 */
  generated: {
    expression: string;
    type: "STORED" | "VIRTUAL";
  } | null;
}

export type SqlTableConstraintCommonSqlite = SqlTableConstraintCommon & {
  /** 仅支持内置冲突解决策略 */
  onConflict?: "ROLLBACK" | "ABORT" | "FAIL" | "IGNORE" | "REPLACE";
};

export type TableStructureSqlite = {
  cid: number; // 字段 ID（从 0 开始）
  name: string; // 字段名
  type: string | null; // 数据类型（如 "INTEGER", "TEXT"）
  isNotNull: 0 | 1; // 是否允许 NULL（0=允许，1=不允许）
  defaultValue: string | null; // 默认值
  pk: 0 | 1; // 是否为主键（0=否，1=是）
};
