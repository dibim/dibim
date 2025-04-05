import { useEffect, useState } from "react";
import { appState } from "@/store/valtio";
import { SqlCodeViewer } from "../SqlCodeViewer";

export function TableEditorDdl() {
  const [ddl, setDdl] = useState<string>("");

  async function getData() {
    setDdl(appState.currentTableDdl);
  }

  useEffect(() => {
    getData();
  }, [appState.currentTableName]);

  useEffect(() => {
    getData();
  }, []);

  return <SqlCodeViewer ddl={ddl} />;
}
