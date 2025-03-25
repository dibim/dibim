use crate::{
    types::AesRes,
    utils::aes_gcm::{self},
};

#[tauri::command]
pub fn aes_gcm_encrypt_string(string: String, key: String) -> AesRes {
    let mut res = AesRes::new();

    match aes_gcm::aes_gcm_encrypt_string(string, key) {
        Ok(o) => res.result = o.to_string(),
        Err(e) => res.error_message = e.to_string(),
    }

    res
}

#[tauri::command]
pub fn aes_gcm_decrypt_base64(base64_string: String, key: String) -> AesRes {
    let mut res = AesRes::new();

    match aes_gcm::aes_gcm_decrypt_base64(base64_string, key) {
        Ok(o) => res.result = o.to_string(),
        Err(e) => res.error_message = e.to_string(),
    }

    res
}
