use once_cell::sync::OnceCell;
use serde_json::{Map as JsonMap, Value as JsonValue};
use tokio::sync::Mutex as AsyncMutex;
use tokio_postgres::{Client, Error, Row};

use crate::types::{ExecResult, QueryResult};

// 使用 OnceCell + AsyncMutex 保证线程安全
static PG_CLIENT: OnceCell<AsyncMutex<Option<Client>>> = OnceCell::new();

/**
 * 连接数据库（保持原函数签名）
 */
pub async fn connect(conn_string: String) -> Result<(), Error> {
    let (client, connection) = tokio_postgres::connect(&conn_string, tokio_postgres::NoTls).await?;

    // 初始化全局客户端
    PG_CLIENT.get_or_init(|| AsyncMutex::new(Some(client)));

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("Connection error: {}", e);
        }
    });

    Ok(())
}

/**
 * 执行查询（保持原函数签名）
 */
pub async fn query(query_string: String) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let mut query_result = QueryResult {
        column_name: "".to_string(),
        data: "".to_string(),
    };

    // 安全获取异步锁
    let guard = PG_CLIENT.get().ok_or("Not connected")?.lock().await;
    if let Some(client) = guard.as_ref() {
        let rows = client.query(&query_string, &[]).await?;

        if !rows.is_empty() {
            // 处理列名
            let columns = rows[0]
                .columns()
                .iter()
                .map(|c| c.name().to_string())
                .collect::<Vec<_>>();

            // 处理行数据
            let json_rows = rows
                .into_iter()
                .map(postgres_row_to_json)
                .collect::<Result<Vec<_>, _>>()?;

            query_result.column_name = serde_json::to_string(&columns)?;
            query_result.data = serde_json::to_string(&json_rows)?;
        }
    }

    Ok(query_result)
}

/**
 * 执行非查询（保持原函数签名）
 */
pub async fn exec(query_string: String) -> Result<ExecResult, Box<dyn std::error::Error>> {
    let mut query_result = ExecResult {
        affected_rows: 0,
        last_insert_id: 0,
    };

    let guard = PG_CLIENT.get().ok_or("Not connected")?.lock().await;
    if let Some(client) = guard.as_ref() {
        let affected = client.execute(&query_string, &[]).await?;
        query_result.affected_rows = affected;
    }

    Ok(query_result)
}

/**
 * 同步行转换函数（修复 async 问题）
 */
fn postgres_row_to_json(row: Row) -> Result<JsonValue, Box<dyn std::error::Error>> {
    let mut map = JsonMap::new();

    for (idx, column) in row.columns().iter().enumerate() {
        let col_name = column.name().to_string();

        // FIXME: column.type_().name() 返回的总是 "name" 这个字符串
        // let value =  JsonValue::String(column.type_().name().to_string());
        // let value = match column.type_().name() {
        //     "int2" | "int4" | "int8" => {
        //         let val: i64 = row.try_get(column.name())?;
        //         JsonValue::Number(serde_json::Number::from(val))
        //     }
        //     "float4" | "float8" => {
        //         let val: f64 = row.try_get(column.name())?;
        //         JsonValue::Number(serde_json::Number::from_f64(val).unwrap())
        //     }
        //     "bool" => {
        //         let val: bool = row.try_get(column.name())?;
        //         JsonValue::Bool(val)
        //     }
        //     "text" | "varchar" | "uuid" => {
        //         let val: String = row.try_get(column.name())?;
        //         JsonValue::String(val)
        //     }
        //     "date" | "timestamp" | "timestamptz" => {
        //         let val: String = row.try_get(column.name())?;
        //         JsonValue::String(val)
        //     }
        //     "json" => {
        //         let val: String = row.try_get(column.name())?;
        //         JsonValue::String(val)
        //     }
        //     // "jsonb" => {
        //     // TODO:
        //     // let val: String = row.try_get(column.name())?;
        //     // JsonValue::Bool(val)
        //     // }
        //     "bytea" => {
        //         let bytes: Vec<u8> = row.get(idx);
        //         JsonValue::String(base64::encode(bytes))
        //     }
        //     _ => JsonValue::Null, // 其他类型返回 null
        // };

        // TODO: 这里临时全部按照字符串处理
        let val: String = row.try_get(column.name())?;
        let value = JsonValue::String(val);

        map.insert(col_name, value);
    }

    Ok(JsonValue::Object(map))
}
