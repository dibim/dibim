use crate::utils::aes_gcm::{self};

#[tauri::command]
pub fn aes_gcm_encrypt_string(string: String, key: String) -> (Option<String>, Option<String>) {
    match aes_gcm::aes_gcm_encrypt_string(string, key) {
        Ok(crypto_result) => (Some(crypto_result), None),
        Err(e) => (None, Some(e.to_string())),
    }
}

#[tauri::command]
pub fn aes_gcm_decrypt_base64(
    base64_string: String,
    key: String,
) -> (Option<String>, Option<String>) {
    match aes_gcm::aes_gcm_decrypt_base64(base64_string, key) {
        Ok(crypto_result) => (Some(crypto_result), None),
        Err(e) => (None, Some(e.to_string())),
    }
}
