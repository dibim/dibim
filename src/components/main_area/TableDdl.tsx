import { useEffect, useState } from "react";
import { HEDAER_H } from "@/constants";
import { getTab } from "@/context";
import { useActiveTabStore } from "@/hooks/useActiveTabStore";
import { coreState } from "@/store/valtio";
import { SqlCodeViewer } from "../SqlCodeViewer";

export function TableDdl() {
  const tab = getTab();
  if (tab === null) return <p>No tab found</p>;
  const tabState = tab.state;

  const [ddl, setDdl] = useState<string>("");

  async function getData() {
    setDdl(tabState.currentTableDdl);
  }

  // 监听 store 的变化 | Monitor changes in the store
  useActiveTabStore(coreState.activeTabId, "currentTableName", (_val: any) => {
    getData();
  });

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="overflow-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H * 4})` }}>
      <SqlCodeViewer ddl={ddl} />
    </div>
  );
}
