import { invoke } from "@tauri-apps/api/core";

// AES-GCM 加密解密的结果
export type AesRes = [result: string, errorMessage: string];

// 读取文件的结果
export type FileReadRes = [result: string | null, errorMessage: string | null];

// 写入文件的结果
export type FileWriteRes = [result: boolean | null, errorMessage: string | null];

export const invoker = {
  // AES-GCM
  aesGcmEncryptString: (str: string, key: string) =>
    invoke<AesRes>("aes_gcm_encrypt_string", { string: str, url: key }),
  aesGcmDecryptBase64: (str: string, key: string) =>
    invoke<AesRes>("aes_gcm_decrypt_base64", { base64String: str, sql: key }),

  // fs
  readFileText: (pathString: string) => invoke<FileReadRes>("read_file_text", { pathString }),
  readFileBase64: (pathString: string) => invoke<FileReadRes>("read_file_base64", { pathString }),
  writeFileText: (pathString: string, content: string) =>
    invoke<FileWriteRes>("write_file_text", { pathString, content }),
  writeFileBase64: (pathString: string, content: string) =>
    invoke<FileWriteRes>("write_file_base64", { pathString, content }),
};
