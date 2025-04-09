use crate::types::QueryResult;
use crate::utils::common::print_sql;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use serde_json::json;
use sqlx::{Column, Execute, Row, SqlitePool};

/// 处理 SQLite 的查询 | Handling SQLite queries
///
/// # 参数
/// - `sql`: 要执行的 sql | The SQL to be executed"
/// - `streaming`: 是否启用流式分页 | Whether to enable streaming pagination
/// - `page`: 当前页码（从1开始） | Current page number (starting from 1)
/// - `page_size`: 每页的条目数 | Number of entries per page
///
pub async fn query_sqlite(
    pool: &SqlitePool,
    sql: &str,
    streaming: bool,
    page: Option<usize>,
    page_size: Option<usize>,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    // TODO: 实现流式查询

    let query = sqlx::query(sql);
    #[cfg(debug_assertions)]
    {
        print_sql(query.sql(), 7);
    }

    let rows = query.fetch_all(pool).await?;
    let mut json_rows = Vec::new();
    let mut column_names: Vec<String> = Vec::new();

    if let Some(first_row) = rows.first() {
        for column in first_row.columns() {
            column_names.push(column.name().to_owned());
        }
    }

    for row in rows {
        let mut json_row = serde_json::Map::new();
        for (idx, col_name) in column_names.iter().enumerate() {
            // 类型的判断不能依赖 type_info, 因为 type_info().name() 返回的全部都是 NULL
            // 这里遵循 SQLite 的 类型优先级规则动态解析
            // Refer: https://www.sqlite.org/datatype3.html#type_conversions
            let value = if let Ok(val) = row.try_get::<i64, _>(idx) {
                json!(val)
            } else if let Ok(val) = row.try_get::<f64, _>(idx) {
                json!(val)
            } else if let Ok(val) = row.try_get::<String, _>(idx) {
                json!(val)
            } else if let Ok(val) = row.try_get::<Vec<u8>, _>(idx) {
                json!(STANDARD.encode(&val))
            } else if row.try_get::<Option<i64>, _>(idx)?.is_none() {
                json!(null)
            } else {
                json!("unknown_type")
            };

            json_row.insert(col_name.clone(), value);
        }
        json_rows.push(json!(json_row));
    }

    Ok(QueryResult {
        column_name: serde_json::to_string(&column_names)?,
        data: serde_json::to_string(&json_rows)?,
    })
}
