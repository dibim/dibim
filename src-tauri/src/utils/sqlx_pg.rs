use crate::types::QueryResult;
use crate::utils::common::print_sql;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use bigdecimal::BigDecimal;
use futures_util::StreamExt;
use lazy_static::lazy_static;
use serde_json::json;
use sqlx::postgres::{PgPool, PgRow};
use sqlx::types::chrono;
use sqlx::Error as SqlxError;
use sqlx::Row;
use sqlx::TypeInfo;
use sqlx::{Column, Execute};
use std::collections::HashMap;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::Mutex as TokioMutex;

lazy_static! {
    static ref CURSOR_CACHE: TokioMutex<HashMap<Arc<str>, CursorState>> =
        TokioMutex::new(HashMap::new());
}

struct CursorState {
    offset: usize,
    stream: TokioMutex<
        Option<Pin<Box<dyn futures_util::Stream<Item = Result<PgRow, SqlxError>> + Send>>>,
    >,
}

/// 处理 PostgreSQL 的查询 | Handling PostgreSQL queries
///
/// # 参数
/// - `sql`: 要执行的 sql | The SQL to be executed"
/// - `streaming`: 是否启用流式分页 | Whether to enable streaming pagination
/// - `page`: 当前页码（从1开始） | Current page number (starting from 1)
/// - `page_size`: 每页的条目数 | Number of entries per page
///
pub async fn query_pg(
    pool: &PgPool,
    sql: &str,
    streaming: bool,
    page: Option<usize>,
    page_size: Option<usize>,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    if streaming {
        // 流式查询
        // Streaming pagination
        stream_pagination(pool, sql, page.unwrap_or(1), page_size.unwrap_or(200)).await
    } else {
        // 一次性返回所有数据
        // Return all data at once
        fetch_all_data(pool, sql).await
    }
}

// 流式查询
// Streaming pagination
async fn stream_pagination(
    pool: &PgPool,
    sql: &str,
    page: usize,
    page_size: usize,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let sql_key = Arc::from(sql);
    let pool = Arc::new(pool.clone());

    // 异步获取缓存锁
    // Asynchronous retrieval of cache lock
    let mut cache = CURSOR_CACHE.lock().await;

    // 清空缓存，如果当前 sql 参数与缓存中的不同
    // Clear cache, if the current SQL parameters are different from those in the cache
    if !cache.is_empty() && (!cache.contains_key(&sql_key)) {
        cache.clear();
    }

    // 获取或创建游标状态
    // Retrieve or create cursor state
    let state = cache
        .entry(Arc::clone(&sql_key))
        .or_insert_with(|| CursorState {
            offset: 0,
            stream: TokioMutex::new(None),
        });

    let target_offset = (page - 1) * page_size;

    // 获取流锁
    // Get stream lock
    let mut stream_guard = state.stream.lock().await;

    // 判断是否需要重置流
    // Determine whether to reset the stream
    let needs_reset = target_offset < state.offset || stream_guard.is_none();

    if needs_reset {
        // 创建新流（包含所有权的安全传递）
        // Create a new stream (including secure transfer of ownership)
        let sql_clone = Arc::clone(&sql_key);
        let pool_clone = Arc::clone(&pool);

        *stream_guard = Some(Box::pin(async_stream::stream! {
            let query = sqlx::query(&*sql_clone);
            #[cfg(debug_assertions)]
            {
                print_sql(query.sql());
            }

            let mut stream = query
                .persistent(true)
                .fetch(&*pool_clone);

            while let Some(row) = stream.next().await {
                yield row;
            }
        }));

        state.offset = 0;
    }

    // 调整偏移量
    // Adjust offset
    let stream = stream_guard.as_mut().unwrap();
    let skip = target_offset.saturating_sub(state.offset);
    for _ in 0..skip {
        if let Some(row) = stream.next().await {
            row.map_err(|e| format!("Stream error: {}", e))?;
            state.offset += 1;
        } else {
            break;
        }
    }

    // 收集当前页数据
    // Collect current page data
    let mut page_rows = Vec::with_capacity(page_size);
    for _ in 0..page_size {
        match stream.next().await {
            Some(Ok(row)) => {
                page_rows.push(row);
                state.offset += 1;
            }
            Some(Err(e)) => return Err(Box::new(e)),
            None => break,
        }
    }

    let (column_names, json_rows) = process_rows(page_rows)?;

    Ok(QueryResult {
        column_name: serde_json::to_string(&column_names)?,
        data: serde_json::to_string(&json_rows)?,
    })
}

// 一次性返回所有数据
// Return all data at once
async fn fetch_all_data(
    pool: &PgPool,
    sql: &str,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let query = sqlx::query(sql);
    #[cfg(debug_assertions)]
    {
        print_sql(query.sql());
    }

    let rows = query.fetch_all(pool).await?;
    let (column_names, json_rows) = process_rows(rows)?;

    Ok(QueryResult {
        column_name: serde_json::to_string(&column_names)?,
        data: serde_json::to_string(&json_rows)?,
    })
}

