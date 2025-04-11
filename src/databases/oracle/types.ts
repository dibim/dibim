import { SqlFieldDefinitionCommon, SqlTableConstraintCommon } from "../types";

export interface FieldDefinitionOracle extends SqlFieldDefinitionCommon {
  /** 排序规则 */
  collation: "BINARY_CI" | "LINGUISTIC" | string | null;
  /** 虚拟列 */
  virtual: {
    expression: string;
  } | null;
  /** 关联的序列名称 */
  sequenceName: string | null;
  /** 序列缓存配置 */
  sequenceCache: number | null;
}

export type SqlTableConstraintOracle = SqlTableConstraintCommon & {
  /** 约束状态 */
  state?: "ENABLE" | "DISABLE";
  /** 校验模式 */
  validate?: "VALIDATE" | "NOVALIDATE";
  /** 延迟校验 */
  deferrable?: "DEFERRABLE" | "NOT DEFERRABLE";
};
