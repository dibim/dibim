/**
 * 表格 DDL
 *
 * FIXME: 实现比较复杂, 推迟
 */
import { useEffect, useState } from "react";
import { getTableDdl } from "@/databases/adapter,";
import { useCoreStore } from "@/store";

export function TableEditorDdl() {
  const { currentTableName } = useCoreStore();

  const [tableData, setTableData] = useState<any[]>([]); // 表结构

  const getData = async () => {
    const res = await getTableDdl(currentTableName);
    if (res && res.data) {
      setTableData(res.data);
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
      <p>{tableData}</p>
    </>
  );
}
