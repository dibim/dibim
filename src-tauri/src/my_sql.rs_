use base64::Engine;
use mysql_async::{prelude::*, Conn, Opts, Pool, Row, Value};
use serde_json::{json, Value as JsonValue};
use tokio::sync::OnceCell;

use crate::types::{ExecResult, QueryResult};

// 使用 OnceCell 替代 Mutex 实现线程安全的单例
static MYSQL_POOL: OnceCell<Pool> = OnceCell::const_new();

// 获取全局连接池的异步安全方法
async fn get_conn() -> Result<Conn, Box<dyn std::error::Error>> {
    let pool = MYSQL_POOL.get().ok_or("Database not connected")?;
    Ok(pool.get_conn().await?)
}

/**
 * conn_string 连接字符串，类似 "mysql://root:yourpassword@localhost:3306/testdb"
 */
pub async fn connect(conn_string: String) -> Result<(), Box<dyn std::error::Error>> {
    // 解析连接配置
    let opts = Opts::from_url(&conn_string)?;

    // 创建异步连接池并存入全局变量
    let pool = Pool::new(opts);
    MYSQL_POOL
        .set(pool)
        .map_err(|_| "Pool already initialized")?;

    Ok(())
}

/**
 * 执行查询语句
 * 正常返回两个 json，第一个是字段名的数组，第二个是数据的数组
 */
pub async fn query(query_string: String) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let mut query_result = QueryResult {
        column_name: "".to_string(),
        data: "".to_string(),
    };

    let mut conn = get_conn().await?;

    // 执行查询并直接获取所有行
    let rows: Vec<Row> = conn.query(query_string).await?;

    if rows.is_empty() {
        return Ok(query_result);
    }

    // 获取列名（优化为直接使用第一行的列信息）
    let columns = rows[0]
        .columns_ref()
        .iter()
        .map(|col| col.name_str().to_string())
        .collect::<Vec<_>>();

    // 转换每一行数据
    let json_rows = rows
        .into_iter()
        .map(|row| {
            let mut json_row = json!({});
            for (index, col_name) in columns.iter().enumerate() {
                let value: Value = row.get(index).unwrap_or(Value::NULL);
                json_row[col_name] = convert_value(value);
            }
            json_row
        })
        .collect::<Vec<_>>();

    query_result.column_name = serde_json::to_string(&columns)?;
    query_result.data = serde_json::to_string(&json_rows)?;
    Ok(query_result)
}

/**
 * 执行非查询的语句
 */
pub async fn exec(query_string: String) -> Result<ExecResult, Box<dyn std::error::Error>> {
    let mut query_result = ExecResult {
        affected_rows: 0,
        last_insert_id: 0,
    };

    let mut conn = get_conn().await?;
    conn.exec_drop(query_string, ([],)).await?;

    query_result.affected_rows = conn.affected_rows();
    query_result.last_insert_id = conn.last_insert_id().unwrap_or(0);
    Ok(query_result)
}

/// 将 mysql_async::Value 转换为 serde_json::Value
fn convert_value(value: Value) -> JsonValue {
    match value {
        // 处理 NULL
        Value::NULL => JsonValue::Null,

        // 处理整数类型
        Value::Int(n) => json!(n),

        // 处理无符号整数类型
        Value::UInt(n) => json!(n),

        // 处理字符串/二进制类型
        Value::Bytes(bytes) => String::from_utf8(bytes)
            .map(JsonValue::String)
            .unwrap_or_else(|e| {
                JsonValue::String(base64::engine::general_purpose::STANDARD.encode(e.as_bytes()))
            }),

        // 处理浮点数
        Value::Float(f) => json!(f),
        Value::Double(d) => json!(d),

        // 处理 Date 类型（如果存在）
        Value::Time(is_negative, days, hours, minutes, seconds, microseconds) => {
            // 处理时间格式
            let total_hours = days * 24 + hours as u32;
            let mut time_str = format!("{:02}:{:02}:{:02}", total_hours, minutes, seconds);

            // 添加微秒（如果存在）
            if microseconds > 0 {
                time_str.push_str(&format!(".{:06}", microseconds));
            }

            // 添加负号（如果需要）
            if is_negative {
                time_str = format!("-{}", time_str);
            }

            // 判断是否为纯时间类型（无日期部分）
            if days > 0 || is_negative {
                // 输出为 TIME 类型字符串（可能超过 24 小时）
                JsonValue::String(time_str)
            } else {
                // 处理 DATE/DATETIME 类型
                // 需要额外处理日期部分（需从其他字段获取）
                // 注意：mysql_async::Time 不包含日期信息！
                // 若需要处理 DATE/DATETIME，应使用 Value::Date 类型
                JsonValue::String(time_str)
            }
        }

        // 处理日期时间（DATE/DATETIME 类型）
        Value::Date(year, month, day, hour, minute, second, microsecond) => {
            let datetime_str = if microsecond > 0 {
                format!(
                    "{:04}-{:02}-{:02} {:02}:{:02}:{:02}.{:06}",
                    year, month, day, hour, minute, second, microsecond
                )
            } else {
                format!(
                    "{:04}-{:02}-{:02} {:02}:{:02}:{:02}",
                    year, month, day, hour, minute, second
                )
            };
            JsonValue::String(datetime_str)
        }

        // 其他类型转为字符串表示
        _ => JsonValue::String(format!("{:?}", value)),
    }
}