fn process_rows(
    rows: Vec<PgRow>,
) -> Result<(Vec<String>, Vec<serde_json::Value>), Box<dyn std::error::Error>> {
    let mut json_rows = Vec::with_capacity(rows.len());
    let mut column_names = Vec::new();
    let mut is_first_row = true;

    for row in rows {
        let mut json_row = json!({});
        for (idx, column) in row.columns().iter().enumerate() {
            let col_name = column.name();
            json_row[col_name] = convert_value_pg(&row, idx)?;

            if is_first_row {
                column_names.push(col_name.to_owned());
            }
        }
        json_rows.push(json_row);
        is_first_row = false;
    }

    Ok((column_names, json_rows))
}

// 把数据库类型转为 json 类型
// Convert database type to JSON type
fn convert_value_pg(row: &PgRow, idx: usize) -> Result<serde_json::Value, sqlx::Error> {
    let column = row.columns().get(idx).unwrap();
    let col_name = column.name();
    let type_name = column.type_info().name();

    // 参考: /xxx/cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-e791a3f93f26854f/sqlx-postgres-0.8.3/src/type_info.rs
    // 里的 pub(crate) fn display_name(&self) -> &str { 部分
    //
    // 特别注意: 必须使用 Option 处理, 用于针对 NULL 的值
    //
    match type_name {
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
        "BOOL" => Ok(json!(row.get::<Option<bool>, _>(col_name))),

        // 整数类型
        "INT2" => Ok(json!(row.get::<Option<i16>, _>(col_name))),
        "INT4" => Ok(json!(row.get::<Option<i32>, _>(col_name))),
        "INT8" => Ok(json!(row.get::<Option<i64>, _>(col_name))),

        // 浮点数类型
        "FLOAT4" => Ok(json!(row.get::<Option<f32>, _>(col_name))),
        "FLOAT8" => Ok(json!(row.get::<Option<f64>, _>(col_name))),

        // 高精度数值
        "NUMERIC" => {
            let val: Option<BigDecimal> = row.get(col_name);
            match val {
                Some(s) => Ok(json!(s.to_string())), // 转换为字符串避免精度丢失
                None => Ok(json!(null)),
            }
        }

        // 字符串类型
        "TEXT" | "VARCHAR" | "BPCHAR" | "NAME" => Ok(json!(row.get::<Option<String>, _>(col_name))),

        // JSON 类型
        "JSON" | "JSONB" => {
            let val: Option<serde_json::Value> = row.get(col_name);
            Ok(json!(val))
        }

        // 二进制数据
        "BYTEA" => {
            let val: Option<Vec<u8>> = row.get(col_name);
            match val {
                Some(s) => Ok(json!(STANDARD.encode(&s))),
                None => Ok(json!(null)),
            }
        }

        // 时间日期类型
        "DATE" => {
            let val: Option<chrono::NaiveDate> = row.get(col_name);
            match val {
                Some(s) => Ok(json!(s.format("%Y-%m-%d").to_string())),
                None => Ok(json!(null)),
            }
        }
        "TIME" => {
            let val: Option<chrono::NaiveTime> = row.get(col_name);
            match val {
                Some(s) => Ok(json!(s.format("%H:%M:%S").to_string())),
                None => Ok(json!(null)),
            }
        }
        "TIMESTAMP" => {
            let val: Option<chrono::NaiveDateTime> = row.get(col_name);
            match val {
                Some(s) => Ok(json!(s.format("%Y-%m-%d %H:%M:%S").to_string())),
                None => Ok(json!(null)),
            }
        }
        "TIMESTAMPTZ" => {
            let val: Option<chrono::DateTime<chrono::Utc>> = row.get(col_name);
            match val {
                Some(s) => Ok(json!(s.to_rfc3339())),
                None => Ok(json!(null)),
            }
        }

        // UUID 类型
        "UUID" => {
            let val: Option<uuid::Uuid> = row.get(col_name);
            match val {
                Some(s) => Ok(json!(s.to_string())),
                None => Ok(json!(null)),
            }
        }

        // 网络类型
        "INET" | "CIDR" | "MACADDR" => Ok(json!(row.get::<Option<String>, _>(col_name))),

        // 数组类型
        "INT2[]" => Ok(json!(row.get::<Option<Vec<i16>>, _>(col_name))),
        "INT4[]" => Ok(json!(row.get::<Option<Vec<i32>>, _>(col_name))),
        "INT8[]" => Ok(json!(row.get::<Option<Vec<i64>>, _>(col_name))),

        // 浮点数类型
        "FLOAT4[]" => Ok(json!(row.get::<Option<Vec<f32>>, _>(col_name))),
        "FLOAT8[]" => Ok(json!(row.get::<Option<Vec<f64>>, _>(col_name))),

        // 文本类型
        "TEXT[]" | "VARCHAR[]" | "BPCHAR[]" | "NAME[]" => {
            Ok(json!(row.get::<Option<Vec<Option<String>>>, _>(col_name)))
        }

        // 默认处理为字符串或标记不支持
        _ => {
            // log::warn!("Unsupported PostgreSQL type: {}", type_name);
            // 其它类型按照字符串处理
            let val = row.try_get::<Option<String>, _>(col_name);
            match val {
                Ok(o) => match o {
                    Some(s) => Ok(json!(s)),
                    None => Ok(json!(null)),
                },
                Err(e) => Ok(json!(e.to_string())),
            }
        }
    }
}
