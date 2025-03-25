/**
 * 表格约束
 */
import { useEffect } from "react";
import { getTableStructure } from "@/databases/adapter,";
import { useCoreStore } from "@/store";

export function TableEditorConstraint() {
  const { currentDbType, currentTableName } = useCoreStore();

  const getData = async () => {
    await getTableStructure(currentDbType, currentTableName);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <p>待实现</p>
    </>
  );
}
