/**
 * 设置
 *
 */
import { useEffect, useState } from "react";
import { getTableDdl } from "@/databases/adapter,";
import { useCoreStore } from "@/store";

export function Settings() {
  const { currentDbType, currentTableName } = useCoreStore();

  const [tableData, setTableData] = useState<any[]>([]); // 表结构

  const getData = async () => {
    const res = await getTableDdl(currentDbType, currentTableName);
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
      <p>设置</p>
    </>
  );
}
