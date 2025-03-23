use base64::Engine as _;
use lazy_static::lazy_static;
use rusqlite::{types::ValueRef, Connection, Result};
use serde_json::{json, Value as JsonValue};
use std::sync::Mutex;

use crate::types::{ExecResult, QueryResult};

lazy_static! {
    static ref SQLITE_CONN: Mutex<Option<Connection>> = Mutex::new(None);
}

/**
 * conn_string 连接字符串, 类似 "/xxx/xxx/test.db"
 */
pub fn connect(conn_string: String) -> Result<()> {
    // 连接 SQLite 数据库并存储到全局变量
    *SQLITE_CONN.lock().unwrap() = Some(Connection::open(conn_string)?);

    Ok(())
}

/**
 * 执行查询语句
 */
pub async fn query(query_string: String) -> Result<QueryResult, Box<dyn std::error::Error>> {
    // 初始结果
    let mut query_result = QueryResult {
        column_name: "".to_string(),
        data: "".to_string(),
    };

    // 使用全局连接对象执行查询
    if let Some(conn) = SQLITE_CONN.lock().unwrap().as_ref() {
        let mut stmt = conn.prepare(&query_string)?;
        // let rows = stmt.query_map([])?;

        let columns = stmt
            .column_names()
            .iter()
            .map(|s| s.to_string())
            .collect::<Vec<_>>();

        let mut json_rows: Vec<JsonValue> = Vec::new();

        stmt.query_map([], |row| {
            let mut json_row = json!({});
            for (i, col_name) in columns.iter().enumerate() {
                let value_ref = row.get_ref(i)?;
                json_row[col_name] = convert_sqlite_value(value_ref);
            }
            json_rows.push(json_row);
            Ok(())
        })?;

        query_result.column_name = serde_json::to_string(&columns)?;
        query_result.data = serde_json::to_string(&json_rows)?;
    }

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

    if let Some(conn) = SQLITE_CONN.lock().unwrap().as_ref() {
        let mut stmt = conn.prepare(&query_string)?;
        let affected_rows = stmt.execute([])?;

        query_result.affected_rows = affected_rows as u64;
        query_result.last_insert_id = conn.last_insert_rowid() as u64;
    }

    Ok(query_result)
}

/**
 * 把行数据转为 json
 */
fn convert_sqlite_value(value: ValueRef<'_>) -> JsonValue {
    match value {
        ValueRef::Null => JsonValue::Null,
        ValueRef::Integer(n) => json!(n),
        ValueRef::Real(f) => json!(f),
        ValueRef::Text(bytes) => {
            // bytes 是 &[u8]
            // 将字节切片转换为 UTF-8 字符串（处理无效字符）
            match std::str::from_utf8(bytes) {
                Ok(s) => JsonValue::String(s.to_string()),
                Err(_) => {
                    // 非 UTF-8 数据转为 Base64
                    JsonValue::String(base64::engine::general_purpose::STANDARD.encode(bytes))
                }
            }
        }
        ValueRef::Blob(b) => JsonValue::String(base64::engine::general_purpose::STANDARD.encode(b)),
    }
}
