import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import bytes from "bytes";
import { ArrowDown01, ArrowDownAZ, ArrowDownZA, ArrowUp01, CirclePlus, LucideIcon } from "lucide-react";
import { MAIN_AREA_TABLE_EDITOR, MAIN_AREA_TAB_STRUCTURE, STR_EMPTY } from "@/constants";
import { getTab } from "@/context";
import {
  exec,
  genDeleteTableCmd,
  genRenameTableCmd,
  genTruncateTableCmd,
  getAllTableName,
  getAllTableSize,
} from "@/databases/adapter,";
import { useActiveTabStore } from "@/hooks/useActiveTabStore";
import { addNotification, coreState, setTabTitle } from "@/store/core";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyList } from "../EmptyList";
import { ListItem, ListWithAction } from "../ListWithAction";
import { SqlCodeViewer } from "../SqlCodeViewer";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const SORT_BY_NAME_ASC = "SORT_BY_NAME_ASC";
const SORT_BY_NAME_DESC = "SORT_BY_NAME_DESC";
const SORT_BY_BYTES_ASC = "SORT_BY_BYTES_ASC";
const SORT_BY_BYTES_DESC = "SORT_BY_BYTES_DESC";

type SortBy =
  | typeof STR_EMPTY
  | typeof SORT_BY_NAME_ASC
  | typeof SORT_BY_NAME_DESC
  | typeof SORT_BY_BYTES_ASC
  | typeof SORT_BY_BYTES_DESC;

type TableData = {
  indexSize: string;
  indexSizeByte: number;
  tableName: string;
  tableSize: string;
  tableSizeByte: number;
  totalSize: string;
  totalSizeByte: number;
};

