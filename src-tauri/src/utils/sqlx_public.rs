use super::{
    sqlx_common::{DbConnection, DbPool},
    sqlx_mysql::process_mysql_query,
    sqlx_pg::process_pg_query,
    sqlx_sqlite::process_sqlite_query,
};
use crate::{
    types::{ExecResult, QueryResult},
    utils::sqlx_common::DbType,
};
use sqlx::Error;

pub fn get_db_type(url: &str) -> Result<DbType, Error> {
    let url_lower = url.to_lowercase();

    if url_lower.starts_with("postgres://") {
        Ok(DbType::Postgres)
    } else if url_lower.starts_with("mysql://") {
        Ok(DbType::MySql)
    } else if url_lower.starts_with("sqlite::") {
        Ok(DbType::Sqlite)
    } else {
        Err(Error::Configuration(
            format!("Unsupported database scheme in URL: {}", url).into(),
        ))
    }
}

pub async fn connect(conn_name: &str, url: &str) -> Result<(), sqlx::Error> {
    let db_type = get_db_type(url)?;
    DbPool::global().connect(db_type, conn_name, url).await?;
    Ok(())
}

pub async fn disconnect(conn_name: &str) -> Result<bool, sqlx::Error> {
    Ok(DbPool::global().disconnect(conn_name).await)
}

// 执行查询语句并返回 JSON 数组
// Execute query statement and return JSON array
pub async fn query(
    conn_name: &str,
    sql: &str,
    streaming: bool,
    page: Option<usize>,
    page_size: Option<usize>,
) -> Result<QueryResult, Box<dyn std::error::Error>> {
    let db_conn = DbPool::global()
        .get(conn_name)
        .await.ok_or_else(|| format!("Connection '{}' not found", conn_name))?;

    match db_conn {
        DbConnection::Postgres(pool) => {
            process_pg_query(&pool, sql, streaming, page, page_size).await
        }
        DbConnection::MySql(pool) => {
            process_mysql_query(&pool, sql, streaming, page, page_size).await
        }
        DbConnection::Sqlite(pool) => {
            process_sqlite_query(&pool, sql, streaming, page, page_size).await
        }
    }
}

// 执行非查询语句
// Execute non query statements
pub async fn exec(conn_name: &str, sql: &str) -> Result<ExecResult, Box<dyn std::error::Error>> {
    let db_conn = DbPool::global()
        .get(conn_name)
        .await.ok_or_else(|| format!("Connection '{}' not found", conn_name))?;

    match db_conn {
        DbConnection::Postgres(pool) => {
            let result = sqlx::query(sql).execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: 0, // PostgreSQL 需要 RETURNING 子句
            })
        }
        DbConnection::MySql(pool) => {
            let result = sqlx::query(sql).execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: result.last_insert_id(),
            })
        }
        DbConnection::Sqlite(pool) => {
            let result = sqlx::query(sql).execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: result.last_insert_rowid() as u64,
            })
        }
    }
}
