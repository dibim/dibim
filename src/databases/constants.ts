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

/**
 * 表结构操作相关
 *
 * 这里是名词, 具体的动作使用 STR_ADD STR_EDIT STR_DELETE
 */
export const INDEX_PRIMARY_KEY = "PRIMARY KEY"; // 主键
export const INDEX_UNIQUE = "UNIQUE"; // 唯一索引
export const TABLE_COMMENT = "TBL_COMMENT"; // 表备注
export const FIELD = "FIELD"; // 字段
export const FIELD_NAME = "FIELD_NAME"; // 字段名
export const FIELD_TYPE = "FIELD_TYPE"; // 字段类型
export const FIELD_SIZE = "FIELD_SIZE"; // 字段大小
export const FIELD_DEFAULT = "FIELD_DEFAULT"; // 字段默认值
export const FIELD_NOT_NULL = "FIELD_NOT_NULL"; // 字段非空
export const FIELD_INDEX_TYPE = "FIELD_INDEX_TYPE"; // 字段索引类型
export const FIELD_INDEX_AUTO_INCREMENT = "FIELD_INDEX_AUTO_INCREMENT"; // 字段主键自增
export const FIELD_INDEX_NAME = "FIELD_INDEX_NAME"; // 字段索引名
export const FIELD_COMMENT = "FIELD_COMMENT"; // 字段备注
