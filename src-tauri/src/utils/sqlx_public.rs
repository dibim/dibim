use super::{
    sqlx_common::{DbConnection, DbPool},
    sqlx_mysql::query_mysql,
    sqlx_pg::query_pg,
    sqlx_sqlite::query_sqlite,
};
use crate::{
    types::{ExecResult, QueryResult},
    utils::{common::print_sql, sqlx_common::DbType},
};
use sqlx::{Error, Execute};

pub fn get_db_type(url: &str) -> Result<DbType, Error> {
    let url_lower = url.to_lowercase();

    if url_lower.starts_with("postgres://") {
        Ok(DbType::Postgres)
    } else if url_lower.starts_with("mysql://") {
        Ok(DbType::MySql)
    } else if url_lower.starts_with("sqlite:") {
        Ok(DbType::Sqlite)
    } else {
        Err(Error::Configuration(
            format!("Unsupported database scheme in URL: {}", url).into(),
        ))
    }
}

pub async fn connect(conn_name: &str, url: &str) -> Result<(), sqlx::Error> {
    let db_type = get_db_type(url)?;
    DbPool::global().connect(db_type, conn_name, url).await
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
        .await
        .ok_or_else(|| format!("Connection '{}' not found", conn_name))?;

    match db_conn {
        DbConnection::Postgres(pool) => query_pg(&pool, sql, streaming, page, page_size).await,
        DbConnection::MySql(pool) => query_mysql(&pool, sql, streaming, page, page_size).await,
        DbConnection::Sqlite(pool) => query_sqlite(&pool, sql, streaming, page, page_size).await,
    }
}

// 执行单条非查询语句
// Execute a single non query statement
pub async fn exec(conn_name: &str, sql: &str) -> Result<ExecResult, Box<dyn std::error::Error>> {
    let db_conn = DbPool::global()
        .get(conn_name)
        .await
        .ok_or_else(|| format!("Connection '{}' not found", conn_name))?;

    match db_conn {
        DbConnection::Postgres(pool) => {
            let query = sqlx::query(sql);

            #[cfg(debug_assertions)]
            {
                print_sql(query.sql(), 7);
            }

            let result = query.execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: 0, // PostgreSQL 需要 RETURNING 子句
            })
        }
        DbConnection::MySql(pool) => {
            let query = sqlx::query(sql);

            #[cfg(debug_assertions)]
            {
                print_sql(query.sql(), 7);
            }

            let result = query.execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: result.last_insert_id(),
            })
        }
        DbConnection::Sqlite(pool) => {
            let query = sqlx::query(sql);

            #[cfg(debug_assertions)]
            {
                print_sql(query.sql(), 7);
            }

            let result = query.execute(&pool).await?;
            Ok(ExecResult {
                affected_rows: result.rows_affected(),
                last_insert_id: result.last_insert_rowid() as u64,
            })
        }
    }
}

// 执行多条非查询语句
// Execute multiple non query statements
pub async fn execute_many(
    conn_name: &str,
    sql: &str,
) -> Result<ExecResult, Box<dyn std::error::Error>> {
    let db_conn = DbPool::global()
        .get(conn_name)
        .await
        .ok_or_else(|| format!("Connection '{}' not found", conn_name))?;

    match db_conn {
        DbConnection::Postgres(pool) => {
            let mut tx = pool.begin().await?;

            #[cfg(debug_assertions)]
            {
                print_sql("Transaction start", 1);
            }

            for stmt in sql.split(';').map(|s| s.trim()).filter(|s| !s.is_empty()) {
                let query = sqlx::query(stmt);

                #[cfg(debug_assertions)]
                {
                    print_sql(query.sql(), 2);
                }
                query.execute(&mut *tx).await?;
            }

            tx.commit().await?;

            #[cfg(debug_assertions)]
            {
                print_sql("Transaction end", 4);
            }

            Ok(ExecResult {
                affected_rows: 0,
                last_insert_id: 0, // PostgreSQL 需要 RETURNING 子句
            })
        }
        DbConnection::MySql(pool) => {
            let mut tx = pool.begin().await?;

            #[cfg(debug_assertions)]
            {
                print_sql("Transaction start", 1);
            }

            for stmt in sql.split(';').map(|s| s.trim()).filter(|s| !s.is_empty()) {
                let query = sqlx::query(stmt);

                #[cfg(debug_assertions)]
                {
                    print_sql(query.sql(), 2);
                }
                query.execute(&mut *tx).await?;
            }

            tx.commit().await?;

            #[cfg(debug_assertions)]
            {
                print_sql("Transaction end", 4);
            }

            Ok(ExecResult {
                affected_rows: 0,
                last_insert_id: 0,
            })
        }
        DbConnection::Sqlite(pool) => {
            let mut tx = pool.begin().await?;

            #[cfg(debug_assertions)]
            {
                print_sql("Transaction start", 1);
            }

            for stmt in sql.split(';').map(|s| s.trim()).filter(|s| !s.is_empty()) {
                let query = sqlx::query(stmt);

                #[cfg(debug_assertions)]
                {
                    print_sql(query.sql(), 2);
                }
                query.execute(&mut *tx).await?;
            }

            tx.commit().await?;

            #[cfg(debug_assertions)]
            {
                print_sql("Transaction end", 4);
            }

            Ok(ExecResult {
                affected_rows: 0,
                last_insert_id: 0,
            })
        }
    }
}
