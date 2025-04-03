use once_cell::sync::Lazy;
use sqlx::mysql::{MySqlPool, MySqlPoolOptions};
use sqlx::postgres::{PgPool, PgPoolOptions};
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::collections::HashMap;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum DbType {
    Postgres,
    MySql,
    Sqlite,
}

#[derive(Clone)]
pub enum DbConnection {
    Postgres(PgPool),
    MySql(MySqlPool),
    Sqlite(SqlitePool),
}

// 全局连接管理器
// Global Connection Manager
pub struct DbPool {
    connections: Mutex<HashMap<String, DbConnection>>,
}

impl DbPool {
    // 获取全局实例
    // Get global instance
    pub fn global() -> &'static Self {
        static GLOBAL_DB_POOL: Lazy<DbPool> = Lazy::new(|| DbPool {
            connections: Mutex::new(HashMap::new()),
        });
        &GLOBAL_DB_POOL
    }

    // 连接数据库并记录名称
    // Connect to the database and record the name
    pub async fn connect(
        &self,
        db_type: DbType,
        name: impl Into<String>,
        url: &str,
    ) -> Result<(), sqlx::Error> {
        let name = name.into();
        let mut connections = self.connections.lock().await;
        if connections.contains_key(&name) {
            return Err(sqlx::Error::Configuration(
                // 这里的提示文字在前端会匹配字符串, 要统一
                format!(
                    "Duplicate connection name: '{}'. Connection names must be unique.",
                    name
                )
                .into(),
            ));
        }

        let connection = match db_type {
            DbType::Postgres => {
                let pool = PgPoolOptions::new().max_connections(5).connect(url).await?;
                DbConnection::Postgres(pool)
            }
            DbType::MySql => {
                let pool = MySqlPoolOptions::new()
                    .max_connections(5)
                    .connect(url)
                    .await?;
                DbConnection::MySql(pool)
            }
            DbType::Sqlite => {
                let pool = SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect(url)
                    .await?;
                DbConnection::Sqlite(pool)
            }
        };

        connections.insert(name, connection);

        Ok(())
    }

    // 断开指定连接
    // Disconnect the specified connection
    pub async fn disconnect(&self, name: &str) -> bool {
        if let Some(conn) = self.connections.lock().await.remove(name) {
            match conn {
                DbConnection::Postgres(pool) => pool.close().await,
                DbConnection::MySql(pool) => pool.close().await,
                DbConnection::Sqlite(pool) => pool.close().await,
            }
            true
        } else {
            false
        }
    }

    // 获取连接（如果存在）
    // Get connection (if it exists)
    pub async fn get(&self, name: &str) -> Option<DbConnection> {
        self.connections.lock().await.get(name).cloned()
    }

    // 检查连接是否存在
    // Check if the connection exists
    // pub async fn contains(&self, name: &str) -> bool {
    //     self.connections.lock().await.contains_key(name)
    // }
}
