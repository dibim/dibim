use lazy_static::lazy_static;
use serde_json::{Map as JsonMap, Value as JsonValue};
use std::sync::Mutex;
use tokio_postgres::{Client, Error, NoTls, Row};

use crate::types::{ExecResult, QueryResult};

lazy_static! {
    static ref PG_CLIENT: Mutex<Option<Client>> = Mutex::new(None);
}

/**
 * conn_string 连接字符串, 类似 "host=localhost user=postgres password=yourpassword dbname=testdb";
 */
#[tokio::main]
pub async fn connect(conn_string: String) -> Result<(), Error> {
    // 连接数据库
    let (client, connection) = tokio_postgres::connect(&conn_string, NoTls).await?;

    // 将连接对象存储到全局变量
    *PG_CLIENT.lock().unwrap() = Some(client);

    // 启动连接任务
    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("Connection error: {}", e);
        }
    });

    Ok(())
}

/**
 * 执行查询语句
 */
#[tokio::main]
pub async fn query(query_string: String) -> Result<QueryResult, Box<dyn std::error::Error>> {
    // 初始结果
    let mut query_result = QueryResult {
        column_name: "".to_string(),
        data: "".to_string(),
    };

    let mut json_rows: Vec<JsonValue> = Vec::new();
    let mut columns: Vec<String> = [].to_vec();

    if let Some(client) = PG_CLIENT.lock().unwrap().as_ref() {
        let rows = client.query(&query_string, &[]).await?;
        if rows.len() == 0 {
            return Ok(query_result);
        }

        // 获取列名
        let columns_data = rows[0].columns();
        for c in columns_data {
            columns.push(c.name().to_string());
        }

        for row in rows {
            let json_value = postgres_row_to_json(row).await?;
            json_rows.push(json_value)
        }
    }

    query_result.column_name = serde_json::to_string(&columns)?;
    query_result.data = serde_json::to_string(&json_rows)?;
    Ok(query_result)
}

/**
 * 执行非查询的语句
 * 
 * 当 SQL 语句包含 RETURNING 子句时，必须使用 query 方法而非 execute，原因如下：
 * 方法	    返回值类型	        适用场景
 * execute	u64（受影响的行数）	执行不返回数据的语句（如纯 UPDATE）
 * query	Vec<Row>（结果集）	执行返回数据的语句（如 SELECT 或含 RETURNING 的 UPDATE）
 * 
 * execute 设计用于执行不返回结果集的语句。而 RETURNING 子句会显式要求数据库返回修改后的数据（如 UPDATE ... RETURNING id），此时语句已具备查询特性。
 * 
 * 
 * 因此, 要获得 last_insert_id 需要调用 query , 使用的语句类似 "INSERT INTO table (column) VALUES ($1) RETURNING id"
 * 或者  "UPDATE your_table SET column = $1 WHERE condition = $2 RETURNING id, name"
 * 然后遍历返回的行, 使用 row.get("id") 获取才行.
 * 
 */
#[tokio::main]
pub async fn exec(query_string: String) -> Result<ExecResult, Box<dyn std::error::Error>> {
    let mut query_result = ExecResult {
        affected_rows: 0,
        last_insert_id: 0,
    };

    if let Some(client) = PG_CLIENT.lock().unwrap().as_ref() {
        let affected_rows = client.execute(&query_string, &[]).await?;

        query_result.affected_rows = affected_rows;
        // query_result.last_insert_id = ;
    }

    Ok(query_result)
}

/**
 * 把行数据转为 json
 */
async fn postgres_row_to_json(row: Row) -> Result<JsonValue, Box<dyn std::error::Error>> {
    let mut json_map = JsonMap::new();

    for column in row.columns() {
        let column_name = column.name().to_string();
        let column_type = column.type_().name().to_string();

        // 获取字段值
        let value = match column_type.as_str() {
            "int2" | "int4" | "int8" => {
                let val: i64 = row.try_get(column.name())?;
                JsonValue::Number(serde_json::Number::from(val))
            }
            "float4" | "float8" => {
                let val: f64 = row.try_get(column.name())?;
                JsonValue::Number(serde_json::Number::from_f64(val).unwrap())
            }
            "bool" => {
                let val: bool = row.try_get(column.name())?;
                JsonValue::Bool(val)
            }
            "text" | "varchar" | "uuid" => {
                let val: String = row.try_get(column.name())?;
                JsonValue::String(val)
            }
            "date" | "timestamp" | "timestamptz" => {
                let val: String = row.try_get(column.name())?;
                JsonValue::String(val)
            }
            "json" | "jsonb" => {
                let json_str: String = row.try_get(column.name())?;
                serde_json::from_str(&json_str)? // 解析 JSON 字符串
            }
            _ => JsonValue::Null, // 不支持的类型返回 null
        };

        json_map.insert(column_name, value);
    }

    Ok(JsonValue::Object(json_map))
}
