import { SqlFieldDefinitionCommon } from "../types";

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
