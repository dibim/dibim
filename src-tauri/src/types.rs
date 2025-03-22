use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct DbResult {
    #[serde(rename = "columnName")]
    pub column_name: String, // 列表数组 json, 仅查询的时候有数据

    #[serde(rename = "data")]
    pub data: String, // 查询结果, 实际是 json 字符串

    #[serde(rename = "errorMessage")]
    pub error_message: String, // 错误消息
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QueryResult {
    #[serde(rename = "columnName")]
    pub column_name: String, // 列表数组 json

    #[serde(rename = "data")]
    pub data: String, // 查询结果, 实际是 json 字符串
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExecResult {
    #[serde(rename = "affectedRows")]
    pub affected_rows: u64,

    #[serde(rename = "lastInsertId")]
    pub last_insert_id: u64,
}
