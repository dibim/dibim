/**
 * 官方文档: https://www.sqlite.org/datatype3.html
 */
import { SelectOption } from "@/components/SearchableSelect";

export const fieldTypeOptionsSqlite: SelectOption[] = [
  // ================ 核心类型 ================
  { value: "INTEGER", label: "INTEGER (INT, BIGINT)", group: "Numeric" },
  { value: "REAL", label: "REAL (FLOAT, DOUBLE)", group: "Numeric" },
  { value: "TEXT", label: "TEXT (VARCHAR, CLOB)", group: "String" },
  { value: "BLOB", label: "BLOB", group: "Binary" },
  { value: "NUMERIC", label: "NUMERIC (DECIMAL)", group: "Numeric" },

  // ================ 兼容性别名 ================
  { value: "INT", label: "INT (INTEGER别名)", group: "Numeric" },
  { value: "BIGINT", label: "BIGINT (INTEGER别名)", group: "Numeric" },
  { value: "FLOAT", label: "FLOAT (REAL别名)", group: "Numeric" },
  { value: "DOUBLE", label: "DOUBLE (REAL别名)", group: "Numeric" },
  { value: "DECIMAL", label: "DECIMAL (NUMERIC别名)", group: "Numeric" },
  { value: "VARCHAR", label: "VARCHAR (TEXT别名)", group: "String" },
  { value: "CHAR", label: "CHAR (TEXT别名)", group: "String" },
  { value: "CLOB", label: "CLOB (TEXT别名)", group: "String" },

  // ================ 日期时间兼容类型 ================
  { value: "DATE", label: "DATE (存储为TEXT/INTEGER)", group: "Date/Time" },
  { value: "DATETIME", label: "DATETIME (存储为TEXT)", group: "Date/Time" },
  { value: "TIMESTAMP", label: "TIMESTAMP (存储为INTEGER)", group: "Date/Time" },
];
