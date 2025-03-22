// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use types::DbResult;

mod my_sql;
mod postgre_sql;
mod sqlite;
mod types;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/**
 * 连接到 my_sql
 * conn_string 连接字符串, 类似 "mysql://root:yourpassword@localhost:3306/testdb"
 */
#[tauri::command]
async fn connect_my_sql(conn_string: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match my_sql::connect(conn_string).await {
        Ok(()) => res.data = "ok".to_string(),
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 使用 my_sql 查询数据
 */
#[tauri::command]
async fn query_my_sql(conn_string: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match my_sql::query(conn_string).await {
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
 * 使用 my_sql 执行非查询语句
 */
#[tauri::command]
async fn exec_my_sql(conn_string: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match my_sql::exec(conn_string).await {
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
 * conn_string 连接字符串, 类似 "host=localhost user=postgres password=yourpassword dbname=testdb"
 */
#[tauri::command]
fn connect_postgre_sql(conn_string: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match postgre_sql::connect(conn_string) {
        Ok(()) => res.data = "ok".to_string(),
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 使用 postgre_sql 查询数据
 */
#[tauri::command]
fn query_postgre_sql(conn_string: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match postgre_sql::query(conn_string) {
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
 * 使用 postgre_sql 执行非查询语句
 */
#[tauri::command]
fn exec_postgre_sql(conn_string: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match postgre_sql::exec(conn_string) {
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
 * conn_string 连接字符串, 类似 "host=localhost user=postgres password=yourpassword dbname=testdb"
 */
#[tauri::command]
fn connect_sqlite(conn_string: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match sqlite::connect(conn_string) {
        Ok(()) => res.data = "ok".to_string(),
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

/**
 * 使用 sqlite 查询数据
 */
#[tauri::command]
async fn query_sqlite(conn_string: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match sqlite::query(conn_string).await {
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
 * 使用 sqlite 执行非查询语句
 */
#[tauri::command]
async fn exec_sqlite(conn_string: String) -> DbResult {
    let mut res = DbResult {
        error_message: "".to_string(),
        data: "".to_string(),
        column_name: "".to_string(),
    };

    match sqlite::exec(conn_string).await {
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
            connect_my_sql,
            query_my_sql,
            exec_my_sql,
            connect_postgre_sql,
            query_postgre_sql,
            exec_postgre_sql,
            connect_sqlite,
            query_sqlite,
            exec_sqlite
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
