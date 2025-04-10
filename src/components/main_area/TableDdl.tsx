import { useEffect, useState } from "react";
import { HEDAER_H } from "@/constants";
import { appState } from "@/store/valtio";
import { SqlCodeViewer } from "../SqlCodeViewer";

export function TableDdl() {
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

  return (
    <div className="overflow-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H * 4})` }}>
      <SqlCodeViewer ddl={ddl} />
    </div>
  );
}
