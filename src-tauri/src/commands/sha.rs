use crate::utils::sha::{self};

#[tauri::command]
pub fn sha256(string: String) -> String {
    sha::sha256(string)
}
