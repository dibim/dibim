/**
 * 官方文档: https://dev.mysql.com/doc/refman/8.0/en/data-types.html
 */
import { SelectOption } from "@/components/SearchableSelect";

export const fieldTypeOptionsMysql: SelectOption[] = [
  // ================ 数值 | Numeric  ================
  { value: "BIGINT", label: "BIGINT", group: "Numeric" },
  { value: "DECIMAL", label: "DECIMAL (NUMERIC)", group: "Numeric" },
  { value: "DOUBLE PRECISION", label: "DOUBLE PRECISION (DOUBLE)", group: "Numeric" },
  { value: "DOUBLE", label: "DOUBLE (DOUBLE PRECISION)", group: "Numeric" },
  { value: "FLOAT", label: "FLOAT", group: "Numeric" },
  { value: "INT", label: "INT (INTEGER)", group: "Numeric" },
  { value: "INTEGER", label: "INTEGER (INT)", group: "Numeric" },
  { value: "MEDIUMINT", label: "MEDIUMINT", group: "Numeric" },
  { value: "NUMERIC", label: "NUMERIC (DECIMAL)", group: "Numeric" },
  { value: "SERIAL", label: "SERIAL (BIGINT 别名)", group: "Numeric" },
  { value: "SMALLINT", label: "SMALLINT", group: "Numeric" },
  { value: "TINYINT", label: "TINYINT", group: "Numeric" },

  // ================ 文本 | Text ================
  { value: "CHAR", label: "CHAR", group: "String" },
  { value: "LONGTEXT", label: "LONGTEXT", group: "String" },
  { value: "MEDIUMTEXT", label: "MEDIUMTEXT", group: "String" },
  { value: "NATIONAL CHAR", label: "NATIONAL CHAR (NCHAR)", group: "String" },
  { value: "NATIONAL VARCHAR", label: "NATIONAL VARCHAR (NVARCHAR)", group: "String" },
  { value: "NCHAR", label: "NCHAR (NATIONAL CHAR)", group: "String" },
  { value: "NVARCHAR", label: "NVARCHAR (NATIONAL VARCHAR)", group: "String" },
  { value: "TEXT", label: "TEXT", group: "String" },
  { value: "TINYTEXT", label: "TINYTEXT", group: "String" },
  { value: "VARCHAR", label: "VARCHAR", group: "String" },

  // ================ 日期/时间 | Date/Time ================
  { value: "DATE", label: "DATE", group: "Date/Time" },
  { value: "DATETIME", label: "DATETIME", group: "Date/Time" },
  { value: "TIME", label: "TIME", group: "Date/Time" },
  { value: "TIMESTAMP", label: "TIMESTAMP", group: "Date/Time" },
  { value: "YEAR", label: "YEAR", group: "Date/Time" },

  // ================ 二进制 | Binary ================
  { value: "BINARY", label: "BINARY", group: "Binary" },
  { value: "BIT", label: "BIT", group: "Binary" },
  { value: "BLOB", label: "BLOB", group: "Binary" },
  { value: "LONGBLOB", label: "LONGBLOB", group: "Binary" },
  { value: "MEDIUMBLOB", label: "MEDIUMBLOB", group: "Binary" },
  { value: "TINYBLOB", label: "TINYBLOB", group: "Binary" },
  { value: "VARBINARY", label: "VARBINARY", group: "Binary" },

  // ================ 几何 | Geometry ================
  { value: "GEOMETRY", label: "GEOMETRY", group: "Geometry" },
  { value: "POINT", label: "POINT", group: "Geometry" },
  { value: "LINESTRING", label: "LINESTRING", group: "Geometry" },
  { value: "POLYGON", label: "POLYGON", group: "Geometry" },
  { value: "MULTIPOINT", label: "MULTIPOINT", group: "Geometry" },
  { value: "MULTILINESTRING", label: "MULTILINESTRING", group: "Geometry" },
  { value: "MULTIPOLYGON", label: "MULTIPOLYGON", group: "Geometry" },
  { value: "GEOMETRYCOLLECTION", label: "GEOMETRYCOLLECTION", group: "Geometry" },

  // ================ 布尔 | Boolean ================
  { value: "BOOL", label: "BOOL (TINYINT 别名)", group: "Boolean" },
  { value: "BOOLEAN", label: "BOOLEAN (同 BOOL)", group: "Boolean" },

  // ====================== 结构化数据 | Structured data ======================
  { value: "JSON", label: "JSON", group: "Structured data" },
  { value: "SET", label: "SET", group: "Structured data" },

  // ================ 特殊 | Special ================
  { value: "ENUM", label: "ENUM", group: "Special" },
];
