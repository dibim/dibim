import { useEffect } from "react";
import { getTableStructure } from "@/databases/adapter,";
import { appState } from "@/store/valtio";

export function TableEditorConstraint() {
  async function getData() {
    await getTableStructure(appState.currentTableName);
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
