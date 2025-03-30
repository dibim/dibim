import { DbConnectionParam } from "@/databases/types";
import { DbType } from "./types";

export type DbConnections = DbConnectionParam & {
  dbType: DbType;
  filePath: string; // 数据库文件, 用于 sqlite | Database file, used for SQLite
  name: string; // 数据库连接的名字 | Name of database connection
  color: string;
};

export type ConfigFile = {
  dbConnections: DbConnections[];
  settings: {
    lang: string;
    theme: string;
    timeFormat: string;
  };
};
