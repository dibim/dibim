import { invoke } from "@tauri-apps/api/core";
import { DbResult, ExecResult, QueryResult } from "./types/types";

// AES-GCM 加密解密的结果
// The result of AES-GCM encryption and decryption
export type AesRes = { result: string; errorMessage: string };

// 读取文件的结果
// The result of reading the file
export type FileReadRes = { result: string; errorMessage: string };

// 写入文件的结果
// The result of writing to the file
export type FileWriteRes = { result: boolean; errorMessage: string };

export const invoker = {
  // SHA
  sha256: (str: string) => invoke<string>("sha256", { string: str }),

  // AES-GCM
  aesGcmEncryptString: (str: string, key: string) => invoke<AesRes>("aes_gcm_encrypt_string", { string: str, key }),
  aesGcmDecryptBase64: (str: string, key: string) =>
    invoke<AesRes>("aes_gcm_decrypt_base64", { base64String: str, key }),

  // FS
  pathExists: (pathString: string) => invoke<boolean>("path_exists", { pathString }),
  readFileText: (pathString: string) => invoke<FileReadRes>("read_file_text", { pathString }),
  readFileBase64: (pathString: string) => invoke<FileReadRes>("read_file_base64", { pathString }),
  writeFileText: (pathString: string, content: string) =>
    invoke<FileWriteRes>("write_file_text", { pathString, content }),
  writeFileBase64: (pathString: string, content: string) =>
    invoke<FileWriteRes>("write_file_base64", { pathString, content }),

  // SQL
  /**
   * 连接 SQL 数据库 | Connect to SQL database
   * @param connName 数据库连接的名字 | Name of database connection
   * @param url 连接数据库的配置 | Database connection configuration
   * @returns
   */
  connectSql: (connName: string, url: string) => invoke<DbResult>("sqlx_connect", { connName, url }),
  disconnectSql: (connName: string) => invoke<DbResult>("sqlx_disconnect", { connName }),

  /**
   * 执行 SQL 查询 | Execute SQL query
   * @param connName 数据库连接的名字 | Name of database connection
   * @param sql 要执行的语句 | Statement to be executed
   * @param streaming 是否使用流式查询(用于在sql编辑器查询结果)
   * @param page 流式查询的页码
   * @param pageSize 流式查询的页大小
   * @returns
   */
  querySql: (connName: string, sql: string, streaming?: boolean, page?: number, pageSize?: number) =>
    invoke<QueryResult>("sqlx_query", { connName, sql, streaming, page, pageSize }),
  /**
   * 执行非查询语句 | Execute non query statements
   * @param connName 数据库连接的名字 | Name of database connection
   * @param sql 要执行的语句 | Statement to be executed
   * @returns
   */
  execSql: (connName: string, sql: string) => invoke<ExecResult>("sqlx_exec", { connName, sql }),
};
