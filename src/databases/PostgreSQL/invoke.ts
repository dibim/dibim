import { invoke } from "@tauri-apps/api/core";
import { DbResult, ExecResult, QueryResult } from "@/types/types";

export const invoker = {
  // connect: (url: string) => invoke<DbResult>("postgres_sql_connect", { url }),
  // query: (sql: string) => invoke<QueryResult>("postgres_sql_query", { sql }),
  // exec: (sql: string) => invoke<ExecResult>("postgres_sql_exec", { sql }),

  connect: (connName: string, url: string) => invoke<DbResult>("sqlx_connect", { connName, url }),
  query: (connName: string, sql: string) => invoke<QueryResult>("sqlx_query", { connName, sql }),
  exec: (connName: string, sql: string) => invoke<ExecResult>("sqlx_exec", { connName, sql }),
};
