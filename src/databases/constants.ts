// 数据库类型 | Database type
export const DB_MYSQL = "MySQL";
export const DB_POSTGRESQL = "PostgreSQL";
export const DB_SQLITE = "SQLite";

// 数据库字段类型 | Database field type
export const FIELD_ARRAY = "ARRAY";
export const FIELD_BINARY = "BINARY";
export const FIELD_BOOLEAN = "BOOLEAN";
export const FIELD_CHARACTER = "CHARACTER";
export const FIELD_DATETIME = "DATETIME";
export const FIELD_GEOMETRIC = "GEOMETRIC";
export const FIELD_JSON = "JSON";
export const FIELD_NETWORK = "NETWORK";
export const FIELD_NUMERIC = "NUMERIC";
export const FIELD_RANGE = "RANGE";
export const FIELD_OTHER = "OTHER";

/**
 * rust 的 sqlx 在连接字符串中添加 sslmode 参数控制 TLS 行为
 * sslmode 值	行为描述
 * disable	    完全禁用 TLS（不安全）
 * allow	    优先非加密连接，若服务器要求则使用 TLS
 * prefer	    优先使用 TLS，若失败则回退到非加密连接（默认值）
 * require	    必须使用 TLS，但不会验证证书有效性
 * verify-ca	使用 TLS 并验证证书颁发机构（CA）
 * verify-full	使用 TLS，验证 CA 和服务器主机名（生产环境推荐）
 */
export const SSL_MODE_DISABLE = "disable";
export const SSL_MODE_ALLOW = "allow";
export const SSL_MODE_PREFER = "prefer";
export const SSL_MODE_REQUIRE = "require";
export const SSL_MODE_VERIFY_CA = "verify-ca";
export const SSL_MODE_VERIFY_FULL = "verify-full";
