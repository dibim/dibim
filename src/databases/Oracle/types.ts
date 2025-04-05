import { SqlFieldDefinitionCommon } from "../types";

export interface FieldDefinitionOracle extends SqlFieldDefinitionCommon {
  /** 排序规则 */
  collation: "BINARY_CI" | "LINGUISTIC" | string | null;
  /** 虚拟列 */
  virtual: {
    expression: string;
  } | null;
  /** 关联的序列名称 */
  sequenceName: string | null; // ✅ 已明确包含
  /** 序列缓存配置 */
  sequenceCache: number | null;
}
