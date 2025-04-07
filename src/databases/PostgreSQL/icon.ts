import {
  FIELD_ARRAY,
  FIELD_BINARY,
  FIELD_BIT_STRING,
  FIELD_BOOLEAN,
  FIELD_CHARACTER,
  FIELD_DATETIME,
  FIELD_GEOMETRIC,
  FIELD_JSON,
  FIELD_NETWORK,
  FIELD_NUMERIC,
  FIELD_OTHER,
  FIELD_RANGE,
  FIELD_TEXT_SEARCH,
} from "@/constants";

const typeCategoryMap: Record<string, string> = {
  // ================ 数值 | Numeric  ================
  "double precision": FIELD_NUMERIC,
  bigint: FIELD_NUMERIC,
  bigserial: FIELD_NUMERIC,
  decimal: FIELD_NUMERIC,
  float4: FIELD_NUMERIC,
  float8: FIELD_NUMERIC,
  int2: FIELD_NUMERIC,
  int4: FIELD_NUMERIC,
  int8: FIELD_NUMERIC,
  int: FIELD_NUMERIC,
  integer: FIELD_NUMERIC,
  money: FIELD_NUMERIC,
  numeric: FIELD_NUMERIC,
  real: FIELD_NUMERIC,
  serial2: FIELD_NUMERIC,
  serial4: FIELD_NUMERIC,
  serial8: FIELD_NUMERIC,
  serial: FIELD_NUMERIC,
  smallint: FIELD_NUMERIC,
  smallserial: FIELD_NUMERIC,

  // ================ 文本 | Text ================
  "character varying": FIELD_CHARACTER,
  varchar: FIELD_CHARACTER,
  character: FIELD_CHARACTER,
  char: FIELD_CHARACTER,
  text: FIELD_CHARACTER,
  citext: FIELD_CHARACTER, // 扩展类型（citext 模块）

  // ================ 日期/时间 | Date/Time ================
  timestamp: FIELD_DATETIME,
  "timestamp without time zone": FIELD_DATETIME,
  timestamptz: FIELD_DATETIME,
  "timestamp with time zone": FIELD_DATETIME,
  date: FIELD_DATETIME,
  time: FIELD_DATETIME,
  "time without time zone": FIELD_DATETIME,
  timetz: FIELD_DATETIME,
  "time with time zone": FIELD_DATETIME,
  interval: FIELD_DATETIME,

  // ================ 二进制 | Binary ================
  bytea: FIELD_BINARY,

  // ====================== 几何类 | Geometric ======================
  point: FIELD_GEOMETRIC,
  line: FIELD_GEOMETRIC,
  lseg: FIELD_GEOMETRIC,
  box: FIELD_GEOMETRIC,
  path: FIELD_GEOMETRIC,
  polygon: FIELD_GEOMETRIC,
  circle: FIELD_GEOMETRIC,

  // ================ 布尔 | Boolean ================
  boolean: FIELD_BOOLEAN,
  bool: FIELD_BOOLEAN,

  // ====================== 结构化数据 | Structured data ======================
  json: FIELD_JSON,
  jsonb: FIELD_JSON,
  jsonpath: FIELD_JSON,
  xml: FIELD_TEXT_SEARCH,

  // ==================== 网络 | Network ====================
  cidr: FIELD_NETWORK,
  inet: FIELD_NETWORK,
  macaddr: FIELD_NETWORK,
  macaddr8: FIELD_NETWORK,

  // ====================== 位串 | Bit string ======================
  bit: FIELD_BIT_STRING,
  "bit varying": FIELD_BIT_STRING,
  varbit: FIELD_BIT_STRING,

  // ====================== 文本搜索 | Text search ======================
  tsvector: FIELD_TEXT_SEARCH,
  tsquery: FIELD_TEXT_SEARCH,

  // ====================== 范围 | Range ======================
  int4range: FIELD_RANGE,
  int8range: FIELD_RANGE,
  numrange: FIELD_RANGE,
  tsrange: FIELD_RANGE,
  tstzrange: FIELD_RANGE,
  daterange: FIELD_RANGE,

  // ================ 特殊 | Special ================
  enum: FIELD_OTHER,
  uuid: FIELD_OTHER,
  domain: FIELD_OTHER,

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
    return typeCategoryMap[baseType] || FIELD_ARRAY;
  }

  // 未找到匹配
  return undefined;
}
