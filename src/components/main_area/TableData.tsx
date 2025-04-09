import { useRef } from "react";
import { useSnapshot } from "valtio";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { getTableData } from "@/databases/adapter,";
import { getDefultOrderField } from "@/databases/utils";
import { addNotification, appState } from "@/store/valtio";
import { TableSection, TableSectionMethods } from "../TableSection";

export function TableData() {
  const snap = useSnapshot(appState);
  const tableRef = useRef<TableSectionMethods | null>(null);

  const getData = async (page: number) => {
    if (appState.currentTableName === "") {
      return [];
    }

    // FIXME: 在 sql 编辑器里使用 appState.currentTableStructure 是无效的
    console.log("appState.currentTableStructure:: ", appState.currentTableStructure);

    // 整理参数
    const orderBy = getDefultOrderField(appState.currentTableStructure);
    if (orderBy === "") {
      addNotification("orderBy is empty string", "error"); // TODO: 添加翻译
      return [];
    }

    const tableData = tableRef.current ? tableRef.current.getTableData() : null;
    const lastRow = tableData ? tableData[tableData.length - 1] : null;
    // 除了第一页都要根据已有的最后一条数据查询
    // Query based on the last existing data for all pages except the first page.
    const lastOrderByValue = page > 1 && lastRow ? (lastRow as any)[orderBy] : null;

    const res = await getTableData({
      tableName: appState.currentTableName,
      sortField: orderBy,
      sortOrder: "ASC",
      currentPage: page,
      pageSize: DEFAULT_PAGE_SIZE,
      lastOrderByValue,
    });

    if (res) {
      if (tableRef.current) {
        tableRef.current.setFieldNames(res.columnName);
        tableRef.current.setTableData(res.data);
        tableRef.current.setItemsTotal(res.itemsTotal);
        tableRef.current.setPageTotal(res.pageTotal);
      }

      return res.data;
    }

    return [];
  };

  async function initData() {
    await getData(1);
    tableRef.current?.setCurrentPage(1);
  }

  return (
    <TableSection
      ref={tableRef}
      width={`clac(100vw - ${snap.sideBarWidth + snap.listBarWidth + 40}px)`} // TODO: 临时减40px
      getData={getData}
      initData={initData}
    />
  );
}
