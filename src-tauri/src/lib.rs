// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod commands;
mod types;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::aes_gcm::aes_gcm_encrypt_string,
            commands::aes_gcm::aes_gcm_decrypt_base64,
            commands::fs::read_file_text,
            commands::fs::read_file_base64,
            commands::fs::write_file_text,
            commands::fs::write_file_base64,
            commands::fs::path_exists,
            // commands::password::store_password,
            // commands::password::verify_password,
            commands::sha::sha256,
            commands::sql::sqlx_connect,
            commands::sql::sqlx_disconnect,
            commands::sql::sqlx_exec,
            commands::sql::sqlx_query,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
