import { useEffect } from "react";
import { getTableStructure } from "@/databases/adapter,";
import { useCoreStore } from "@/store";

export function TableEditorConstraint() {
  const { currentTableName } = useCoreStore();

  async function getData() {
    await getTableStructure(currentTableName);
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
