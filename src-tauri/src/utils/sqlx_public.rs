use super::{
    sqlx_common::{DatabaseConnection, DbPool, DB_MANAGER},
    sqlx_mysql::process_mysql_query,
    sqlx_pg::process_pg_query,
    sqlx_sqlite::process_sqlite_query,
};
use crate::{
    types::{ExecResult, QueryResult},
    utils::sqlx_common::DatabaseType,
};
use sqlx::Error;

pub async fn connect(conn_name: &str, url: &str) -> Result<(), sqlx::Error> {
    let db_type = if url.starts_with("postgres://") {
        DatabaseType::Postgres
    } else if url.starts_with("mysql://") {
        DatabaseType::MySql
    } else if url.starts_with("sqlite:") {
        DatabaseType::Sqlite
    } else {
        return Err(sqlx::Error::Configuration(
            "Unsupported database scheme".into(),
        ));
    };

    let pool = DbPool::connect(db_type, url).await?;
    let db_conn = DatabaseConnection { db_type, pool };

    DB_MANAGER
        .lock()
        .map_err(|e| {
            sqlx::Error::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            ))
        })?
        .insert(conn_name.to_string(), db_conn);

    Ok(())
}

fn get_db_connection(conn_name: &str) -> Result<DatabaseConnection, Error> {
    DB_MANAGER
        .lock()
        .map_err(|e| {
            Error::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            ))
        })?
        .get(conn_name)
        .cloned()
        .ok_or_else(|| {
            Error::Io(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "Connection not found",
            ))
        })
}

// 执行查询并返回 JSON 数组
pub async fn query(
    conn_name: &str,
    sql: &str,
    streaming: bool,          // 是否启用流式分页
    page: Option<usize>,      // 当前页码（从1开始）
    page_size: Option<usize>, // 每页条数
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let db_conn = get_db_connection(conn_name)?;

    match db_conn.pool {
        DbPool::Postgres(pool) => process_pg_query(&pool, sql, streaming, page, page_size).await,
        DbPool::MySql(pool) => process_mysql_query(&pool, sql, streaming, page, page_size).await,
        DbPool::Sqlite(pool) => process_sqlite_query(&pool, sql, streaming, page, page_size).await,
    }
}

// 执行更新/删除操作
pub async fn exec(conn_name: &str, sql: &str) -> Result<ExecResult, Error> {
    let db_conn = get_db_connection(conn_name)?;

    match db_conn.pool {
        DbPool::Postgres(pool) => {
            let result = sqlx::query(sql).execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: 0, // PostgreSQL 需要 RETURNING 子句
            })
        }
        DbPool::MySql(pool) => {
            let result = sqlx::query(sql).execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: result.last_insert_id(),
            })
        }
        DbPool::Sqlite(pool) => {
            let result = sqlx::query(sql).execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: result.last_insert_rowid() as u64,
            })
        }
    }
}
