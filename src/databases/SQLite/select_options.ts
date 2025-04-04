/**
 * 官方文档: https://www.sqlite.org/datatype3.html
 */
import { SelectOption } from "@/components/SearchableSelect";

export const fieldTypeOptionsSqlite: SelectOption[] = [
  // ================ 核心类型 ================
  { value: "integer", label: "INTEGER", group: "Numeric" },
  { value: "real", label: "REAL", group: "Numeric" },
  { value: "text", label: "TEXT", group: "String" },
  { value: "blob", label: "BLOB", group: "Binary" },
  { value: "numeric", label: "NUMERIC", group: "Numeric" },

  // ================ 兼容性别名 ================
  { value: "int", label: "INT (INTEGER 的别名)", group: "Numeric" },
  { value: "bigint", label: "BIGINT (INTEGER 的别名)", group: "Numeric" },
  { value: "float", label: "FLOAT (REAL 的别名)", group: "Numeric" },
  { value: "double", label: "DOUBLE (REAL 的别名)", group: "Numeric" },
  { value: "decimal", label: "DECIMAL (NUMERIC 的别名)", group: "Numeric" },
  { value: "varchar", label: "VARCHAR (TEXT 的别名)", group: "String" },
  { value: "char", label: "CHAR (TEXT 的别名)", group: "String" },
  // 日期/时间
  { value: "date", label: "DATE (存储为 TEXT/INTEGER)", group: "Date/Time" },
  { value: "datetime", label: "DATETIME (存储为 TEXT)", group: "Date/Time" },
  { value: "timestamp", label: "TIMESTAMP (存储为 INTEGER)", group: "Date/Time" },
];
