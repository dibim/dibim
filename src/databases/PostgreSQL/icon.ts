import {
  FIELD_TYPE_ARRAY,
  FIELD_TYPE_BINARY,
  FIELD_TYPE_BIT_STRING,
  FIELD_TYPE_BOOLEAN,
  FIELD_TYPE_CHARACTER,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_GEOMETRIC,
  FIELD_TYPE_JSON,
  FIELD_TYPE_NETWORK,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_OTHER,
  FIELD_TYPE_RANGE,
  FIELD_TYPE_TEXT_SEARCH,
} from "@/constants";

const typeCategoryMap: Record<string, string> = {
  // ================ 数值 | Numeric  ================
  "double precision": FIELD_TYPE_NUMERIC,
  bigint: FIELD_TYPE_NUMERIC,
  bigserial: FIELD_TYPE_NUMERIC,
  decimal: FIELD_TYPE_NUMERIC,
  float4: FIELD_TYPE_NUMERIC,
  float8: FIELD_TYPE_NUMERIC,
  int2: FIELD_TYPE_NUMERIC,
  int4: FIELD_TYPE_NUMERIC,
  int8: FIELD_TYPE_NUMERIC,
  int: FIELD_TYPE_NUMERIC,
  integer: FIELD_TYPE_NUMERIC,
  money: FIELD_TYPE_NUMERIC,
  numeric: FIELD_TYPE_NUMERIC,
  real: FIELD_TYPE_NUMERIC,
  serial2: FIELD_TYPE_NUMERIC,
  serial4: FIELD_TYPE_NUMERIC,
  serial8: FIELD_TYPE_NUMERIC,
  serial: FIELD_TYPE_NUMERIC,
  smallint: FIELD_TYPE_NUMERIC,
  smallserial: FIELD_TYPE_NUMERIC,

  // ================ 文本 | Text ================
  "character varying": FIELD_TYPE_CHARACTER,
  varchar: FIELD_TYPE_CHARACTER,
  character: FIELD_TYPE_CHARACTER,
  char: FIELD_TYPE_CHARACTER,
  text: FIELD_TYPE_CHARACTER,
  citext: FIELD_TYPE_CHARACTER, // 扩展类型（citext 模块）

  // ================ 日期/时间 | Date/Time ================
  timestamp: FIELD_TYPE_DATETIME,
  "timestamp without time zone": FIELD_TYPE_DATETIME,
  timestamptz: FIELD_TYPE_DATETIME,
  "timestamp with time zone": FIELD_TYPE_DATETIME,
  date: FIELD_TYPE_DATETIME,
  time: FIELD_TYPE_DATETIME,
  "time without time zone": FIELD_TYPE_DATETIME,
  timetz: FIELD_TYPE_DATETIME,
  "time with time zone": FIELD_TYPE_DATETIME,
  interval: FIELD_TYPE_DATETIME,

  // ================ 二进制 | Binary ================
  bytea: FIELD_TYPE_BINARY,

  // ====================== 几何类 | Geometric ======================
  point: FIELD_TYPE_GEOMETRIC,
  line: FIELD_TYPE_GEOMETRIC,
  lseg: FIELD_TYPE_GEOMETRIC,
  box: FIELD_TYPE_GEOMETRIC,
  path: FIELD_TYPE_GEOMETRIC,
  polygon: FIELD_TYPE_GEOMETRIC,
  circle: FIELD_TYPE_GEOMETRIC,

  // ================ 布尔 | Boolean ================
  boolean: FIELD_TYPE_BOOLEAN,
  bool: FIELD_TYPE_BOOLEAN,

  // ====================== 结构化数据 | Structured data ======================
  json: FIELD_TYPE_JSON,
  jsonb: FIELD_TYPE_JSON,
  jsonpath: FIELD_TYPE_JSON,
  xml: FIELD_TYPE_TEXT_SEARCH,

  // ==================== 网络 | Network ====================
  cidr: FIELD_TYPE_NETWORK,
  inet: FIELD_TYPE_NETWORK,
  macaddr: FIELD_TYPE_NETWORK,
  macaddr8: FIELD_TYPE_NETWORK,

  // ====================== 位串 | Bit string ======================
  bit: FIELD_TYPE_BIT_STRING,
  "bit varying": FIELD_TYPE_BIT_STRING,
  varbit: FIELD_TYPE_BIT_STRING,

  // ====================== 文本搜索 | Text search ======================
  tsvector: FIELD_TYPE_TEXT_SEARCH,
  tsquery: FIELD_TYPE_TEXT_SEARCH,

  // ====================== 范围 | Range ======================
  int4range: FIELD_TYPE_RANGE,
  int8range: FIELD_TYPE_RANGE,
  numrange: FIELD_TYPE_RANGE,
  tsrange: FIELD_TYPE_RANGE,
  tstzrange: FIELD_TYPE_RANGE,
  daterange: FIELD_TYPE_RANGE,

  // ================ 特殊 | Special ================
  enum: FIELD_TYPE_OTHER,
  uuid: FIELD_TYPE_OTHER,
  domain: FIELD_TYPE_OTHER,

  // 其它类型不应当在建表的时候使用
};

/**
 * 根据 PostgreSQL 数据类型名称返回对应的分类常量
 * @param typeName 类型名称（不区分大小写，支持别名）
 * @returns 分类常量，未找到时返回 undefined
 */
export function getDataTypeCategoryPg(typeName: string): string | undefined {
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

  // 处理数组类型（如 `int4[]` -> `_int4`）
  if (normalized.endsWith("[]")) {
    const baseType = normalized.slice(0, -2);
    return typeCategoryMap[baseType] || FIELD_TYPE_ARRAY;
  }

  // 未找到匹配
  return undefined;
}
