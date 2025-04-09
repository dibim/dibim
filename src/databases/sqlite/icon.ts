import { FIELD_CHARACTER, FIELD_DATETIME, FIELD_NUMERIC, FIELD_OTHER } from "../constants";

const typeCategoryMap: Record<string, string> = {
  // ==================== 数值类型 ====================
  integer: FIELD_NUMERIC,
  real: FIELD_NUMERIC,
  numeric: FIELD_NUMERIC,
  int: FIELD_NUMERIC,
  bigint: FIELD_NUMERIC,
  float: FIELD_NUMERIC,
  double: FIELD_NUMERIC,
  decimal: FIELD_NUMERIC,

  // ==================== 字符串类型 ====================
  text: FIELD_CHARACTER,
  varchar: FIELD_CHARACTER,
  char: FIELD_CHARACTER,

  // ==================== 二进制类型 ====================
  blob: FIELD_OTHER,

  // ==================== 日期/时间类型 ====================
  date: FIELD_DATETIME,
  datetime: FIELD_DATETIME,
  timestamp: FIELD_DATETIME,
};

/**
 * 根据 PostgreSQL 数据类型名称返回对应的分类常量
 * @param typeName 类型名称（不区分大小写，支持别名）
 * @returns 分类常量，未找到时返回 undefined
 */
export function getDataTypeCategorySqlite(typeName: string): string | undefined {
  if (!typeName) return undefined;

  // 标准化输入：转小写、移除多余空格、移除[]（如 `int4[]` -> `_int4`）
  const normalized = typeName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // 合并多余空格
    .replace(/\s*\[\s*\]/g, ""); // 移除数组标记（单独处理）

  // 直接匹配已知类型
  if (typeCategoryMap[normalized]) {
    return typeCategoryMap[normalized];
  }

  // 未找到匹配
  return undefined;
}
