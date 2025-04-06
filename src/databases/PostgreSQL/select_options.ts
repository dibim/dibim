/**
 * 官方文档: https://www.postgresql.org/docs/current/datatype.html
 */
import { SelectOption } from "@/components/SearchableSelect";

export const fieldTypeOptionsPg: SelectOption[] = [
  // ================ 数值 | Numeric  ================
  { value: "bigint", label: "BIGINT (int8)", group: "Numeric" },
  { value: "bigserial", label: "BIGSERIAL (serial8)", group: "Numeric" },
  { value: "decimal", label: "DECIMAL (numeric)", group: "Numeric" },
  { value: "double precision", label: "DOUBLE PRECISION (float8)", group: "Numeric" },
  { value: "float4", label: "FLOAT4 (real)", group: "Numeric" },
  { value: "float8", label: "FLOAT8 (double precision)", group: "Numeric" },
  { value: "int2", label: "INT2 (smallint)", group: "Numeric" },
  { value: "int4", label: "INT4 (integer)", group: "Numeric" },
  { value: "int8", label: "INT8 (bigint)", group: "Numeric" },
  { value: "int", label: "INT (integer)", group: "Numeric" },
  { value: "integer", label: "INTEGER (int, int4)", group: "Numeric" },
  { value: "money", label: "MONEY", group: "Numeric" },
  { value: "numeric", label: "NUMERIC (decimal)", group: "Numeric" },
  { value: "real", label: "REAL (float4)", group: "Numeric" },
  { value: "serial2", label: "SERIAL2 (smallserial)", group: "Numeric" },
  { value: "serial4", label: "SERIAL4 (serial)", group: "Numeric" },
  { value: "serial8", label: "SERIAL8 (bigserial)", group: "Numeric" },
  { value: "serial", label: "SERIAL (serial4)", group: "Numeric" },
  { value: "smallint", label: "SMALLINT (int2)", group: "Numeric" },
  { value: "smallserial", label: "SMALLSERIAL (serial2)", group: "Numeric" },

  // ================ 文本 | Text ================
  { value: "bpchar", label: "BPCHAR (character)", group: "Character" },
  { value: "char", label: "CHAR(n)", group: "Character" },
  { value: "character varying", label: "VARCHAR(n) (varchar)", group: "Character" },
  { value: "character", label: "CHAR(n) (bpchar)", group: "Character" },
  { value: "text", label: "TEXT", group: "Character" },
  { value: "varchar", label: "VARCHAR(n)", group: "Character" },

  // ================ 日期/时间 | Date/Time ================
  { value: "date", label: "DATE", group: "Date/Time" },
  { value: "interval", label: "INTERVAL", group: "Date/Time" },
  { value: "time with time zone", label: "TIME WITH TIME ZONE (timetz)", group: "Date/Time" },
  { value: "time without time zone", label: "TIME WITHOUT TIME ZONE (time)", group: "Date/Time" },
  { value: "time", label: "TIME (无时区)", group: "Date/Time" },
  { value: "timestamp with time zone", label: "TIMESTAMP WITH TIME ZONE (timestamptz)", group: "Date/Time" },
  { value: "timestamp without time zone", label: "TIMESTAMP WITHOUT TIME ZONE (timestamp)", group: "Date/Time" },
  { value: "timestamp", label: "TIMESTAMP (无时区)", group: "Date/Time" },
  { value: "timestamptz", label: "TIMESTAMPTZ", group: "Date/Time" },
  { value: "timetz", label: "TIMETZ", group: "Date/Time" },

  // ================ 二进制 | Binary ================
  { value: "bytea", label: "BYTEA", group: "Binary" },

  // ====================== 几何类 | Geometric ======================
  { value: "point", label: "POINT", group: "Geometric" },
  { value: "line", label: "LINE", group: "Geometric" },
  { value: "lseg", label: "LSEG", group: "Geometric" },
  { value: "box", label: "BOX", group: "Geometric" },
  { value: "path", label: "PATH", group: "Geometric" },
  { value: "polygon", label: "POLYGON", group: "Geometric" },
  { value: "circle", label: "CIRCLE", group: "Geometric" },

  // ================ 布尔 | Boolean ================
  { value: "bool", label: "BOOL (boolean)", group: "Boolean" },
  { value: "boolean", label: "BOOLEAN (bool)", group: "Boolean" },

  // ====================== 结构化数据 | Structured data ======================
  { value: "json", label: "JSON", group: "Structured data" },
  { value: "jsonb", label: "JSONB", group: "Structured data" },
  { value: "jsonpath", label: "JSONPATH", group: "Structured data" },
  { value: "xml", label: "XML", group: "Structured data" },

  // ====================== 网络 | Network ======================
  { value: "cidr", label: "CIDR", group: "Network" },
  { value: "inet", label: "INET", group: "Network" },
  { value: "macaddr", label: "MACADDR", group: "Network" },
  { value: "macaddr8", label: "MACADDR8", group: "Network" },

  // ====================== 位串 | Bit string ======================
  { value: "bit", label: "BIT(n)", group: "Bit string" },
  { value: "bit varying", label: "BIT VARYING(n) (varbit)", group: "Bit string" },
  { value: "varbit", label: "VARBIT(n)", group: "Bit string" },

  // ====================== 文本搜索 | Text search ======================
  { value: "tsvector", label: "TSVECTOR", group: "Text search" },
  { value: "tsquery", label: "TSQUERY", group: "Text search" },

  // ====================== 范围 | Range ======================
  { value: "int4range", label: "INT4RANGE", group: "Range" },
  { value: "int8range", label: "INT8RANGE", group: "Range" },
  { value: "numrange", label: "NUMRANGE", group: "Range" },
  { value: "tsrange", label: "TSRANGE", group: "Range" },
  { value: "tstzrange", label: "TSTZRANGE", group: "Range" },
  { value: "daterange", label: "DATERANGE", group: "Range" },

  // ================ 特殊 | Special ================
  { value: "enum", label: "ENUM", group: "Special" },
  { value: "uuid", label: "UUID", group: "Special" },
  { value: "domain", label: "Domain", group: "Special" },

  //
  //
  // 以下类型不应当在建表的时候使用
  // The following types should not be used when creating tables
  //
  //

  // ====================== 对象标识符类型 | Object identifier ======================
  // { value: "oid", label: "OID", group: "Object identifier" },
  // { value: "regproc", label: "REGPROC", group: "Object identifier" },
  // { value: "regprocedure", label: "REGPROCEDURE", group: "Object identifier" },
  // { value: "regoper", label: "REGOPER", group: "Object identifier" },
  // { value: "regoperator", label: "REGOPERATOR", group: "Object identifier" },
  // { value: "regclass", label: "REGCLASS", group: "Object identifier" },
  // { value: "regtype", label: "REGTYPE", group: "Object identifier" },
  // { value: "regrole", label: "REGROLE", group: "Object identifier" },
  // { value: "regnamespace", label: "REGNAMESPACE", group: "Object identifier" },
  // { value: "regconfig", label: "REGCONFIG", group: "Object identifier" },
  // { value: "regdictionary", label: "REGDICTIONARY", group: "Object identifier" },

  // ====================== 伪类型 | Pseudo ======================
  // { value: "any", label: "ANY", group: "Pseudo" },
  // { value: "anyelement", label: "ANYELEMENT", group: "Pseudo" },
  // { value: "anyarray", label: "ANYARRAY", group: "Pseudo" },
  // { value: "anynonarray", label: "ANYNONARRAY", group: "Pseudo" },
  // { value: "anyenum", label: "ANYENUM", group: "Pseudo" },
  // { value: "anyrange", label: "ANYRANGE", group: "Pseudo" },
  // { value: "record", label: "RECORD", group: "Pseudo" },
  // { value: "trigger", label: "TRIGGER", group: "Pseudo" },
  // { value: "void", label: "VOID", group: "Pseudo" },
  // { value: "language_handler", label: "LANGUAGE_HANDLER", group: "Pseudo" },

  // ====================== 内部系统 | Internal ======================
  // { value: "pg_lsn", label: "PG_LSN", group: "Internal" },
  // { value: "txid_snapshot", label: "TXID_SNAPSHOT", group: "Internal" },
  // { value: "pg_snapshot", label: "PG_SNAPSHOT", group: "Internal" },
  // { value: "xid", label: "XID", group: "Internal" },
  // { value: "cid", label: "CID", group: "Internal" },
  // { value: "xid8", label: "XID8", group: "Internal" },
];
