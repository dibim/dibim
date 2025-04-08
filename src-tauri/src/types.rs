use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct DbResult {
    // 列表数组的 json, 仅查询的时候有数据
    // JSON for list arrays, with data available only during queries
    #[serde(rename = "columnName")]
    pub column_name: String,

    // 查询结果, 实际是 json 字符串
    // The query result is actually a JSON string
    #[serde(rename = "data")]
    pub data: String,

    // 错误消息
    // error message
    #[serde(rename = "errorMessage")]
    pub error_message: String,
}

impl DbResult {
    pub fn new() -> Self {
        Self::default()
    }
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct QueryResult {
    // 列表数组的 json, 仅查询的时候有数据
    // JSON for list arrays, with data available only during queries
    #[serde(rename = "columnName")]
    pub column_name: String,

    // 查询结果, 实际是 json 字符串
    // The query result is actually a JSON string
    #[serde(rename = "data")]
    pub data: String,
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct ExecResult {
    #[serde(rename = "affectedRows")]
    pub affected_rows: u64,

    #[serde(rename = "lastInsertId")]
    pub last_insert_id: u64,
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
