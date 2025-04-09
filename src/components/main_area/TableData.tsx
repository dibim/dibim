import { useRef } from "react";
import { useSnapshot } from "valtio";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { getTableData } from "@/databases/adapter,";
import { appState } from "@/store/valtio";
import { TableSection, TableSectionMethods } from "../TableSection";

export function TableData() {
  const snap = useSnapshot(appState);
  const tableRef = useRef<TableSectionMethods | null>(null);

  const getData = async (page: number) => {
    if (appState.currentTableName === "") {
      return [];
    }

    const res = await getTableData({
      tableName: appState.currentTableName,
      currentPage: page,
      pageSize: DEFAULT_PAGE_SIZE,
      where: "",
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
