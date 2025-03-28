/**
 * 表格 DDL
 */
import { useEffect, useState } from "react";
import { getTableDdl } from "@/databases/adapter,";
import { useCoreStore } from "@/store";

export function TableEditorDdl() {
  const { currentTableName } = useCoreStore();

  const [ddl, setDdl] = useState<string>("");

  const getData = async () => {
    const res = await getTableDdl(currentTableName);
    if (res && res.data) {
      setDdl(res.data);
    }
  };

  useEffect(() => {
    getData();
  }, [currentTableName]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <pre>{ddl}</pre>
    </>
  );
}
