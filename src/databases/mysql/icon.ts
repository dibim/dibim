import {
  FIELD_BINARY,
  FIELD_BOOLEAN,
  FIELD_CHARACTER,
  FIELD_DATETIME,
  FIELD_GEOMETRIC,
  FIELD_JSON,
  FIELD_NUMERIC,
  FIELD_OTHER,
} from "@/constants";

const typeCategoryMap: Record<string, string> = {
  // ================ 数值 | Numeric  ================
  "double precision": FIELD_NUMERIC,
  bigint: FIELD_NUMERIC,
  decimal: FIELD_NUMERIC,
  double: FIELD_NUMERIC,
  float: FIELD_NUMERIC,
  int: FIELD_NUMERIC,
  integer: FIELD_NUMERIC,
  mediumint: FIELD_NUMERIC,
  numeric: FIELD_NUMERIC,
  serial: FIELD_NUMERIC,
  smallint: FIELD_NUMERIC,
  tinyint: FIELD_NUMERIC,

  // ================ 文本 | Text ================
  "national char": FIELD_CHARACTER,
  "national varchar": FIELD_CHARACTER,
  char: FIELD_CHARACTER,
  longtext: FIELD_CHARACTER,
  mediumtext: FIELD_CHARACTER,
  nchar: FIELD_CHARACTER,
  nvarchar: FIELD_CHARACTER,
  text: FIELD_CHARACTER,
  tinytext: FIELD_CHARACTER,
  varchar: FIELD_CHARACTER,

  // ================ 日期/时间 | Date/Time ================
  date: FIELD_DATETIME,
  datetime: FIELD_DATETIME,
  time: FIELD_DATETIME,
  timestamp: FIELD_DATETIME,
  year: FIELD_DATETIME,

  // ==================== 二进制 | Binary ====================
  binary: FIELD_BINARY,
  bit: FIELD_OTHER,
  blob: FIELD_BINARY,
  longblob: FIELD_BINARY,
  mediumblob: FIELD_BINARY,
  tinyblob: FIELD_BINARY,
  varbinary: FIELD_BINARY,

  // ================ 几何 | GEOMETRY ================
  geometry: FIELD_GEOMETRIC,
  point: FIELD_GEOMETRIC,
  linestring: FIELD_GEOMETRIC,
  polygon: FIELD_GEOMETRIC,
  multipoint: FIELD_GEOMETRIC,
  multilinestring: FIELD_GEOMETRIC,
  multipolygon: FIELD_GEOMETRIC,
  geometrycollection: FIELD_GEOMETRIC,

  // ================ 布尔 | Boolean ================
  BOOL: FIELD_BOOLEAN,
  BOOLEAN: FIELD_BOOLEAN,

  // ====================== 结构化数据 | Structured data ======================
  json: FIELD_JSON,
  set: FIELD_JSON,

  // ================ 特殊 | Special ================
  enum: FIELD_OTHER,
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
