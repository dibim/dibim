use crate::types::QueryResult;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use serde_json::json;
use sqlx::Column;
use sqlx::Execute;
use sqlx::Row;
use sqlx::SqlitePool;
use sqlx::TypeInfo;

/// 处理 SQLite 的查询 | Handling SQLite queries
///
/// # 参数
/// - `sql`: 要执行的 sql | The SQL to be executed"
/// - `streaming`: 是否启用流式分页 | Whether to enable streaming pagination
/// - `page`: 当前页码（从1开始） | Current page number (starting from 1)
/// - `page_size`: 每页的条目数 | Number of entries per page
///
pub async fn process_sqlite_query(
    pool: &SqlitePool,
    sql: &str,
    streaming: bool,
    page: Option<usize>,
    page_size: Option<usize>,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let query = sqlx::query(sql);
    println!("Executing SQL: {}", query.sql());

    let rows = query.fetch_all(pool).await?;
    let mut json_rows = Vec::new();
    let mut column_names: Vec<String> = Vec::new();
    let mut index = 0;

    for row in rows {
        let mut json_row = json!({});
        for column in row.columns() {
            let col_name = column.name();
            let value = match column.type_info().name() {
                "BOOLEAN" => json!(row.get::<bool, _>(col_name)),
                "INTEGER" => json!(row.get::<i64, _>(col_name)),
                "REAL" => json!(row.get::<f64, _>(col_name)),
                "TEXT" => json!(row.get::<String, _>(col_name)),
                "BLOB" => json!(STANDARD.encode(row.get::<Vec<u8>, _>(col_name))),
                "DATETIME" => {
                    let s: String = row.get(col_name);
                    json!(s)
                }
                _ => json!("unsupported_type"),
            };
            json_row[col_name] = value;

            if index == 0 {
                column_names.push(col_name.to_owned())
            }
        }
        json_rows.push(json_row);
        index += 1;
    }

    Ok(QueryResult {
        column_name: serde_json::to_string(&column_names)?,
        data: serde_json::to_string(&json_rows)?,
    })
}
