/**
 * 官方文档: https://www.sqlite.org/datatype3.html
 */
import { SelectOption } from "@/components/SearchableSelect";

export const fieldTypeOptionsSqlite: SelectOption[] = [
  // ================ 核心类型 ================
  { value: "INTEGER", label: "INTEGER", group: "Numeric" },
  { value: "REAL", label: "REAL", group: "Numeric" },
  { value: "TEXT", label: "TEXT", group: "String" },
  { value: "BLOB", label: "BLOB", group: "Binary" },
  { value: "NUMERIC", label: "NUMERIC", group: "Numeric" },

  // ================ 兼容性别名 ================
  // 日期/时间
  { value: "DATE", label: "DATE (存储为 TEXT/INTEGER)", group: "Date/Time" },
  { value: "DATETIME", label: "DATETIME (存储为 TEXT)", group: "Date/Time" },
  { value: "TIMESTAMP", label: "TIMESTAMP (存储为 INTEGER)", group: "Date/Time" },
  // 其它
  { value: "INT", label: "INT (INTEGER 的别名)", group: "Numeric" },
  { value: "BIGINT", label: "BIGINT (INTEGER 的别名)", group: "Numeric" },
  { value: "FLOAT", label: "FLOAT (REAL 的别名)", group: "Numeric" },
  { value: "DOUBLE", label: "DOUBLE (REAL 的别名)", group: "Numeric" },
  { value: "DECIMAL", label: "DECIMAL (NUMERIC 的别名)", group: "Numeric" },
  { value: "VARCHAR", label: "VARCHAR (TEXT 的别名)", group: "String" },
  { value: "CHAR", label: "CHAR (TEXT 的别名)", group: "String" },
];
