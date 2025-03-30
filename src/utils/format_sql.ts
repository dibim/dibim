import { SqlLanguage, format } from "sql-formatter";
import { DB_TYPE_MYSQL, DB_TYPE_POSTGRESQL, DB_TYPE_SQLITE } from "@/constants";
import { DbType } from "@/types/types";

export function getDbTypeLowerCase(dbType: DbType) {
  if (dbType === DB_TYPE_MYSQL) return "mysql";
  if (dbType === DB_TYPE_POSTGRESQL) return "postgresql";
  if (dbType === DB_TYPE_SQLITE) return "sqlite";

  return "sql";
}

export function formatSql(dbType: DbType, sql: string) {
  let dbTypeStr = getDbTypeLowerCase(dbType);

  const prettySQL = format(sql, {
    language: dbTypeStr as SqlLanguage,
    tabWidth: 4,
    keywordCase: "upper",
    linesBetweenQueries: 2,
  });

  return prettySQL;
}
