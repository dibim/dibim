use sha2::{Digest, Sha256};

pub fn sha256(key: String) -> String {
    let mut hasher = Sha256::default();
    hasher.update(key.as_bytes());

    format!("{:x}", hasher.finalize())
}
