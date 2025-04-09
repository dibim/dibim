/**
 * 官方文档: https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql?view=sql-server-ver16
 */
import { SelectOption } from "@/components/SearchableSelect";

export const fieldTypeOptionsMssql: SelectOption[] = [
  // ================ 数值 | Numeric ================
  { value: "BIGINT", label: "BIGINT", group: "Numeric" },
  { value: "BIT", label: "BIT", group: "Numeric" },
  { value: "DECIMAL", label: "DECIMAL", group: "Numeric" },
  { value: "FLOAT", label: "FLOAT", group: "Numeric" },
  { value: "INT", label: "INT (int)", group: "Numeric" },
  { value: "MONEY", label: "MONEY", group: "Numeric" },
  { value: "NUMERIC", label: "NUMERIC (DECIMAL)", group: "Numeric" },
  { value: "REAL", label: "REAL (float)", group: "Numeric" },
  { value: "SMALLINT", label: "SMALLINT (smallint)", group: "Numeric" },
  { value: "SMALLMONEY", label: "SMALLMONEY", group: "Numeric" },
  { value: "TINYINT", label: "TINYINT (tinyint)", group: "Numeric" },

  // ================ 文本 | Character ================
  { value: "CHAR", label: "CHAR (char)", group: "Character" },
  { value: "NCHAR", label: "NCHAR (nchar)", group: "Character" },
  { value: "NTEXT", label: "NTEXT (已废弃)", group: "Character" },
  { value: "NVARCHAR", label: "NVARCHAR (nvarchar)", group: "Character" },
  { value: "NVARCHAR(MAX)", label: "NVARCHAR(MAX)", group: "Character" },
  { value: "TEXT", label: "TEXT (已废弃)", group: "Character" },
  { value: "VARCHAR", label: "VARCHAR (varchar)", group: "Character" },
  { value: "VARCHAR(MAX)", label: "VARCHAR(MAX)", group: "Character" },

  // ================ 日期/时间 | Date/Time ================
  { value: "DATE", label: "DATE", group: "Date/Time" },
  { value: "DATETIME2", label: "DATETIME2", group: "Date/Time" },
  { value: "DATETIME", label: "DATETIME", group: "Date/Time" },
  { value: "DATETIMEOFFSET", label: "DATETIMEOFFSET", group: "Date/Time" },
  { value: "SMALLDATETIME", label: "SMALLDATETIME", group: "Date/Time" },
  { value: "TIME", label: "TIME", group: "Date/Time" },

  // ================ 二进制 | Binary ================
  { value: "BINARY", label: "BINARY (binary)", group: "Binary" },
  { value: "IMAGE", label: "IMAGE (已废弃)", group: "Binary" },
  { value: "VARBINARY", label: "VARBINARY (varbinary)", group: "Binary" },
  { value: "VARBINARY(MAX)", label: "VARBINARY(MAX)", group: "Binary" },

  // ====================== 几何 | Geometric ======================
  { value: "GEOGRAPHY", label: "GEOGRAPHY", group: "Geometric" },
  { value: "GEOMETRY", label: "GEOMETRY", group: "Geometric" },

  // ================ 结构化数据 | Structured data ================
  { value: "JSON", label: "JSON", group: "Structured data" },
  { value: "XML", label: "XML", group: "Special" },

  // ================ 特殊 | Special ================
  { value: "ROWVERSION", label: "ROWVERSION", group: "Special" },
  { value: "SQL_VARIANT", label: "SQL_VARIANT", group: "Special" },
  { value: "UNIQUEIDENTIFIER", label: "UNIQUEIDENTIFIER", group: "Special" },
];
