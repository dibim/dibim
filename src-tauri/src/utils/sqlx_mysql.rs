use crate::types::QueryResult;
use crate::utils::common::print_sql;
use serde_json::json;
use sqlx::types::chrono;
use sqlx::Column;
use sqlx::Row;
use sqlx::TypeInfo;
use sqlx::{Execute, MySqlPool};

/// 处理 MySQL 的查询 | Handling MySQL queries
///
/// # 参数
/// - `sql`: 要执行的 sql | The SQL to be executed"
/// - `streaming`: 是否启用流式分页 | Whether to enable streaming pagination
/// - `page`: 当前页码（从1开始） | Current page number (starting from 1)
/// - `page_size`: 每页的条目数 | Number of entries per page
///
pub async fn query_mysql(
    pool: &MySqlPool,
    sql: &str,
    streaming: bool,
    page: Option<usize>,
    page_size: Option<usize>,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let query = sqlx::query(sql);
    #[cfg(debug_assertions)]
    {
        print_sql(query.sql());
    }

    let rows = query.fetch_all(pool).await?;
    let mut json_rows = Vec::new();
    let mut column_names: Vec<String> = Vec::new();
    let mut index = 0;

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
