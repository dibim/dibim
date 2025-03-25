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

impl DbResult {
    pub fn new() -> Self {
        Self {
            column_name: "".to_string(),
            data: "".to_string(),
            error_message: "".to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QueryResult {
    #[serde(rename = "columnName")]
    pub column_name: String, // 列表数组 json

    #[serde(rename = "data")]
    pub data: String, // 查询结果, 实际是 json 字符串
}

impl QueryResult {
    pub fn new() -> Self {
        Self {
            column_name: "".to_string(),
            data: "".to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExecResult {
    #[serde(rename = "affectedRows")]
    pub affected_rows: u64,

    #[serde(rename = "lastInsertId")]
    pub last_insert_id: u64,
}

impl ExecResult {
    pub fn new() -> Self {
        Self {
            affected_rows: 0,
            last_insert_id: 0,
        }
    }
}

// AES-GCM 加密解密的结果, 第一项为结果, 第二项为错误消息
#[derive(Serialize, Deserialize, Debug)]
pub struct AesRes {
    pub result: String,

    #[serde(rename = "errorMessage")]
    pub error_message: String,
}

impl AesRes {
    pub fn new() -> Self {
        Self {
            result: "".to_string(),
            error_message: "".to_string(),
        }
    }
}

// 读取文件的结果, 第一项为结果, 第二项为错误消息
#[derive(Serialize, Deserialize, Debug)]
pub struct FileReadRes {
    pub result: String,

    #[serde(rename = "errorMessage")]
    pub error_message: String,
}

impl FileReadRes {
    pub fn new() -> Self {
        Self {
            result: "".to_string(),
            error_message: "".to_string(),
        }
    }
}

// 写入文件的结果, 第一项为结果, 第二项为错误消息
#[derive(Serialize, Deserialize, Debug)]
pub struct FileWriteRes {
    pub result: bool,

    #[serde(rename = "errorMessage")]
    pub error_message: String,
}

impl FileWriteRes {
    pub fn new() -> Self {
        Self {
            result: false,
            error_message: "".to_string(),
        }
    }
}
