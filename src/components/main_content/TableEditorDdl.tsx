import { useEffect, useState } from "react";
import { getTableDdl } from "@/databases/adapter,";
import { appState } from "@/store/valtio";
import { formatSql } from "@/utils/format_sql";
import { SqlCodeViewer } from "../SqlCodeViewer";

export function TableEditorDdl() {
  const [ddl, setDdl] = useState<string>("");

  async function getData() {
    const res = await getTableDdl(appState.currentTableName);
    if (res && res.data) {
      let sql = res.data;
      if (sql.length > 0) {
        sql = formatSql(appState.currentDbType, sql);
      } else {
        sql = "未查询到 DDL";
      }

      setDdl(sql);

      // setDdl(res.data);
    }
  }

  useEffect(() => {
    getData();
  }, [appState.currentTableName]);

  useEffect(() => {
    getData();
  }, []);

  return <SqlCodeViewer ddl={ddl} />;
}
