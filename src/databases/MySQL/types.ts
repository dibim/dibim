import { SqlFieldDefinitionCommon } from "../types";

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
