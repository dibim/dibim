import { DbConnectionParam } from "@/databases/types";
import { DbType } from "./types";

export type DbConnections = DbConnectionParam & {
  dbType: DbType; // 数据库类性
  filePath: string; // 数据库文件, 用于 sqlite
  name: string; // 连接名字
  color: string; // 颜色
};

export type ConfigFile = {
  dbConnections: DbConnections[];
  settings: {
    lang: string; // 语言, 待实现
    theme: string; // 主题, 现在只提供神色主题
    timeFormat: string; // 时间格式, 待实现
  };
};
