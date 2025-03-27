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

// 表结构相关
export const ACTION_C_COLNAME = "cColName"; // 修改列名
export const ACTION_C_DATATYPE = "cDataType"; // 修改数据类型
export const ACTION_C_IS_PRIMARY_KEY = "cIsPrimaryKey"; // 修改是主键
export const ACTION_C_IS_UNIQUE = "cIsUnique"; // 修改是唯一索引
export const ACTION_C_NULLABLE = "cNullable"; // 修改非空
export const ACTION_C_DEFAULT = "cDefault"; // 修改默认值
export const ACTION_C_COL_COMMENT = "cColComment"; // 修改列备注
export const ACTION_C_TBL_COMMENT = "cTblComment"; // 修改表备注
export const ACTION_D_COL = "dCol"; // 删除列
