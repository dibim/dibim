import { useEffect } from "react";
import { getTab } from "@/context";
import { getTableStructure } from "@/databases/adapter,";

export function TableConstraint() {
  const tab = getTab();
  if (tab === null) return;
  const tabState = tab.state;

  async function getData() {
    await getTableStructure(tabState.currentTableName);
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <p>待实现</p>
    </>
  );
}
