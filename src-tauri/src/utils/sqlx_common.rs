/**
 * 为了避免使用 sqlx::any 的复杂逻辑, 这里明确使用的数据库类型
 */
use sqlx::mysql::{MySqlPool, MySqlPoolOptions};
use sqlx::postgres::{PgPool, PgPoolOptions};
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Copy)]
pub(crate) enum DatabaseType {
    Postgres,
    MySql,
    Sqlite,
}

#[derive(Clone)]
pub enum DbPool {
    Postgres(PgPool),
    MySql(MySqlPool),
    Sqlite(SqlitePool),
}

impl DbPool {
    pub async fn connect(db_type: DatabaseType, url: &str) -> Result<Self, sqlx::Error> {
        match db_type {
            DatabaseType::Postgres => {
                let pool = PgPoolOptions::new().max_connections(5).connect(url).await?;
                Ok(DbPool::Postgres(pool))
            }
            DatabaseType::MySql => {
                let pool = MySqlPoolOptions::new()
                    .max_connections(5)
                    .connect(url)
                    .await?;
                Ok(DbPool::MySql(pool))
            }
            DatabaseType::Sqlite => {
                let pool = SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect(url)
                    .await?;
                Ok(DbPool::Sqlite(pool))
            }
        }
    }
}

#[derive(Clone)]
pub struct DatabaseConnection {
    pub db_type: DatabaseType,
    pub pool: DbPool,
}

lazy_static::lazy_static! {
    pub static ref DB_MANAGER: Arc<Mutex<HashMap<String, DatabaseConnection>>> =
        Arc::new(Mutex::new(HashMap::new()));
}
