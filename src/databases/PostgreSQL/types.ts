import { SqlTableConstraintCommon, SqlValueCommon } from "../types";
import { SqlFieldDefinitionCommon } from "../types";

export interface FieldDefinitionPg extends SqlFieldDefinitionCommon {
  /** 排序规则 */
  collation: "en_US.utf8" | "C" | string | null;
  /** 数组维度 */
  arrayDimensions: number | null;
  /** 自定义类型 */
  userDefinedType: string | null;
  /** 生成列 */
  generated: {
    expression: string;
    stored: boolean;
  } | null;
  /** 标识列 */
  identity: "ALWAYS" | "BY DEFAULT" | null;
}

export type SqlTableConstraintPg = SqlTableConstraintCommon & {
  /** 排除约束 */
  type: SqlTableConstraintCommon["type"] | "EXCLUDE";
  /** 延迟约束检查 */
  deferrable?: "DEFERRABLE" | "NOT DEFERRABLE";
  /** 约束检查时机 */
  checkTime?: "INITIALLY DEFERRED" | "INITIALLY IMMEDIATE";
  /** 排除约束使用的运算符 */
  using?: string;
};

// PostgreSQL 特有类型
export type PgValue =
  | SqlValueCommon // 继承通用类型
  | Uint8Array // PostgreSQL 的 bytea 类型
  | Record<string, any> // JSON/JSONB 类型
  | any[] // 数组类型（PostgreSQL 有更丰富的数组支持）
  | RegExp // 可以转换为 TEXT 或 JSON
  | Map<any, any> // 可以转换为 JSON
  | Set<any>; // 可以转换为 JSON 数组
