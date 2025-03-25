use crate::{
    types::{FileReadRes, FileWriteRes},
    utils::fs::{self},
};

#[tauri::command]
pub fn path_exists(path_string: String) -> bool {
    fs::path_exists(path_string)
}

#[tauri::command]
pub fn read_file_text(path_string: String) -> FileReadRes {
    let mut res = FileReadRes::new();

    match fs::read_file_text(path_string) {
        Ok(o) => res.result = o,
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

#[tauri::command]
pub fn read_file_base64(path_string: String) -> FileReadRes {
    let mut res = FileReadRes::new();

    match fs::read_file_base64(path_string) {
        Ok(o) => res.result = o,
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

#[tauri::command]
pub fn write_file_text(path_string: String, content: String) -> FileWriteRes {
    let mut res = FileWriteRes::new();

    match fs::write_file_text(path_string, content) {
        Ok(_) => res.result = true,
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

#[tauri::command]
pub fn write_file_base64(path_string: String, content: String) -> FileWriteRes {
    let mut res = FileWriteRes::new();

    match fs::write_file_base64(path_string, content) {
        Ok(_) => res.result = true,
        Err(e) => res.error_message = e.to_string(),
    }

    res
}
