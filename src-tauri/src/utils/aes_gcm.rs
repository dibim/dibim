use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm,
};
use anyhow::{Context, Result};
use base64::{engine::general_purpose, Engine as _};
use sha2::{digest::generic_array::GenericArray, Digest, Sha256};

// 常量配置
const KEY_LENGTH: usize = 32;
const NONCE_TAIL_LENGTH: usize = 12; // 从SHA256最后取12字节作为nonce
const MIN_KEY_LENGTH: usize = 6;

/// 严格验证密钥
fn validate_key(key: &str) -> Result<[u8; 32]> {
    // 基础检查
    anyhow::ensure!(!key.is_empty(), "Key cannot be empty");
    anyhow::ensure!(
        key.len() >= MIN_KEY_LENGTH,
        "Key must be at least {} characters long",
        MIN_KEY_LENGTH
    );

    // 转换为字节后必须正好32字节
    let bytes = key.as_bytes();
    anyhow::ensure!(
        bytes.len() >= KEY_LENGTH,
        "Key must be longer than or equal to {} bytes (got {} bytes). Tip: Use base64 encoded random bytes.",
        KEY_LENGTH,
        bytes.len()
    );

    // 超长的只取前面32位
    let mut key_bytes = [0u8; 32];
    key_bytes[..KEY_LENGTH].copy_from_slice(&bytes[..KEY_LENGTH]);

    Ok(key_bytes)
}

/// 从密钥生成nonce
fn generate_nonce(key: &str) -> GenericArray<u8, aes_gcm::aead::consts::U12> {
    let mut hasher = Sha256::default();
    hasher.update(key.as_bytes());
    let hash_result = hasher.finalize();
    let nonce_bytes = &hash_result[hash_result.len() - NONCE_TAIL_LENGTH..];
    *GenericArray::from_slice(nonce_bytes)
}

/// AES-GCM 加密字符串
pub fn aes_gcm_encrypt_string(string: String, key: String) -> Result<String> {
    let key_arr = validate_key(&key)?;
    let plaintext = string.into_bytes();
    let nonce = generate_nonce(&key); // 生成基于密钥的nonce

    let cipher = Aes256Gcm::new_from_slice(&key_arr)
        .map_err(|e| anyhow::anyhow!("Failed to initialize cipher: {}", e))?;

    let ciphertext = cipher
        .encrypt(&nonce, plaintext.as_ref())
        .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;

    Ok(general_purpose::STANDARD.encode(&ciphertext))
}

/// AES-GCM 解密 base64 字符串
pub fn aes_gcm_decrypt_base64(base64_string: String, key: String) -> Result<String> {
    let key_arr = validate_key(&key)?;

    let ciphertext = general_purpose::STANDARD
        .decode(&base64_string)
        .context("Invalid base64 input")?;

    let nonce = generate_nonce(&key);

    let cipher = Aes256Gcm::new_from_slice(&key_arr)
        .map_err(|e| anyhow::anyhow!("Failed to initialize cipher: {}", e))?;

    let plaintext = cipher
        .decrypt(&nonce, ciphertext.as_ref())
        .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))?;

    String::from_utf8(plaintext).context("Decrypted content is not valid UTF-8")
}