export function TableList() {
  const { t } = useTranslation();

  const [sortBy, setSortBy] = useState<SortBy>(SORT_BY_NAME_ASC);
  const [tablData, setTableData] = useState<TableData[]>([]);

  function clickTableName(item: ListItem) {
    const tab = getTab();
    if (tab === null) return;
    const tabState = tab.state;

    tabState.setCurrentTableName(item.id);
    tabState.setMainAreaType(MAIN_AREA_TABLE_EDITOR);
    tabState.setColor(coreState.currentConnColor);
    setTabTitle(item.id);
  }

  function addTable() {
    const tab = getTab();
    if (tab === null) return;
    const tabState = tab.state;

    tabState.setIsAddingTable(true);
    tabState.setCurrentTableName("");
    tabState.setMainAreaTab(MAIN_AREA_TAB_STRUCTURE);
    tabState.setCurrentTableStructure([]);
  }

  // ========== 排序 | Sort ==========
  // 按表名正序排序 (A-Z) | Sort by table name in positive order (A-Z)
  function sortByNameAsc() {
    setTableData([...tablData].sort((a, b) => a.tableName.localeCompare(b.tableName)));
    setSortBy(SORT_BY_NAME_ASC);
  }

  // 按表名倒序排序 (Z-A) | Sort by table name in reverse order (Z-A)
  function sortByNameDesc() {
    setTableData([...tablData].sort((a, b) => b.tableName.localeCompare(a.tableName)));
    setSortBy(SORT_BY_NAME_DESC);
  }

  // 按大小正序排序 (小到大) | Sort by size in positive order (small to large)
  function sortByBytesAsc() {
    setTableData([...tablData].sort((a, b) => a.totalSizeByte - b.totalSizeByte));
    setSortBy(SORT_BY_BYTES_ASC);
  }

  // 按大小倒序排序 (大到小) | Sort by size in reverse order (large to small)
  function sortByBytesDesc() {
    setTableData([...tablData].sort((a, b) => b.totalSizeByte - a.totalSizeByte));
    setSortBy(SORT_BY_BYTES_DESC);
  }

  function renderSortBtn(sortMethod: SortBy, sortByNameAsc: () => void, Icon: LucideIcon, text: string) {
    let color = `var(--foreground")`;
    if (coreState.currentConnColor) color = coreState.currentConnColor;

    return (
      <div onClick={sortByNameAsc}>
        <Tooltip>
          <TooltipTrigger asChild>{sortBy === sortMethod ? <Icon color={color} /> : <Icon />}</TooltipTrigger>
          <TooltipContent>
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // ========== 排序 结束 | Sort end ==========

  // ========== 上下文按钮 | Context button ==========
  const [operateTableName, setOperateTableName] = useState<string>("");
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);
  const [showDialogRename, setShowDialogRename] = useState<boolean>(false);
  const [showDialogTruncate, setShowDialogTruncate] = useState<boolean>(false);
  const [willExecCmd, setWillExecCmd] = useState<string>("");

  async function handleRenamePopup(tableName: string) {
    setOperateTableName(tableName);
    setShowDialogRename(true);
  }

  async function handleRenameInput(e: React.FormEvent<HTMLInputElement>) {
    setWillExecCmd(genRenameTableCmd(operateTableName, e.currentTarget.value) || "");
  }

  async function handleRename() {
    exec(willExecCmd);
    getData();
  }

  async function handleCopy(tableName: string) {
    try {
      await navigator.clipboard.writeText(tableName);
      addNotification(t("Copied"), "success");
    } catch (err) {
      console.log("Copy failed, error: ", err);
      addNotification(t("Copy failed"), "error");
    }
  }

  function handleImport(tableName: string) {
    // TODO:
    addNotification("not implemented", "error");
  }

  function handleExport(tableName: string) {
    // TODO:
    addNotification("not implemented", "error");
  }

  function handleTruncatePopup(tableName: string) {
    setOperateTableName(tableName);
    setShowDialogTruncate(true);
    setWillExecCmd(genTruncateTableCmd(tableName) || "");
  }

  function handleDeletePopup(tableName: string) {
    setOperateTableName(tableName);
    setShowDialogDelete(true);
    setWillExecCmd(genDeleteTableCmd(tableName) || "");
  }

  async function handleConfirm() {
    const res = await exec(willExecCmd);
    if (!res) {
      addNotification("The result of exec is null", "error");
    } else if (res.errorMessage !== "") {
      addNotification(res.errorMessage, "error");
    } else {
      getData();
    }
  }

  // ========== 上下文按钮 结束 | Context button end ==========

  const [listData, setListData] = useState<ListItem[]>([]);

  async function getData() {
    // 获取表名
    const res = await getAllTableName();
    if (res && res.data) {
      // 获取表格大小
      const sizeRes = await getAllTableSize();
      if (sizeRes && sizeRes.data) {
        const arrTb: TableData[] = [];

        // 合并数据
        for (const tn of res.data.sort()) {
          for (const sr of sizeRes.data) {
            if (sr.tableName == tn) {
              arrTb.push({
                indexSize: sr.indexSize,
                indexSizeByte: bytes(sr.indexSize) || 0,
                tableName: tn,
                tableSize: sr.tableSize,
                tableSizeByte: bytes(sr.tableSize) || 0,
                totalSize: sr.totalSize,
                totalSizeByte: bytes(sr.totalSize) || 0,
              });
              break;
            }
          }
        }

        setTableData(arrTb);
      } else {
        addNotification("Data size is none", "warning");
      }
    } else {
      addNotification("Data list is none", "warning");
    }
  }

  // 生成带按钮的列表数据
  function genListData() {
    setListData(
      tablData.map((item, index) => {
        return {
          id: item.tableName,
          content: (
            <div className="py-1 cursor-pointer flex justify-between items-center" key={index}>
              {/* 表名 | Table name */}
              <div className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title={item.tableName}>
                {item.tableName}
              </div>

              {/* 索引大小 | Index size */}
              <div className="flex-shrink-0 bg-muted text-muted-foreground text-sm">
                <div className="relative" style={{ position: "relative" }}>
                  <div
                    className="absolute inset-0 z-0 opacity-25"
                    style={{ backgroundColor: `${coreState.currentConnColor}` }}
                  />
                  <div
                    className={`absolute h-full z-10 opacity-50`}
                    style={{
                      backgroundColor: `${coreState.currentConnColor}`,
                      width: `${(item.indexSizeByte / item.totalSizeByte) * 100}%`,
                    }}
                  ></div>
                  <div className="relative z-20 px-1">{item.totalSize}</div>
                </div>
              </div>
            </div>
          ),
          contentOnClick: async (item) => {
            clickTableName(item);
          },
          menuItems: [
            {
              label: t("Rename"),
              onClick: () => {
                handleRenamePopup(item.tableName);
              },
            },
            {
              label: t("Copy table name"),
              onClick: () => {
                handleCopy(item.tableName);
              },
            },
            {
              label: t("Divider"),
              onClick: () => {},
              isDivider: true,
            },
            {
              label: t("Import"),
              onClick: () => {
                handleImport(item.tableName);
              },
            },

            {
              label: t("Export"),
              onClick: () => {
                handleExport(item.tableName);
              },
            },
            {
              label: t("Divider"),
              onClick: () => {},
              isDivider: true,
            },
            {
              label: t("Truncate"),
              className: "text-[var(--fvm-warning-clr)]",
              onClick: () => {
                handleTruncatePopup(item.tableName);
              },
            },
            {
              label: t("Delete"),
              className: "text-[var(--fvm-danger-clr)]",
              onClick: () => {
                handleDeletePopup(item.tableName);
              },
            },
          ],
        };
      }),
    );
  }

  useEffect(() => {
    genListData();
  }, [tablData]);

  // 监听 store 的变化 | Monitor changes in the store
  useActiveTabStore(coreState.activeTabId, "currentDbNme", (_val: any) => {
    getData();
  });

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="flex justify-between p-2">
        {renderSortBtn(SORT_BY_NAME_ASC, sortByNameAsc, ArrowDownAZ, t("&sortByNameAsc"))}
        {renderSortBtn(SORT_BY_NAME_DESC, sortByNameDesc, ArrowDownZA, t("&sortByNameDesc"))}
        {renderSortBtn(SORT_BY_BYTES_ASC, sortByBytesAsc, ArrowDown01, t("&sortByBytesAsc"))}
        {renderSortBtn(SORT_BY_BYTES_DESC, sortByBytesDesc, ArrowUp01, t("&sortByBytesDesc"))}
        {renderSortBtn(STR_EMPTY, addTable, CirclePlus, t("Add Table"))}
      </div>
      <hr />

      {!tablData || tablData.length === 0 ? (
        <EmptyList />
      ) : (
        <div className="p-2">
          <ListWithAction items={listData} itemClassName="cursor-pointer" />
        </div>
      )}

      <ConfirmDialog
        open={showDialogRename}
        title={t("&confirmRename")}
        content={
          <>
            <div className="flex items-center">
              <div className="pe-4">{t("New nmame")}</div>
              <div className="flex-1">
                <Input onInput={handleRenameInput} />
              </div>
            </div>
            <div className="pt-4">
              <SqlCodeViewer ddl={willExecCmd} />
            </div>
          </>
        }
        cancelText={t("Cancel")}
        cancelCb={() => {
          setShowDialogRename(false);
        }}
        okText={t("Confirm")}
        okCb={handleRename}
      />

      <ConfirmDialog
        open={showDialogTruncate}
        title={t("&confirmTruncateTable", { name: operateTableName })}
        description={t("&confirmStatement")}
        content={<SqlCodeViewer ddl={willExecCmd} />}
        cancelText={t("Cancel")}
        cancelCb={() => {
          setShowDialogTruncate(false);
        }}
        okText={t("Confirm")}
        okCb={handleConfirm}
      />
      <ConfirmDialog
        open={showDialogDelete}
        title={t("&confirmDeleteTable", { name: operateTableName })}
        description={t("&confirmStatement")}
        content={<SqlCodeViewer ddl={willExecCmd} />}
        cancelText={t("Cancel")}
        cancelCb={() => {
          setShowDialogDelete(false);
        }}
        okText={t("Confirm")}
        okCb={handleConfirm}
      />
    </div>
  );
}
