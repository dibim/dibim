import {
  FIELD_TYPE_BIT_STRING,
  FIELD_TYPE_CHARACTER,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_NUMERIC,
} from "@/constants";

const typeCategoryMap: Record<string, string> = {
  // ==================== 数值类型 ====================
  integer: FIELD_TYPE_NUMERIC,
  real: FIELD_TYPE_NUMERIC,
  numeric: FIELD_TYPE_NUMERIC,
  int: FIELD_TYPE_NUMERIC,
  bigint: FIELD_TYPE_NUMERIC,
  float: FIELD_TYPE_NUMERIC,
  double: FIELD_TYPE_NUMERIC,
  decimal: FIELD_TYPE_NUMERIC,

  // ==================== 字符串类型 ====================
  text: FIELD_TYPE_CHARACTER,
  varchar: FIELD_TYPE_CHARACTER,
  char: FIELD_TYPE_CHARACTER,

  // ==================== 二进制类型 ====================
  blob: FIELD_TYPE_BIT_STRING,

  // ==================== 日期/时间类型 ====================
  date: FIELD_TYPE_DATETIME,
  datetime: FIELD_TYPE_DATETIME,
  timestamp: FIELD_TYPE_DATETIME,
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
