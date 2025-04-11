import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { useSnapshot } from "valtio";
import { HEDAER_H, NEW_ROW_IS_ADDED_FIELD } from "@/constants";
import { getTab } from "@/context";
import { exec } from "@/databases/adapter,";
import { RowData } from "@/databases/types";
import { modifyTableData } from "@/databases/utils";
import { useActiveTabStore } from "@/hooks/useActiveTabStore";
import { cn } from "@/lib/utils";
import { coreState } from "@/store/core";
import { rawRow2EtRow } from "@/utils/render";
import { ConfirmDialog } from "./ConfirmDialog";
import { EditableTable, EditableTableMethods, ListRow, TableDataChange } from "./EditableTable";
import { PaginationSection } from "./PaginationSection";
import { SqlCodeViewer } from "./SqlCodeViewer";
import { TextNotification } from "./TextNotification";
import { TooltipGroup, TooltipSectionItem } from "./TooltipGroup";

export type TableSectionMethods = {
  addChange: (val: TableDataChange) => void;
  deleteRow: (val: number) => void;
  getCurrentPage: () => number;
  getTableData: () => RowData[];
  setCurrentPage: (val: number) => void;
  setFieldNames: (val: string[]) => void;
  setItemsTotal: (val: number) => void;
  setPageTotal: (val: number) => void;
  setTableData: (val: RowData[]) => void;
  updateDataArr: (val: RowData[]) => void;
};

export type TableSectionProps = {
  width: string;
  getData: (val: number) => Promise<any>;
  initData: () => void;
  btnExt?: TooltipSectionItem[];
  ref?: React.Ref<TableSectionMethods>;
};

