/**
 * 官方文档: https://dev.mysql.com/doc/refman/8.0/en/data-types.html
 */
import { SelectOption } from "@/components/SearchableSelect";

export const fieldTypeOptionsMysql: SelectOption[] = [
  // ================ 数值类型 (Exact) ================
  { value: "TINYINT", label: "TINYINT", group: "Numeric" },
  { value: "SMALLINT", label: "SMALLINT", group: "Numeric" },
  { value: "MEDIUMINT", label: "MEDIUMINT", group: "Numeric" },
  { value: "INT", label: "INT (INTEGER)", group: "Numeric" },
  { value: "INTEGER", label: "INTEGER (INT)", group: "Numeric" }, // 官方别名
  { value: "BIGINT", label: "BIGINT", group: "Numeric" },

  { value: "DECIMAL", label: "DECIMAL (NUMERIC)", group: "Numeric" }, // 8.0 官方文档第 11.1.1 节
  { value: "NUMERIC", label: "NUMERIC (DECIMAL)", group: "Numeric" }, // 完全等同于 DECIMAL

  // ================ 数值类型 (Approximate) ================
  { value: "FLOAT", label: "FLOAT", group: "Numeric" },
  { value: "DOUBLE", label: "DOUBLE (DOUBLE PRECISION)", group: "Numeric" }, // 8.0 文档 11.1.2
  { value: "DOUBLE PRECISION", label: "DOUBLE PRECISION (DOUBLE)", group: "Numeric" },

  // ================ 位类型 ================
  { value: "BIT", label: "BIT", group: "Binary" }, // 8.0 文档 11.1.5

  // ================ 日期时间类型 ================
  { value: "DATE", label: "DATE", group: "Date/Time" },
  { value: "TIME", label: "TIME", group: "Date/Time" },
  { value: "DATETIME", label: "DATETIME", group: "Date/Time" },
  { value: "TIMESTAMP", label: "TIMESTAMP", group: "Date/Time" },
  { value: "YEAR", label: "YEAR", group: "Date/Time" },

  // ================ 字符串类型 ================
  { value: "CHAR", label: "CHAR", group: "String" },
  { value: "VARCHAR", label: "VARCHAR", group: "String" },
  { value: "BINARY", label: "BINARY", group: "Binary" }, // 定长二进制
  { value: "VARBINARY", label: "VARBINARY", group: "Binary" }, // 变长二进制

  // ================ 文本类型 ================
  { value: "TINYTEXT", label: "TINYTEXT", group: "Text" },
  { value: "TEXT", label: "TEXT", group: "Text" },
  { value: "MEDIUMTEXT", label: "MEDIUMTEXT", group: "Text" },
  { value: "LONGTEXT", label: "LONGTEXT", group: "Text" },

  // ================ 二进制大对象 ================
  { value: "TINYBLOB", label: "TINYBLOB", group: "Binary" },
  { value: "BLOB", label: "BLOB", group: "Binary" },
  { value: "MEDIUMBLOB", label: "MEDIUMBLOB", group: "Binary" },
  { value: "LONGBLOB", label: "LONGBLOB", group: "Binary" },

  // ================ 特殊类型 ================
  { value: "ENUM", label: "ENUM", group: "Special" }, // 文档 11.3.5
  { value: "SET", label: "SET", group: "Special" }, // 文档 11.3.6
  { value: "JSON", label: "JSON", group: "JSON" }, // 文档 11.5
  { value: "GEOMETRY", label: "GEOMETRY", group: "Spatial" }, // 文档 11.4.4

  // ================ 布尔别名 ================
  { value: "BOOLEAN", label: "BOOLEAN (TINYINT(1))", group: "Boolean" }, // 文档 11.1.6
];
