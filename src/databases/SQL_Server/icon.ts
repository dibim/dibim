import {
  FIELD_ARRAY,
  FIELD_BINARY,
  FIELD_BOOLEAN,
  FIELD_CHARACTER,
  FIELD_DATETIME,
  FIELD_GEOMETRIC,
  FIELD_JSON,
  FIELD_NETWORK,
  FIELD_NUMERIC,
  FIELD_OTHER,
} from "@/constants";

const typeCategoryMap: Record<string, string> = {
  // ================ 数值 | Numeric  ================
  BIGINT: FIELD_NUMERIC,
  BIT: FIELD_BOOLEAN,
  DECIMAL: FIELD_NUMERIC,
  FLOAT: FIELD_NUMERIC,
  INT: FIELD_NUMERIC,
  MONEY: FIELD_NUMERIC,
  NUMERIC: FIELD_NUMERIC,
  REAL: FIELD_NUMERIC,
  SMALLINT: FIELD_NUMERIC,
  SMALLMONEY: FIELD_NUMERIC,
  TINYINT: FIELD_NUMERIC,

  // ================ 文本 | Text ================
  "NVARCHAR(MAX)": FIELD_CHARACTER,
  "VARCHAR(MAX)": FIELD_CHARACTER,
  CHAR: FIELD_CHARACTER,
  NCHAR: FIELD_CHARACTER,
  NTEXT: FIELD_CHARACTER,
  NVARCHAR: FIELD_CHARACTER,
  TEXT: FIELD_CHARACTER,
  VARCHAR: FIELD_CHARACTER,

  // ================ 日期/时间 | Date/Time ================
  DATE: FIELD_DATETIME,
  DATETIME2: FIELD_DATETIME,
  DATETIME: FIELD_DATETIME,
  DATETIMEOFFSET: FIELD_DATETIME,
  SMALLDATETIME: FIELD_DATETIME,
  TIME: FIELD_DATETIME,

  // ================ 二进制 | Binary ================
  "VARBINARY(MAX)": FIELD_BINARY,
  BINARY: FIELD_BINARY,
  IMAGE: FIELD_BINARY,
  VARBINARY: FIELD_BINARY,

  // ====================== 几何 | Geometric ======================
  GEOMETRY: FIELD_GEOMETRIC,
  GEOGRAPHY: FIELD_GEOMETRIC,

  // ====================== 结构化数据 | Structured data ======================
  JSON: FIELD_JSON,
  XML: FIELD_OTHER,

  // ================ 特殊 | Special ================
  ROWVERSION: FIELD_OTHER,
  SQL_VARIANT: FIELD_OTHER,
  UNIQUEIDENTIFIER: FIELD_OTHER,
  // 其它类型不应当在建表的时候使用
};

/**
 * 根据 SQL Server 数据类型名称返回对应的分类常量
 * @param typeName 类型名称（不区分大小写，支持别名）
 * @returns 分类常量，未找到时返回 undefined
 */
export function getDataTypeCategoryMssql(typeName: string): string | undefined {
  if (!typeName) return undefined;

  // 标准化输入：转小写、移除多余空格、移除[]（如 `VARCHAR[]` -> `VARCHAR`）
  const normalized = typeName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // 合并多余空格
    .replace(/\s*\[\s*\]/g, ""); // 移除数组标记（单独处理）

  // 直接匹配已知类型
  if (typeCategoryMap[normalized]) {
    return typeCategoryMap[normalized];
  }

  // 处理数组类型（如 `VARCHAR[]` -> `VARCHAR`）
  if (normalized.endsWith("[]")) {
    const baseType = normalized.slice(0, -2);
    return typeCategoryMap[baseType] || FIELD_ARRAY;
  }

  // 未找到匹配
  return undefined;
}
