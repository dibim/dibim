import {
  FIELD_TYPE_BINARY,
  FIELD_TYPE_BIT_STRING,
  FIELD_TYPE_BOOLEAN,
  FIELD_TYPE_CHARACTER,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_GEOMETRIC,
  FIELD_TYPE_JSON,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_OTHER,
} from "@/constants";

const typeCategoryMap: Record<string, string> = {
  // ================ 数值 | Numeric  ================
  "double precision": FIELD_TYPE_NUMERIC,
  bigint: FIELD_TYPE_NUMERIC,
  decimal: FIELD_TYPE_NUMERIC,
  double: FIELD_TYPE_NUMERIC,
  float: FIELD_TYPE_NUMERIC,
  int: FIELD_TYPE_NUMERIC,
  integer: FIELD_TYPE_NUMERIC,
  mediumint: FIELD_TYPE_NUMERIC,
  numeric: FIELD_TYPE_NUMERIC,
  serial: FIELD_TYPE_NUMERIC,
  smallint: FIELD_TYPE_NUMERIC,
  tinyint: FIELD_TYPE_NUMERIC,

  // ================ 文本 | Text ================
  "national char": FIELD_TYPE_CHARACTER,
  "national varchar": FIELD_TYPE_CHARACTER,
  char: FIELD_TYPE_CHARACTER,
  longtext: FIELD_TYPE_CHARACTER,
  mediumtext: FIELD_TYPE_CHARACTER,
  nchar: FIELD_TYPE_CHARACTER,
  nvarchar: FIELD_TYPE_CHARACTER,
  text: FIELD_TYPE_CHARACTER,
  tinytext: FIELD_TYPE_CHARACTER,
  varchar: FIELD_TYPE_CHARACTER,

  // ================ 日期/时间 | Date/Time ================
  date: FIELD_TYPE_DATETIME,
  datetime: FIELD_TYPE_DATETIME,
  time: FIELD_TYPE_DATETIME,
  timestamp: FIELD_TYPE_DATETIME,
  year: FIELD_TYPE_DATETIME,

  // ==================== 二进制 | Binary ====================
  binary: FIELD_TYPE_BINARY,
  bit: FIELD_TYPE_BIT_STRING,
  blob: FIELD_TYPE_BINARY,
  longblob: FIELD_TYPE_BINARY,
  mediumblob: FIELD_TYPE_BINARY,
  tinyblob: FIELD_TYPE_BINARY,
  varbinary: FIELD_TYPE_BINARY,

  // ================ 几何 | GEOMETRY ================
  geometry: FIELD_TYPE_GEOMETRIC,
  point: FIELD_TYPE_GEOMETRIC,
  linestring: FIELD_TYPE_GEOMETRIC,
  polygon: FIELD_TYPE_GEOMETRIC,
  multipoint: FIELD_TYPE_GEOMETRIC,
  multilinestring: FIELD_TYPE_GEOMETRIC,
  multipolygon: FIELD_TYPE_GEOMETRIC,
  geometrycollection: FIELD_TYPE_GEOMETRIC,

  // ================ 布尔 | Boolean ================
  BOOL: FIELD_TYPE_BOOLEAN,
  BOOLEAN: FIELD_TYPE_BOOLEAN,

  // ====================== 结构化数据 | Structured data ======================
  json: FIELD_TYPE_JSON,
  set: FIELD_TYPE_JSON,

  // ================ 特殊 | Special ================
  enum: FIELD_TYPE_OTHER,
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
