/**
 * 点击表格显示数据
 */
import { useEffect } from "react";
import { getTableData } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { MainContentData } from "@/types/types";

export function TableData(props: MainContentData) {
  const { currentDbType, currentTableName } = useCoreStore();

  const getData = async () => {
    await getTableData(currentDbType, {
      tableName: currentTableName,
      orderBy: "",
      currentPage: 1,
      pageSize: 20,
    });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div>次级标签页(表结构 /数据 的显示)</div>
      <div>数据</div>
    </div>
  );
}
