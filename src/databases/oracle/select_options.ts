/**
 * 官方文档: https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/Data-Types.html
 */
import { SelectOption } from "@/components/SearchableSelect";

export const fieldTypeOptionsOracle: SelectOption[] = [
  // ================ 数值 | Numeric ================
  { value: "BINARY_DOUBLE", label: "BINARY_DOUBLE", group: "Numeric" },
  { value: "BINARY_FLOAT", label: "BINARY_FLOAT", group: "Numeric" },
  { value: "DECIMAL", label: "DECIMAL (NUMBER)", group: "Numeric" },
  { value: "FLOAT", label: "FLOAT", group: "Numeric" },
  { value: "INT", label: "INT (NUMBER(38))", group: "Numeric" },
  { value: "INTEGER", label: "INTEGER (NUMBER(38))", group: "Numeric" },
  { value: "MONEY", label: "MONEY (NUMBER)", group: "Numeric" },
  { value: "NUMBER", label: "NUMBER", group: "Numeric" },
  { value: "NUMERIC", label: "NUMERIC (NUMBER)", group: "Numeric" },
  { value: "REAL", label: "REAL (BINARY_FLOAT)", group: "Numeric" },
  { value: "SMALLINT", label: "SMALLINT (NUMBER(38))", group: "Numeric" },

  // ================ 文本 | Character ================
  { value: "CHAR", label: "CHAR", group: "Character" },
  { value: "CLOB", label: "CLOB", group: "Character" },
  { value: "LONG", label: "LONG", group: "Character" },
  { value: "NCHAR", label: "NCHAR", group: "Character" },
  { value: "NCLOB", label: "NCLOB", group: "Character" },
  { value: "NVARCHAR2", label: "NVARCHAR2", group: "Character" },
  { value: "NVARCHAR", label: "NVARCHAR (NVARCHAR2)", group: "Character" },
  { value: "VARCHAR2", label: "VARCHAR2", group: "Character" },
  { value: "VARCHAR", label: "VARCHAR (VARCHAR2)", group: "Character" },

  // ================ 日期/时间 | Date/Time ================
  { value: "DATE", label: "DATE", group: "Date/Time" },
  { value: "INTERVAL DAY TO SECOND", label: "INTERVAL DAY TO SECOND", group: "Date/Time" },
  { value: "INTERVAL YEAR TO MONTH", label: "INTERVAL YEAR TO MONTH", group: "Date/Time" },
  { value: "TIMESTAMP WITH LOCAL TIME ZONE", label: "TIMESTAMP WITH LOCAL TIME ZONE", group: "Date/Time" },
  { value: "TIMESTAMP WITH TIME ZONE", label: "TIMESTAMP WITH TIME ZONE", group: "Date/Time" },
  { value: "TIMESTAMP", label: "TIMESTAMP", group: "Date/Time" },

  // ================ 二进制 | Binary ================
  { value: "BFILE", label: "BFILE", group: "Binary" },
  { value: "BLOB", label: "BLOB", group: "Binary" },
  { value: "IMAGE", label: "IMAGE (BLOB)", group: "Binary" },
  { value: "LONG RAW", label: "LONG RAW", group: "Binary" },
  { value: "RAW", label: "RAW", group: "Binary" },
  { value: "VARBINARY", label: "VARBINARY (RAW)", group: "Binary" },

  // ================ 布尔 | Boolean ================
  { value: "BOOLEAN", label: "BOOLEAN", group: "Boolean" },

  // ================ 结构化数据 | Structured data ================
  { value: "JSON", label: "JSON", group: "Structured data" },
  { value: "XMLTYPE", label: "XMLTYPE", group: "Structured data" },

  // ================ 几何 | Geometric ================
  { value: "SDO_ELEM_INFO_ARRAY", label: "SDO_ELEM_INFO_ARRAY", group: "Geometric" },
  { value: "SDO_GEOMETRY", label: "SDO_GEOMETRY", group: "Geometric" },
  { value: "SDO_ORDINATE_ARRAY", label: "SDO_ORDINATE_ARRAY", group: "Geometric" },
  { value: "SDO_POINT_TYPE", label: "SDO_POINT_TYPE", group: "Geometric" },

  // ================ 特殊 | Special ================
  { value: "ANYDATA", label: "ANYDATA", group: "Special" },
  { value: "ANYDATASET", label: "ANYDATASET", group: "Special" },
  { value: "ANYREF", label: "ANYREF", group: "Special" },
  { value: "ANYTYPE", label: "ANYTYPE", group: "Special" },
  { value: "REF", label: "REF", group: "Special" },
  { value: "ROWID", label: "ROWID", group: "Special" },
  { value: "UROWID", label: "UROWID", group: "Special" },
  { value: "URTYPE", label: "URTYPE", group: "Special" },
  { value: "VECTOR", label: "VECTOR", group: "Special" },
];
