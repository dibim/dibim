import { SqlFieldDefinitionCommon, SqlTableConstraintCommon } from "../types";

export interface FieldDefinitionMysql extends SqlFieldDefinitionCommon {
  /** 自增配置 */
  autoIncrement: {
    start: number;
    increment: number;
  } | null;
  /** 字符集 */
  charset: "utf8mb4" | "latin1" | string | null;
  /** 排序规则 */
  collation: "utf8mb4_unicode_ci" | "latin1_swedish_ci" | string | null;
}

export type SqlTableConstraintMysql = SqlTableConstraintCommon & {
  /** 索引类型 */
  indexType?: "BTREE" | "HASH";
  /** 约束检查时机 */
  checkOption?: "NOT DEFERRABLE"; // MySQL 8.0+支持
};
