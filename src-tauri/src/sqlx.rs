use bigdecimal::BigDecimal;
use serde_json::json;
use sqlx::mysql::{MySqlPool, MySqlPoolOptions};
use sqlx::postgres::{PgPool, PgPoolOptions};
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use sqlx::types::chrono;
use sqlx::Error;
use sqlx::Row;
use sqlx::TypeInfo;
use sqlx::{Column, Execute};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use crate::types::ExecResult;
use crate::types::QueryResult;

#[derive(Debug, Clone, Copy)]
enum DatabaseType {
    Postgres,
    MySql,
    Sqlite,
}

#[derive(Clone)]
enum DbPool {
    Postgres(PgPool),
    MySql(MySqlPool),
    Sqlite(SqlitePool),
}

impl DbPool {
    async fn connect(db_type: DatabaseType, url: &str) -> Result<Self, sqlx::Error> {
        match db_type {
            DatabaseType::Postgres => {
                let pool = PgPoolOptions::new().max_connections(5).connect(url).await?;
                Ok(DbPool::Postgres(pool))
            }
            DatabaseType::MySql => {
                let pool = MySqlPoolOptions::new()
                    .max_connections(5)
                    .connect(url)
                    .await?;
                Ok(DbPool::MySql(pool))
            }
            DatabaseType::Sqlite => {
                let pool = SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect(url)
                    .await?;
                Ok(DbPool::Sqlite(pool))
            }
        }
    }
}

#[derive(Clone)]
struct DatabaseConnection {
    db_type: DatabaseType,
    pool: DbPool,
}

lazy_static::lazy_static! {
    static ref DB_MANAGER: Arc<Mutex<HashMap<String, DatabaseConnection>>> =
        Arc::new(Mutex::new(HashMap::new()));
}

pub async fn connect(conn_name: &str, url: &str) -> Result<(), sqlx::Error> {
    let db_type = if url.starts_with("postgres://") {
        DatabaseType::Postgres
    } else if url.starts_with("mysql://") {
        DatabaseType::MySql
    } else if url.starts_with("sqlite:") {
        DatabaseType::Sqlite
    } else {
        return Err(sqlx::Error::Configuration(
            "Unsupported database scheme".into(),
        ));
    };

    let pool = DbPool::connect(db_type, url).await?;
    let db_conn = DatabaseConnection { db_type, pool };

    DB_MANAGER
        .lock()
        .map_err(|e| {
            sqlx::Error::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            ))
        })?
        .insert(conn_name.to_string(), db_conn);

    Ok(())
}

fn get_db_connection(conn_name: &str) -> Result<DatabaseConnection, Error> {
    DB_MANAGER
        .lock()
        .map_err(|e| {
            Error::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            ))
        })?
        .get(conn_name)
        .cloned()
        .ok_or_else(|| {
            Error::Io(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "Connection not found",
            ))
        })
}

// 执行查询并返回 JSON 数组
pub async fn query(conn_name: &str, sql: &str) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let db_conn = get_db_connection(conn_name)?;

    match db_conn.pool {
        DbPool::Postgres(pool) => process_pg_query(&pool, sql).await,
        DbPool::MySql(pool) => process_mysql_query(&pool, sql).await,
        DbPool::Sqlite(pool) => process_sqlite_query(&pool, sql).await,
    }
}

