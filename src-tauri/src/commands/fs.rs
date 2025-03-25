use crate::utils::fs::{self};

#[tauri::command]
pub fn path_exists(path_string: String) -> bool {
    fs::path_exists(path_string)
}

#[tauri::command]
pub fn read_file_text(path_string: String) -> (Option<String>, Option<String>) {
    match fs::read_file_text(path_string) {
        Ok(crypto_result) => (Some(crypto_result), None),
        Err(e) => (None, Some(e.to_string())),
    }
}

#[tauri::command]
pub fn read_file_base64(path_string: String) -> (Option<String>, Option<String>) {
    match fs::read_file_base64(path_string) {
        Ok(crypto_result) => (Some(crypto_result), None),
        Err(e) => (None, Some(e.to_string())),
    }
}

#[tauri::command]
pub fn write_file_text(path_string: String, content: String) -> (Option<bool>, Option<String>) {
    match fs::write_file_text(path_string, content) {
        Ok(_) => (Some(true), None),
        Err(e) => (None, Some(e.to_string())),
    }
}

#[tauri::command]
pub fn write_file_base64(path_string: String, content: String) -> (Option<bool>, Option<String>) {
    match fs::write_file_base64(path_string, content) {
        Ok(_) => (Some(true), None),
        Err(e) => (None, Some(e.to_string())),
    }
}
