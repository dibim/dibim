import { DbConnectionParam } from "@/databases/types";
import { DbType } from "./types";

export type DbConnections = DbConnectionParam & {
  dbType: DbType;
  name: string; // 数据库连接的名字 | Name of database connection
  color: string;
};

// 主配置文件 | Main configuration file
export type ConfigFileMain = {
  dbConnections: DbConnections[];
  settings: {
    lang: string;
    colorScheme: string;
    timeFormat: string;
  };
};

// 外观配置文件 | Appearance configuration file
export type ConfigFileAppearance = {
  lang: string;
  colorScheme: string;
};
