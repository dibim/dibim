import { useEffect, useState } from "react";
import { getTableDdl } from "@/databases/adapter,";
import { appState } from "@/store/valtio";
import { SqlCodeViewer } from "../SqlCodeViewer";

export function TableEditorDdl() {
  const [ddl, setDdl] = useState<string>("");

  async function getData() {
    const res = await getTableDdl(appState.currentTableName);
    if (res && res.data) {
      let sql = res.data;
      if (sql === "") sql = "未查询到 DDL";

      setDdl(sql);
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
