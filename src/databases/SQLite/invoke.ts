import { invoke } from "@tauri-apps/api/core";
import { DbResult, ExecResult, QueryResult } from "@/types/types";

export const invoker = {
  connect: (connName: string, url: string) => invoke<DbResult>("sqlx_connect", { connName, url }),
  query: (connName: string, sql: string) => invoke<QueryResult>("sqlx_query", { connName, sql }),
  exec: (connName: string, sql: string) => invoke<ExecResult>("sqlx_exec", { connName, sql }),
};
