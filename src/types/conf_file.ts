import { DbConnectionParam } from "@/databases/types";
import { DbType } from "./types";

export type DbConnections = DbConnectionParam & {
  dbType: DbType;
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