async fn process_pg_query(
    pool: &PgPool,
    sql: &str,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let query = sqlx::query(sql);
    println!("Executing SQL: {}", query.sql());

    let rows = query.fetch_all(pool).await?;
    let mut json_rows = Vec::new();

    for row in rows {
        let mut json_row = json!({});
        for column in row.columns() {
            let col_name = column.name();
  
            // 参考: /xxx/cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-e791a3f93f26854f/sqlx-postgres-0.8.3/src/type_info.rs
            // 里的 pub(crate) fn display_name(&self) -> &str { 部分
            //
            // 特别注意: 必须使用 Option 处理, 用于针对 NULL 的值
            //
            let value = match column.type_info().name() {
                // TODO: 补充单一类型:
                // Char 类型是 "\"CHAR\"" ???
                // Bpchar 的是 CHAR
                // BIT INTERVAL JSONPATH MONEY OID RECORD TIMETZ UNKNOWN VARBIT VARCHAR VOID
                // ========== 几何类型: POINT LINE LSEG BOX PATH POLYGON CIRCLE
                // POINT
                // 表示平面上的一个点，存储为 (x, y) 坐标。
                // 示例：(1.0, 2.0)。
                // LINE
                // 表示一条无限长的直线，存储为 Ax + By + C = 0 的系数。
                // 示例：{A: 1, B: -1, C: 0}。
                // LSEG
                // 表示一条线段，存储为两个端点 (x1, y1) 和 (x2, y2)。
                // 示例：[(1.0, 2.0), (3.0, 4.0)]。
                // BOX
                // 表示一个矩形框，存储为两个对角点 (x1, y1) 和 (x2, y2)。
                // 示例：(1.0, 2.0), (3.0, 4.0)。
                // PATH
                // 表示一个路径，可以是闭合的（多边形）或开放的（折线）。
                // 示例：[(1.0, 2.0), (3.0, 4.0), (5.0, 6.0)]。
                // POLYGON
                // 表示一个多边形，存储为一系列点。
                // 示例：((1.0, 2.0), (3.0, 4.0), (5.0, 6.0))。
                // CIRCLE
                // 表示一个圆，存储为中心点和半径 (x, y, r)。
                // 示例：<(1.0, 2.0), 3.0>。
                // ========== 网络地址类型: MACADDR8
                // INET 已添加
                // 表示 IPv4 或 IPv6 地址。
                // 示例：192.168.1.1 或 ::1。
                // CIDR 已添加
                // 表示 IPv4 或 IPv6 网络地址段。
                // 示例：192.168.1.0/24。
                // MACADDR 已添加
                // 表示 MAC 地址（硬件地址）。
                // 示例：08:00:2b:01:02:03。
                // MACADDR8
                // 表示扩展的 MAC 地址（EUI-64 格式）。
                // 示例：08:00:2b:01:02:03:04:05。
                // ========== 范围类型: DATERANGE INT4RANGE INT8RANGE NUMRANGE TSRANGE TSTZRANGE
                // INT4RANGE
                // 表示一个整数范围（int4）。
                // 示例：[1, 10)。
                // INT8RANGE
                // 表示一个大整数范围（int8）。
                // 示例：[100, 1000]。
                // NUMRANGE
                // 表示一个数值范围（numeric）。
                // 示例：[1.5, 10.5)。
                // TSRANGE
                // 表示一个时间戳范围（不带时区）。
                // 示例：['2023-01-01 00:00:00', '2023-12-31 23:59:59']。
                // TSTZRANGE
                // 表示一个带时区的时间戳范围。
                // 示例：['2023-01-01 00:00:00 UTC', '2023-12-31 23:59:59 UTC']。
                // DATERANGE
                // 表示一个日期范围。
                // 示例：['2023-01-01', '2023-12-31']。
                // TODO: 补充数组类型
                // BIT[] BOOL[] BOX[] BYTEA[] CIDR[] CIRCLE[] DATE[] DATERANGE[] FLOAT4[] FLOAT8[] INET[] INT2[] INT4[] INT4RANGE[] INT8[]
                // INT8RANGE[] INTERVAL[] JSON[] JSONB[] JSONPATH[] LINE[] LSEG[] MACADDR[] MACADDR8[] MONEY[] NAME[] NUMERIC[] NUMRANGE[]
                // OID[] PATH[] POINT[] POLYGON[] RECORD[] TIME[] TIMESTAMP[] TIMESTAMPTZ[] TIMETZ[] TSRANGE[] TSTZRANGE[] UUID[] VARBIT[] VARCHAR[]
                // CharArray 数组是 "\"CHAR\"[]" ???
                // BpcharArray 的是 CHAR[]

                // 布尔类型
                "BOOL" => json!(row.get::<Option<bool>, _>(col_name)),

                // 整数类型
                "INT2" => json!(row.get::<Option<i16>, _>(col_name)),
                "INT4" => json!(row.get::<Option<i32>, _>(col_name)),
                "INT8" => json!(row.get::<Option<i64>, _>(col_name)),

                // 浮点数类型
                "FLOAT4" => json!(row.get::<Option<f32>, _>(col_name)),
                "FLOAT8" => json!(row.get::<Option<f64>, _>(col_name)),

                // 高精度数值
                "NUMERIC" => {
                    let val: Option<BigDecimal> = row.get(col_name);
                    match val {
                        Some(s) => json!(s.to_string()), // 转换为字符串避免精度丢失
                        None => json!(null),
                    }
                }

                // 字符串类型
                "TEXT" | "VARCHAR" | "BPCHAR" | "NAME" => {
                    json!(row.get::<Option<String>, _>(col_name))
                }

                // JSON 类型
                "JSON" | "JSONB" => {
                    let val: Option<serde_json::Value> = row.get(col_name);
                    json!(val)
                }

                // 二进制数据
                "BYTEA" => {
                    let val: Option<Vec<u8>> = row.get(col_name);
                    match val {
                        Some(s) => json!(base64::encode(&s)),
                        None => json!(null),
                    }
                }

                // 时间日期类型
                "DATE" => {
                    let val: Option<chrono::NaiveDate> = row.get(col_name);
                    match val {
                        Some(s) => json!(s.format("%Y-%m-%d").to_string()),
                        None => json!(null),
                    }
                }
                "TIME" => {
                    let val: Option<chrono::NaiveTime> = row.get(col_name);
                    match val {
                        Some(s) => json!(s.format("%H:%M:%S").to_string()),
                        None => json!(null),
                    }
                }
                "TIMESTAMP" => {
                    let val: Option<chrono::NaiveDateTime> = row.get(col_name);
                    match val {
                        Some(s) => json!(s.format("%Y-%m-%d %H:%M:%S").to_string()),
                        None => json!(null),
                    }
                }
                "TIMESTAMPTZ" => {
                    let val: Option<chrono::DateTime<chrono::Utc>> = row.get(col_name);
                    match val {
                        Some(s) => json!(s.to_rfc3339()),
                        None => json!(null),
                    }
                }

                // UUID 类型
                "UUID" => {
                    let val: Option<uuid::Uuid> = row.get(col_name);
                    match val {
                        Some(s) => json!(s.to_string()),
                        None => json!(null),
                    }
                }

                // 网络类型
                "INET" | "CIDR" | "MACADDR" => json!(row.get::<Option<String>, _>(col_name)),

                // 数组类型
                "INT4[]" => json!(row.get::<Option<Vec<Option<i32>>>, _>(col_name)),
                "TEXT[]" => json!(row.get::<Option<Vec<Option<String>>>, _>(col_name)),

                // 默认处理为字符串或标记不支持
                _ => {
                    // log::warn!("Unsupported PostgreSQL type: {}", type_name);
                    // 其它类型按照字符串处理
                    let val = row.try_get::<Option<String>, _>(col_name);
                    match val {
                        Ok(o) => match o {
                            Some(s) => json!(s),
                            None => json!(null),
                        },
                        Err(e) => json!(e.to_string()),
                    }
                }
            };
            json_row[col_name] = value;
        }
        json_rows.push(json_row);
    }

    Ok(QueryResult {
        column_name: "".to_string(),
        data: serde_json::to_string(&json_rows)?,
    })
}

