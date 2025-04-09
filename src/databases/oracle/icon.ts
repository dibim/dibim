import {
  FIELD_ARRAY,
  FIELD_BINARY,
  FIELD_BOOLEAN,
  FIELD_CHARACTER,
  FIELD_DATETIME,
  FIELD_GEOMETRIC,
  FIELD_JSON,
  FIELD_NUMERIC,
  FIELD_OTHER,
} from "../constants";

const typeCategoryMap: Record<string, string> = {
  // ================ 数值 | Numeric  ================
  "NUMBER(1)": FIELD_BOOLEAN, // Oracle 的布尔类型通常用 NUMBER(1) 表示
  BINARY_DOUBLE: FIELD_NUMERIC,
  BINARY_FLOAT: FIELD_NUMERIC,
  DECIMAL: FIELD_NUMERIC,
  FLOAT: FIELD_NUMERIC,
  INT: FIELD_NUMERIC,
  INTEGER: FIELD_NUMERIC,
  MONEY: FIELD_NUMERIC,
  NUMBER: FIELD_NUMERIC,
  NUMERIC: FIELD_NUMERIC,
  REAL: FIELD_NUMERIC,
  SMALLINT: FIELD_NUMERIC,

  // ================ 文本 | Text ================
  CHAR: FIELD_CHARACTER,
  LONG: FIELD_CHARACTER,
  NCHAR: FIELD_CHARACTER,
  NVARCHAR2: FIELD_CHARACTER,
  TEXT: FIELD_CHARACTER,
  VARCHAR2: FIELD_CHARACTER,
  VARCHAR: FIELD_CHARACTER,

  // ================ 日期/时间 | Date/Time ================
  "TIMESTAMP WITH LOCAL TIME ZONE": FIELD_DATETIME,
  "TIMESTAMP WITH TIME ZONE": FIELD_DATETIME,
  "TIMESTAMP(6)": FIELD_DATETIME,
  DATE: FIELD_DATETIME,
  INTERVAL: FIELD_DATETIME,
  TIMESTAMP: FIELD_DATETIME,

  // ================ 二进制 | Binary ================
  BFILE: FIELD_BINARY,
  BLOB: FIELD_BINARY,
  IMAGE: FIELD_BINARY,
  LONG_RAW: FIELD_BINARY,
  RAW: FIELD_BINARY,
  VARBINARY: FIELD_BINARY,

  // ====================== 几何 | Geometric ======================
  SDO_ELEM_INFO_ARRAY: FIELD_GEOMETRIC,
  SDO_GEOMETRY: FIELD_GEOMETRIC,
  SDO_ORDINATE_ARRAY: FIELD_GEOMETRIC,
  SDO_POINT_TYPE: FIELD_GEOMETRIC,

  // ================ 布尔 | Boolean ================
  BOOLEAN: FIELD_BOOLEAN,

  // ====================== 结构化数据 | Structured data ======================
  JSON: FIELD_JSON,
  XMLTYPE: FIELD_OTHER,

  // ================ 特殊 | Special ================
  ANYDATA: FIELD_OTHER,
  ANYDATASET: FIELD_OTHER,
  ANYREF: FIELD_OTHER,
  ANYTYPE: FIELD_OTHER,
  CLOB: FIELD_OTHER,
  NCLOB: FIELD_OTHER,
  REF: FIELD_OTHER,
  ROWID: FIELD_OTHER,
  UROWID: FIELD_OTHER,
  URTYPE: FIELD_OTHER,

  // 其它类型不应当在建表的时候使用
};

/**
 * 根据 Oracle 数据类型名称返回对应的分类常量
 * @param typeName 类型名称（不区分大小写，支持别名）
 * @returns 分类常量，未找到时返回 undefined
 */
export function getDataTypeCategoryOracle(typeName: string): string | undefined {
  if (!typeName) return undefined;

  // 标准化输入：转小写、移除多余空格、移除[]（如 `VARCHAR2[]` -> `VARCHAR2`）
  const normalized = typeName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // 合并多余空格
    .replace(/\s*\[\s*\]/g, ""); // 移除数组标记（单独处理）

  // 直接匹配已知类型
  if (typeCategoryMap[normalized]) {
    return typeCategoryMap[normalized];
  }

  // 处理数组类型（如 `VARCHAR2[]` -> `VARCHAR2`）
  if (normalized.endsWith("[]")) {
    const baseType = normalized.slice(0, -2);
    return typeCategoryMap[baseType] || FIELD_ARRAY;
  }

  // 未找到匹配
  return undefined;
}