export function TableSection({ width, getData, initData, btnExt, ref }: TableSectionProps) {
  const tab = getTab();
  if (tab === null) return <p>No tab found</p>;
  const tabState = tab.state;
  const tabSnap = useSnapshot(tabState);

  const { t } = useTranslation();
  const tableRef = useRef<EditableTableMethods | null>(null);

  const [tableData, setTableData] = useState<RowData[]>([]);
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [willExecCmd, setWillExecCmd] = useState<string>("");
  const [showDialogAlter, setShowDialogAlter] = useState<boolean>(false);

  const [dataArr, setDataArr] = useState<ListRow[]>([]);
  function updateDataArr(data: RowData[]) {
    setDataArr(rawRow2EtRow(data));
  }

  // ========== 分页 ==========
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageTotal, setPageTotal] = useState<number>(0);
  const [itemsTotal, setItemsTotal] = useState<number>(0);
  // 修改已有数据的变更记录, 不含添加和删除
  // Change logs for modifying existing data, excluding additions and deletions.
  const [changes, setChanges] = useState<TableDataChange[]>([]);
  function onChange(val: TableDataChange[]) {
    setChanges(val);
  }
  // ========== 分页 结束 ==========

  // ========== 按钮 ==========
  function handleApply() {
    if (tabState.uniqueFieldName === "") return;

    const deletedSet = tableRef.current?.getMultiDeleteData() || new Set();
    const addedRows = tableRef.current?.getAddedRow() || [];
    const sqls = modifyTableData(deletedSet, changes, tableData, addedRows);

    setWillExecCmd(sqls.join(""));
    setShowDialogAlter(true);
  }

  function handleCancel() {
    setChanges([]);

    tableRef.current?.willRanderTable();
    tableRef.current?.resetData();
  }

  function handleAdd() {
    tableRef.current?.willRanderTable();

    const fields = tabState.currentTableStructure.map((item) => item.name);
    const rowData = Object.fromEntries(fields.map((key) => [key, ""]));
    rowData[NEW_ROW_IS_ADDED_FIELD] = "true"; // 新添加的行的标记
    const newTableData = [...tableData, rowData]; // 为了避免和更新的行的索引有冲突, 添加到表格的最后
    setTableData(newTableData);
    updateDataArr(newTableData);
  }

  function handleDelete() {
    if (tabState.uniqueFieldName === "") return;

    tableRef.current?.willRanderTable();
    tableRef.current?.deleteMultiSelectedRow();
  }

  // 确定执行语句
  function handleConfirm() {
    exec(willExecCmd);
    initData();
  }

  const tooltipSectionData: TooltipSectionItem[] = [
    {
      trigger: <RotateCw color="var(--fvm-info-clr)" onClick={() => getData(currentPage)} />,
      content: <p>{t("Refresh")}</p>,
    },
    {
      trigger: <CirclePlus color="var(--fvm-primary-clr)" onClick={handleAdd} />,
      content: <p>{t("Add row")}</p>,
    },
    {
      trigger: <CircleMinus color="var(--fvm-danger-clr)" onClick={handleDelete} />,
      content: <p>{t("Delete row")}</p>,
    },
    {
      trigger: <CircleCheck color="var(--fvm-success-clr)" onClick={handleApply} />,
      content: <p>{t("Apply")}</p>,
    },
    {
      trigger: <CircleX color="var(--fvm-warning-clr)" onClick={handleCancel} />,
      content: <p>{t("Cancel")}</p>,
    },

    ...(btnExt ? btnExt : []),
  ];
  // ========== 按钮 结束 ==========

  useImperativeHandle(ref, () => ({
    addChange: (val: TableDataChange) => {
      tableRef.current?.addChange(val);
    },
    deleteRow: (val: number) => {
      tableRef.current?.deleteRow(val);
    },
    getCurrentPage: () => currentPage,
    getTableData: () => tableData,
    setCurrentPage: (val: number) => setCurrentPage(val),
    setFieldNames: (val: string[]) => setFieldNames(val),
    setItemsTotal: (val: number) => setItemsTotal(val),
    setPageTotal: (val: number) => setPageTotal(val),
    setTableData: (val: RowData[]) => {
      updateDataArr(val);
      setTableData(val);
    },
    updateDataArr: (val: RowData[]) => updateDataArr(val),
  }));

  // 监听 store 的变化 | Monitor changes in the store
  useActiveTabStore(coreState.activeTabId, "currentTableName", (_val: any) => {
    initData();
  });

  useEffect(() => {
    initData();
  }, []);

  return (
    <>
      {/* 按钮栏 */}
      <div className="flex flex-wrap pb-2">
        <div className={cn("gap-4 px-2 sm:pl-2.5 inline-flex items-center justify-center ")}>
          <TooltipGroup dataArr={tooltipSectionData} />
        </div>
        <div className="flex flex-1">
          <PaginationSection
            currentPage={currentPage}
            setCurrentPage={(val) => setCurrentPage(val)}
            pageTotal={pageTotal}
            itemsTotal={itemsTotal}
            getData={getData}
          />
          {dataArr.length > 0 && tabSnap.uniqueFieldName === "" && (
            <TextNotification type="error" message={t("&notUniqueKeyTip")}></TextNotification>
          )}
        </div>
      </div>

      {/* 主体表格 */}
      <EditableTable
        ref={tableRef}
        fieldNames={fieldNames}
        fieldNamesUnique={[tabSnap.uniqueFieldName]}
        dataArr={dataArr}
        onChange={onChange}
        editable={tabSnap.uniqueFieldName !== ""}
        multiSelect={true}
        height={`calc(100vh - var(--spacing) * ${HEDAER_H * 4})`}
        width={width}
      />

      {/* 确认要执行的变更语句 */}
      <ConfirmDialog
        open={showDialogAlter}
        title={t("Are you sure you want to save the changes?")}
        description={t("&confirmStatement")}
        content={<SqlCodeViewer ddl={willExecCmd} />}
        cancelText={t("Cancel")}
        cancelCb={() => {
          setShowDialogAlter(false);
        }}
        okText={t("Confirm")}
        okCb={handleConfirm}
      />
    </>
  );
}
