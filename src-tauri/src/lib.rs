// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use types::DbResult;
mod sqlx;
mod types;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/**
 * 使用 sqlx 连接数据库
 *
 * 示例:
 * connect("pg", "postgres://user:pass@localhost/postgres").await?;
 * connect("mysql", "mysql://user:pass@localhost/mysql").await?;
 * connect("sqlite", "sqlite:test.db").await?;
 */
#[tauri::command]
async fn sqlx_connect(conn_name: String, url: String) -> DbResult {
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
async fn sqlx_query(conn_name: String, sql: String) -> DbResult {
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
async fn sqlx_exec(conn_name: String, sql: String) -> DbResult {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            sqlx_connect,
            sqlx_exec,
            sqlx_query
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
