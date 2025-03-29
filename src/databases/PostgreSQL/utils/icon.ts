import {
  FIELD_TYPE_ARRAY,
  FIELD_TYPE_BINARY,
  FIELD_TYPE_BIT_STRING,
  FIELD_TYPE_BOOLEAN,
  FIELD_TYPE_CHARACTER,
  FIELD_TYPE_COMPOSITE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_DOMAIN,
  FIELD_TYPE_ENUM,
  FIELD_TYPE_GEOMETRIC,
  FIELD_TYPE_JSON,
  FIELD_TYPE_MONETARY,
  FIELD_TYPE_NETWORK,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_PSEUDO,
  FIELD_TYPE_RANGE,
  FIELD_TYPE_TEXT_SEARCH,
  FIELD_TYPE_UUID,
} from "@/constants";

const typeCategoryMap: Record<string, string> = {
  // ==================== 数值类型 ====================
  smallint: FIELD_TYPE_NUMERIC,
  int2: FIELD_TYPE_NUMERIC,
  integer: FIELD_TYPE_NUMERIC,
  int: FIELD_TYPE_NUMERIC,
  int4: FIELD_TYPE_NUMERIC,
  bigint: FIELD_TYPE_NUMERIC,
  int8: FIELD_TYPE_NUMERIC,
  decimal: FIELD_TYPE_NUMERIC,
  numeric: FIELD_TYPE_NUMERIC,
  real: FIELD_TYPE_NUMERIC,
  float4: FIELD_TYPE_NUMERIC,
  "double precision": FIELD_TYPE_NUMERIC,
  float8: FIELD_TYPE_NUMERIC,
  serial: FIELD_TYPE_NUMERIC,
  serial4: FIELD_TYPE_NUMERIC,
  bigserial: FIELD_TYPE_NUMERIC,
  serial8: FIELD_TYPE_NUMERIC,

  // ==================== 字符串类型 ====================
  "character varying": FIELD_TYPE_CHARACTER,
  varchar: FIELD_TYPE_CHARACTER,
  character: FIELD_TYPE_CHARACTER,
  char: FIELD_TYPE_CHARACTER,
  text: FIELD_TYPE_CHARACTER,
  citext: FIELD_TYPE_CHARACTER, // 扩展类型（citext 模块）

  // ==================== 二进制类型 ====================
  bytea: FIELD_TYPE_BINARY,

  // ==================== 日期/时间类型 ====================
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

  // ==================== 布尔类型 ====================
  boolean: FIELD_TYPE_BOOLEAN,
  bool: FIELD_TYPE_BOOLEAN,

  // ==================== 枚举类型 ====================
  enum: FIELD_TYPE_ENUM,

  // ==================== 几何类型 ====================
  point: FIELD_TYPE_GEOMETRIC,
  line: FIELD_TYPE_GEOMETRIC,
  lseg: FIELD_TYPE_GEOMETRIC,
  box: FIELD_TYPE_GEOMETRIC,
  path: FIELD_TYPE_GEOMETRIC,
  polygon: FIELD_TYPE_GEOMETRIC,
  circle: FIELD_TYPE_GEOMETRIC,

  // ==================== 网络地址类型 ====================
  cidr: FIELD_TYPE_NETWORK,
  inet: FIELD_TYPE_NETWORK,
  macaddr: FIELD_TYPE_NETWORK,
  macaddr8: FIELD_TYPE_NETWORK,

  // ==================== 文本搜索类型 ====================
  tsvector: FIELD_TYPE_TEXT_SEARCH,
  tsquery: FIELD_TYPE_TEXT_SEARCH,

  // ==================== UUID 类型 ====================
  uuid: FIELD_TYPE_UUID,

  // ==================== JSON 类型 ====================
  json: FIELD_TYPE_JSON,
  jsonb: FIELD_TYPE_JSON,

  // ==================== 范围类型 ====================
  int4range: FIELD_TYPE_RANGE,
  int8range: FIELD_TYPE_RANGE,
  numrange: FIELD_TYPE_RANGE,
  tsrange: FIELD_TYPE_RANGE,
  tstzrange: FIELD_TYPE_RANGE,
  daterange: FIELD_TYPE_RANGE,

  // ==================== 位串类型 ====================
  bit: FIELD_TYPE_BIT_STRING,
  "bit varying": FIELD_TYPE_BIT_STRING,
  varbit: FIELD_TYPE_BIT_STRING,

  // ==================== 货币类型 ====================
  money: FIELD_TYPE_MONETARY,

  // ==================== 伪类型 ====================
  any: FIELD_TYPE_PSEUDO,
  anyarray: FIELD_TYPE_PSEUDO,
  anyelement: FIELD_TYPE_PSEUDO,
  void: FIELD_TYPE_PSEUDO,
  trigger: FIELD_TYPE_PSEUDO,
  language_handler: FIELD_TYPE_PSEUDO,
  internal: FIELD_TYPE_PSEUDO,
  opaque: FIELD_TYPE_PSEUDO,

  // ========== 复合类型 ==========
  composite: FIELD_TYPE_COMPOSITE, // 显式声明复合类型
  record: FIELD_TYPE_COMPOSITE, // 复合类型的别名（常用于函数返回）

  // ========== 域类型 ==========
  domain: FIELD_TYPE_DOMAIN, // 显式声明域类型

  // ==================== 其他扩展类型 ====================
  xml: FIELD_TYPE_TEXT_SEARCH, // XML 类型
  pg_lsn: FIELD_TYPE_TEXT_SEARCH, // 日志序列号
  txid_snapshot: FIELD_TYPE_TEXT_SEARCH, // 事务快照
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
