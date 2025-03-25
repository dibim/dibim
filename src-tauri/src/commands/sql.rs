// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use crate::types::DbResult;
use crate::utils::sqlx;

/**
 * 使用 sqlx 连接数据库
 */
#[tauri::command]
pub async fn sqlx_connect(conn_name: String, url: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match sqlx::connect(&conn_name, &url).await {
        Ok(()) => res.data = "ok".to_string(),
        Err(e) => {
            eprintln!("Error occurred in sqlx_connect: {:?}", e);
            res.error_message = e.to_string()
        }
    }

    res
}

/**
 * 使用 sqlx 查询数据
 */
#[tauri::command]
pub async fn sqlx_query(conn_name: String, sql: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match sqlx::query(&conn_name, &sql).await {
        Ok(o) => {
            res.column_name = o.column_name;
            res.data = o.data;
        }
        Err(e) => {
            eprintln!("Error occurred in sqlx_query: {:?}", e);
            res.error_message = e.to_string()
        }
    }

    res
}

/**
 * 使用 sqlx 执行非查询语句
 */
#[tauri::command]
pub async fn sqlx_exec(conn_name: String, sql: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match sqlx::exec(&conn_name, &sql).await {
        Ok(o) => {
            res.data = match serde_json::to_string(&o) {
                Ok(oo) => oo,
                Err(_) => "".to_string(),
            };
        }
        Err(e) => {
            eprintln!("Error occurred in sqlx_exec: {:?}", e);
            res.error_message = e.to_string()
        }
    }

    res
}
