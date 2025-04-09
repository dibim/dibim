import { SqlFieldDefinitionCommon, SqlTableConstraintCommon } from "../types";

export interface FieldDefinitionSqlServer extends SqlFieldDefinitionCommon {
  /** 排序规则 */
  collation: "Latin1_General_CI_AS" | "SQL_Latin1_General_CP1_CI_AS" | string | null;
  /** 自增配置 */
  identity: {
    seed: number;
    increment: number;
  } | null;
  /** 列加密 */
  encryption: {
    algorithm: string;
    keyName: string;
  } | null;
}

export type SqlTableConstraintCommonSqlServer = SqlTableConstraintCommon & {
  /** 索引包含列 */
  includedColumns?: string[];
  /** 索引过滤条件 */
  filterCondition?: string;
  /** 索引类型 */
  indexType?: "CLUSTERED" | "NONCLUSTERED";
};
