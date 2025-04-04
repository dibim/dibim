/**
 * 官方文档: https://www.postgresql.org/docs/current/datatype.html
 */
import { SelectOption } from "@/components/SearchableSelect";

export const fieldTypeOptionsPg: SelectOption[] = [
  // ====================== 数值类型 ======================
  { value: "smallint", label: "SMALLINT (int2)", group: "Numeric Types" },
  { value: "int2", label: "INT2 (smallint)", group: "Numeric Types" },
  { value: "integer", label: "INTEGER (int, int4)", group: "Numeric Types" },
  { value: "int4", label: "INT4 (integer)", group: "Numeric Types" },
  { value: "int", label: "INT (integer)", group: "Numeric Types" },
  { value: "bigint", label: "BIGINT (int8)", group: "Numeric Types" },
  { value: "int8", label: "INT8 (bigint)", group: "Numeric Types" },
  { value: "decimal", label: "DECIMAL (numeric)", group: "Numeric Types" },
  { value: "numeric", label: "NUMERIC (decimal)", group: "Numeric Types" },
  { value: "real", label: "REAL (float4)", group: "Numeric Types" },
  { value: "float4", label: "FLOAT4 (real)", group: "Numeric Types" },
  { value: "double precision", label: "DOUBLE PRECISION (float8)", group: "Numeric Types" },
  { value: "float8", label: "FLOAT8 (double precision)", group: "Numeric Types" },
  { value: "smallserial", label: "SMALLSERIAL (serial2)", group: "Numeric Types" },
  { value: "serial2", label: "SERIAL2 (smallserial)", group: "Numeric Types" },
  { value: "serial", label: "SERIAL (serial4)", group: "Numeric Types" },
  { value: "serial4", label: "SERIAL4 (serial)", group: "Numeric Types" },
  { value: "bigserial", label: "BIGSERIAL (serial8)", group: "Numeric Types" },
  { value: "serial8", label: "SERIAL8 (bigserial)", group: "Numeric Types" },

  // ====================== 货币类型 ======================
  { value: "money", label: "MONEY", group: "Monetary Types" },

  // ====================== 字符类型 ======================
  { value: "character varying", label: "VARCHAR(n) (varchar)", group: "Character Types" },
  { value: "varchar", label: "VARCHAR(n)", group: "Character Types" },
  { value: "character", label: "CHAR(n) (bpchar)", group: "Character Types" },
  { value: "char", label: "CHAR(n)", group: "Character Types" },
  { value: "bpchar", label: "BPCHAR (character)", group: "Character Types" },
  { value: "text", label: "TEXT", group: "Character Types" },

  // ====================== 二进制类型 ======================
  { value: "bytea", label: "BYTEA", group: "Binary Types" },

  // ====================== 日期/时间类型 ======================
  { value: "timestamp", label: "TIMESTAMP (无时区)", group: "Date/Time Types" },
  { value: "timestamp without time zone", label: "TIMESTAMP WITHOUT TIME ZONE (timestamp)", group: "Date/Time Types" },
  { value: "timestamp with time zone", label: "TIMESTAMP WITH TIME ZONE (timestamptz)", group: "Date/Time Types" },
  { value: "timestamptz", label: "TIMESTAMPTZ", group: "Date/Time Types" },
  { value: "date", label: "DATE", group: "Date/Time Types" },
  { value: "time", label: "TIME (无时区)", group: "Date/Time Types" },
  { value: "time without time zone", label: "TIME WITHOUT TIME ZONE (time)", group: "Date/Time Types" },
  { value: "time with time zone", label: "TIME WITH TIME ZONE (timetz)", group: "Date/Time Types" },
  { value: "timetz", label: "TIMETZ", group: "Date/Time Types" },
  { value: "interval", label: "INTERVAL", group: "Date/Time Types" },

  // ====================== 布尔类型 ======================
  { value: "boolean", label: "BOOLEAN (bool)", group: "Boolean Type" },
  { value: "bool", label: "BOOL (boolean)", group: "Boolean Type" },

  // ====================== 枚举类型 ======================
  { value: "enum", label: "ENUM", group: "Enumerated Types" },

  // ====================== 几何类型 ======================
  { value: "point", label: "POINT", group: "Geometric Types" },
  { value: "line", label: "LINE", group: "Geometric Types" },
  { value: "lseg", label: "LSEG", group: "Geometric Types" },
  { value: "box", label: "BOX", group: "Geometric Types" },
  { value: "path", label: "PATH", group: "Geometric Types" },
  { value: "polygon", label: "POLYGON", group: "Geometric Types" },
  { value: "circle", label: "CIRCLE", group: "Geometric Types" },

  // ====================== 网络地址类型 ======================
  { value: "cidr", label: "CIDR", group: "Network Address Types" },
  { value: "inet", label: "INET", group: "Network Address Types" },
  { value: "macaddr", label: "MACADDR", group: "Network Address Types" },
  { value: "macaddr8", label: "MACADDR8", group: "Network Address Types" },

  // ====================== 位串类型 ======================
  { value: "bit", label: "BIT(n)", group: "Bit String Types" },
  { value: "bit varying", label: "BIT VARYING(n) (varbit)", group: "Bit String Types" },
  { value: "varbit", label: "VARBIT(n)", group: "Bit String Types" },

  // ====================== 文本搜索类型 ======================
  { value: "tsvector", label: "TSVECTOR", group: "Text Search Types" },
  { value: "tsquery", label: "TSQUERY", group: "Text Search Types" },
  { value: "jsonpath", label: "JSONPATH", group: "Text Search Types" },

  // ====================== UUID 类型 ======================
  { value: "uuid", label: "UUID", group: "UUID Type" },

  // ====================== XML 类型 ======================
  { value: "xml", label: "XML", group: "XML Type" },

  // ====================== JSON 类型 ======================
  { value: "json", label: "JSON", group: "JSON Types" },
  { value: "jsonb", label: "JSONB", group: "JSON Types" },

  // ====================== 范围类型 ======================
  { value: "int4range", label: "INT4RANGE", group: "Range Types" },
  { value: "int8range", label: "INT8RANGE", group: "Range Types" },
  { value: "numrange", label: "NUMRANGE", group: "Range Types" },
  { value: "tsrange", label: "TSRANGE", group: "Range Types" },
  { value: "tstzrange", label: "TSTZRANGE", group: "Range Types" },
  { value: "daterange", label: "DATERANGE", group: "Range Types" },

  // ====================== 对象标识符类型 ======================
  { value: "oid", label: "OID", group: "Object Identifier Types" },
  { value: "regproc", label: "REGPROC", group: "Object Identifier Types" },
  { value: "regprocedure", label: "REGPROCEDURE", group: "Object Identifier Types" },
  { value: "regoper", label: "REGOPER", group: "Object Identifier Types" },
  { value: "regoperator", label: "REGOPERATOR", group: "Object Identifier Types" },
  { value: "regclass", label: "REGCLASS", group: "Object Identifier Types" },
  { value: "regtype", label: "REGTYPE", group: "Object Identifier Types" },
  { value: "regrole", label: "REGROLE", group: "Object Identifier Types" },
  { value: "regnamespace", label: "REGNAMESPACE", group: "Object Identifier Types" },
  { value: "regconfig", label: "REGCONFIG", group: "Object Identifier Types" },
  { value: "regdictionary", label: "REGDICTIONARY", group: "Object Identifier Types" },

  // ====================== 伪类型 ======================
  { value: "any", label: "ANY", group: "Pseudo Types" },
  { value: "anyelement", label: "ANYELEMENT", group: "Pseudo Types" },
  { value: "anyarray", label: "ANYARRAY", group: "Pseudo Types" },
  { value: "anynonarray", label: "ANYNONARRAY", group: "Pseudo Types" },
  { value: "anyenum", label: "ANYENUM", group: "Pseudo Types" },
  { value: "anyrange", label: "ANYRANGE", group: "Pseudo Types" },
  { value: "record", label: "RECORD", group: "Pseudo Types" },
  { value: "trigger", label: "TRIGGER", group: "Pseudo Types" },
  { value: "void", label: "VOID", group: "Pseudo Types" },
  { value: "language_handler", label: "LANGUAGE_HANDLER", group: "Pseudo Types" },

  // ====================== 内部系统类型 ======================
  { value: "pg_lsn", label: "PG_LSN", group: "Internal Types" },
  { value: "txid_snapshot", label: "TXID_SNAPSHOT", group: "Internal Types" },
  { value: "pg_snapshot", label: "PG_SNAPSHOT", group: "Internal Types" },
  { value: "xid", label: "XID", group: "Internal Types" },
  { value: "cid", label: "CID", group: "Internal Types" },
  { value: "xid8", label: "XID8", group: "Internal Types" },
];
