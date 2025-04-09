use crate::types::DbResult;
use crate::utils::sqlx_public;

#[tauri::command]
pub async fn sqlx_connect(conn_name: String, url: String) -> DbResult {
    let mut res = DbResult::new();

    match sqlx_public::connect(&conn_name, &url).await {
        Ok(()) => res.data = "ok".to_string(),
        Err(e) => {
            eprintln!("Error occurred in sqlx_connect: {:?}", e);
            res.error_message = e.to_string()
        }
    }

    res
}

#[tauri::command]
pub async fn sqlx_disconnect(conn_name: String) -> DbResult {
    let mut res = DbResult::new();

    match sqlx_public::disconnect(&conn_name).await {
        Ok(o) => res.data = o.to_string(),
        Err(e) => {
            eprintln!("Error occurred in sqlx_disconnect: {:?}", e);
            res.error_message = e.to_string()
        }
    }

    res
}

#[tauri::command]
pub async fn sqlx_query(
    conn_name: String,
    sql: String,
    streaming: bool,
    page: Option<usize>,
    page_size: Option<usize>,
) -> DbResult {
    let mut res = DbResult::new();

    match sqlx_public::query(&conn_name, &sql, streaming, page, page_size).await {
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

#[tauri::command]
pub async fn sqlx_exec(conn_name: String, sql: String) -> DbResult {
    let mut res = DbResult::new();

    match sqlx_public::exec(&conn_name, &sql).await {
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

#[tauri::command]
pub async fn sqlx_exec_many(conn_name: String, sql: String) -> DbResult {
    let mut res = DbResult::new();

    match sqlx_public::execute_many(&conn_name, &sql).await {
        Ok(o) => {
            res.data = match serde_json::to_string(&o) {
                Ok(oo) => oo,
                Err(_) => "".to_string(),
            };
        }
        Err(e) => {
            eprintln!("Error occurred in sqlx_exec_many: {:?}", e);
            res.error_message = e.to_string()
        }
    }

    res
}
