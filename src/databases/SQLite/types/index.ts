interface SqliteConnectionParams {
  filename: string; // SQLite 数据库文件路径
  mode?: number; // 打开模式（如 sqlite3.OPEN_READONLY）
}