async fn process_mysql_query(
    pool: &MySqlPool,
    sql: &str,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let query = sqlx::query(sql);
    println!("Executing SQL: {}", query.sql());

    let rows = query.fetch_all(pool).await?;
    let mut json_rows = Vec::new();

    for row in rows {
        let mut json_row = json!({});
        for column in row.columns() {
            let col_name = column.name();
            let value = match column.type_info().name() {
                "TINYINT" => {
                    let val: i8 = row.get(col_name);
                    if column.type_info().name().starts_with("TINYINT(1)") {
                        json!(val != 0)
                    } else {
                        json!(val)
                    }
                }
                "INT" => json!(row.get::<i32, _>(col_name)),
                "BIGINT" => json!(row.get::<i64, _>(col_name)),
                "FLOAT" => json!(row.get::<f32, _>(col_name)),
                "DOUBLE" => json!(row.get::<f64, _>(col_name)),
                "VARCHAR" | "TEXT" => json!(row.get::<String, _>(col_name)),
                "DATETIME" | "TIMESTAMP" => {
                    let dt: chrono::NaiveDateTime = row.get(col_name);
                    json!(dt.to_string())
                }
                _ => json!("unsupported_type"),
            };
            json_row[col_name] = value;
        }
        json_rows.push(json_row);
    }

    Ok(QueryResult {
        column_name: "".to_string(),
        data: serde_json::to_string(&json_rows)?,
    })
}

async fn process_sqlite_query(
    pool: &SqlitePool,
    sql: &str,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let query = sqlx::query(sql);
    println!("Executing SQL: {}", query.sql());

    let rows = query.fetch_all(pool).await?;
    let mut json_rows = Vec::new();

    for row in rows {
        let mut json_row = json!({});
        for column in row.columns() {
            let col_name = column.name();
            let value = match column.type_info().name() {
                "BOOLEAN" => json!(row.get::<bool, _>(col_name)),
                "INTEGER" => json!(row.get::<i64, _>(col_name)),
                "REAL" => json!(row.get::<f64, _>(col_name)),
                "TEXT" => json!(row.get::<String, _>(col_name)),
                "BLOB" => json!(base64::encode(row.get::<Vec<u8>, _>(col_name))),
                "DATETIME" => {
                    let s: String = row.get(col_name);
                    json!(s)
                }
                _ => json!("unsupported_type"),
            };
            json_row[col_name] = value;
        }
        json_rows.push(json_row);
    }

    Ok(QueryResult {
        column_name: "".to_string(),
        data: serde_json::to_string(&json_rows)?,
    })
}

// 执行更新/删除操作
pub async fn exec(conn_name: &str, sql: &str) -> Result<ExecResult, Error> {
    let db_conn = get_db_connection(conn_name)?;

    match db_conn.pool {
        DbPool::Postgres(pool) => {
            let result = sqlx::query(sql).execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: 0, // PostgreSQL 需要 RETURNING 子句
            })
        }
        DbPool::MySql(pool) => {
            let result = sqlx::query(sql).execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: result.last_insert_id(),
            })
        }
        DbPool::Sqlite(pool) => {
            let result = sqlx::query(sql).execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: result.last_insert_rowid() as u64,
            })
        }
    }
}
