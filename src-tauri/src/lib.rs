// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use types::DbResult;

mod my_sql;
mod postgres_sql;
mod sqlite;
mod types;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/**
 * 连接到 my_sql
 * url 连接字符串, 类似 "mysql://root:yourpassword@localhost:3306/testdb"
 */
#[tauri::command]
async fn my_sql_connect(url: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match my_sql::connect(url).await {
        Ok(()) => res.data = "ok".to_string(),
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 使用 my_sql 查询数据
 */
#[tauri::command]
async fn my_sql_query(sql: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match my_sql::query(sql).await {
        Ok(o) => {
            res.column_name = o.column_name;
            res.data = o.data;
        }
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 使用 my_sql 执行非查询语句
 */
#[tauri::command]
async fn my_sql_exec(sql: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match my_sql::exec(sql).await {
        Ok(o) => {
            res.data = match serde_json::to_string(&o) {
                Ok(oo) => oo,
                Err(_) => "".to_string(),
            };
        }
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 连接到 postgre_sql
 * url 连接字符串, 类似 "host=localhost user=postgres password=yourpassword dbname=testdb"
 */
#[tauri::command]
async fn postgres_sql_connect(url: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match postgres_sql::connect(url).await {
        Ok(()) => res.data = "ok".to_string(),
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 使用 postgre_sql 查询数据
 */
#[tauri::command]
async fn postgres_sql_query(sql: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match postgres_sql::query(sql).await {
        Ok(o) => {
            res.column_name = o.column_name;
            res.data = o.data;
        }
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 使用 postgre_sql 执行非查询语句
 */
#[tauri::command]
async fn postgres_sql_exec(sql: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match postgres_sql::exec(sql).await {
        Ok(o) => {
            res.data = match serde_json::to_string(&o) {
                Ok(oo) => oo,
                Err(_) => "".to_string(),
            };
        }
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 连接到 sqlite
 * url 连接字符串, 类似 "host=localhost user=postgres password=yourpassword dbname=testdb"
 */
#[tauri::command]
fn sqlite_connect(url: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match sqlite::connect(url) {
        Ok(()) => res.data = "ok".to_string(),
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 使用 sqlite 查询数据
 */
#[tauri::command]
async fn sqlite_query(sql: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match sqlite::query(sql).await {
        Ok(o) => {
            res.column_name = o.column_name;
            res.data = o.data;
        }
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 使用 sqlite 执行非查询语句
 */
#[tauri::command]
async fn sqlite_exec(sql: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match sqlite::exec(sql).await {
        Ok(o) => {
            res.data = match serde_json::to_string(&o) {
                Ok(oo) => oo,
                Err(_) => "".to_string(),
            };
        }
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            my_sql_connect,
            my_sql_query,
            my_sql_exec,
            postgres_sql_connect,
            postgres_sql_query,
            postgres_sql_exec,
            sqlite_connect,
            sqlite_query,
            sqlite_exec
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
