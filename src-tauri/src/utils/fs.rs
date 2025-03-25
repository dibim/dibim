use anyhow::{Context, Result};
use base64::{engine::general_purpose, Engine as _};
use std::{fs, path::Path};

/// 读取文件的文本
pub fn read_file_text(input_path: String) -> Result<String> {
    let input_path = Path::new(&input_path);
    let plaintext = fs::read(input_path)
        .with_context(|| format!("Failed to read file: {}", input_path.display()))?;

    String::from_utf8(plaintext).map_err(|e| anyhow::anyhow!("File contains invalid UTF-8: {}", e))
}

/// 读取文件的二进制内容
pub fn read_file_base64(input_path: String) -> Result<String> {
    let input_path = Path::new(&input_path);
    let bytes = fs::read(input_path)
        .with_context(|| format!("Failed to read file: {}", input_path.display()))?;

    Ok(general_purpose::STANDARD.encode(&bytes))
}

/// 写入文本内容到文件
pub fn write_file_text(output_path: String, content: String) -> Result<()> {
    let output_path = Path::new(&output_path);
    fs::write(output_path, content)
        .with_context(|| format!("Failed to write text to file: {}", output_path.display()))?;

    Ok(())
}
/// 写入二进制内容到文件
pub fn write_file_base64(output_path: String, content_base64: String) -> Result<()> {
    let content = general_purpose::STANDARD
        .decode(&content_base64)
        .context("Invalid base64 input")?;

    let output_path = Path::new(&output_path);
    fs::write(output_path, content)
        .with_context(|| format!("Failed to write bytes to file: {}", output_path.display()))?;

    Ok(())
}
