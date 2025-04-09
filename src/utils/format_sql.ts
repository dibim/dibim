import { SqlLanguage, format } from "sql-formatter";
import { DB_MYSQL, DB_POSTGRESQL, DB_SQLITE } from "@/databases/constants";
import { DbType } from "@/databases/types";

export function getDbTypeLowerCase(dbType: DbType) {
  if (dbType === DB_MYSQL) return "mysql";
  if (dbType === DB_POSTGRESQL) return "postgresql";
  if (dbType === DB_SQLITE) return "sqlite";

  return "sql";
}

export function formatSql(dbType: DbType, sql: string) {
  let dbTypeStr = getDbTypeLowerCase(dbType);
  const res = {
    result: "",
    errorMessage: "",
  };

  try {
    res.result = format(sql, {
      language: dbTypeStr as SqlLanguage,
      tabWidth: 4,
      keywordCase: "upper",
      linesBetweenQueries: 0,
    });
  } catch (error) {
    res.errorMessage = `${error}`;
  }

  return res;
}
