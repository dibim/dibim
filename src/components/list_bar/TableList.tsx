import { useEffect, useState } from "react";
import bytes from "bytes";
import { ArrowDown01, ArrowDownAZ, ArrowDownZA, ArrowUp01, CirclePlus, LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { subscribeKey } from "valtio/utils";
import { MAIN_CONTEN_TYPE_TABLE_EDITOR, STR_EMPTY, TAB_STRUCTURE } from "@/constants";
import {
  exec,
  genDeleteTableCmd,
  genRenameTableCmd,
  genTruncateTableCmd,
  getAllTableName,
  getAllTableSize,
} from "@/databases/adapter,";
import { appState } from "@/store/valtio";
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
  tableName: string;
  size: string;
  bytes: number; // size 转成的 字节大小
};

export function TableList() {
  const [sortBy, setSortBy] = useState<SortBy>(SORT_BY_NAME_ASC);
  const [tablData, setTableData] = useState<TableData[]>([]);

  function clickTableName(item: ListItem) {
    appState.setCurrentTableName(item.id);
    appState.setMainContenType(MAIN_CONTEN_TYPE_TABLE_EDITOR);
  }

  function addTable() {
    appState.setIsAddingTable(true);
    appState.setCurrentTableName("");
    appState.setMainContenTab(TAB_STRUCTURE);
    appState.setCurrentTableStructure([]);
  }

  // ========== 排序 ==========
  // 按表名正序排序 (A-Z)
  function sortByNameAsc() {
    setTableData([...tablData].sort((a, b) => a.tableName.localeCompare(b.tableName)));
    setSortBy(SORT_BY_NAME_ASC);
  }

  // 按表名倒序排序 (Z-A)
  function sortByNameDesc() {
    setTableData([...tablData].sort((a, b) => b.tableName.localeCompare(a.tableName)));
    setSortBy(SORT_BY_NAME_DESC);
  }

  // 按大小正序排序 (小到大)
  function sortByBytesAsc() {
    setTableData([...tablData].sort((a, b) => a.bytes - b.bytes));
    setSortBy(SORT_BY_BYTES_ASC);
  }

  // 按大小倒序排序 (大到小)
  function sortByBytesDesc() {
    setTableData([...tablData].sort((a, b) => b.bytes - a.bytes));
    setSortBy(SORT_BY_BYTES_DESC);
  }

  function renderSortBtn(sortMethod: SortBy, sortByNameAsc: () => void, Icon: LucideIcon, text: string) {
    return (
      <div onClick={sortByNameAsc}>
        <Tooltip>
          <TooltipTrigger asChild>
            {sortBy === sortMethod ? <Icon color={appState.currentConnColor} /> : <Icon />}
          </TooltipTrigger>
          <TooltipContent>
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // ========== 排序 结束 ==========

  // ========== 上下文按钮功能 ==========
  const [operateTableName, setOperateTableName] = useState<string>(""); // 现在操作的表名
  const [willExecCmd, setWillExecCmd] = useState<string>(""); // 将要执行的命令(sql 语句)
  const [showDialogRename, setShowDialogRename] = useState<boolean>(false);
  const [showDialogTruncate, setShowDialogTruncate] = useState<boolean>(false);
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);

  // 弹出确认重命名表
  async function handleRenamePopup(tableName: string) {
    setOperateTableName(tableName);
    setShowDialogRename(true);
  }
  // 处理重命名表格的输入
  async function handleRenameInput(e: React.FormEvent<HTMLInputElement>) {
    setWillExecCmd(genRenameTableCmd(operateTableName, e.currentTarget.value) || "");
  }
  // 执行重命名表
  async function handleRename() {
    exec(willExecCmd);
    getData();
  }

  // 复制表名
  async function handleCopy(tableName: string) {
    try {
      await navigator.clipboard.writeText(tableName);
      toast("复制成功");
    } catch (err) {
      toast("复制失败");
    }
  }

  // 导入数据
  function handleImport(tableName: string) {
    // TODO:
  }

  // 导出数据
  function handleExport(tableName: string) {
    // TODO:
  }

  // 弹出确认截断表
  function handleTruncatePopup(tableName: string) {
    setOperateTableName(tableName);
    setWillExecCmd(genTruncateTableCmd(tableName) || "");
    setShowDialogTruncate(true);
  }

  // 弹出确认删除表
  function handleDeletePopup(tableName: string) {
    setOperateTableName(tableName);
    setWillExecCmd(genDeleteTableCmd(tableName) || "");
    setShowDialogDelete(true);
  }

  // 确定执行语句
  function handleConfirm() {
    exec(willExecCmd);
    getData();
  }

  // ========== 上下文按钮功能 结束 ==========

  // 列表数据
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
            if (sr.table_name == tn) {
              arrTb.push({
                tableName: tn,
                size: sr.total_size,
                bytes: bytes(sr.total_size) || 0,
              });
              break;
            }
          }
        }

        setTableData(arrTb);
      }
    }
  }

  // 生成带按钮的列表数据
  function genListData() {
    const arr: ListItem[] = [];
    tablData.map((item, index) => {
      arr.push({
        id: item.tableName,
        content: (
          <div className="py-1 cursor-pointer flex justify-between items-center" key={index}>
            {/* 表名部分 */}
            <div className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title={item.tableName}>
              {item.tableName}
            </div>

            {/* 占用磁盘大小部分 */}
            <div className="flex-shrink-0 bg-muted">{item.size}</div>
          </div>
        ),
        contentOnClick: async (item) => {
          clickTableName(item);
        },
        menuItems: [
          {
            label: "重命名",
            onClick: () => {
              handleRenamePopup(item.tableName);
            },
          },
          {
            label: "复制表名",
            onClick: () => {
              handleCopy(item.tableName);
            },
          },
          {
            label: "分割线",
            onClick: () => {},
            isLine: true,
          },
          {
            label: "导入",
            onClick: () => {
              handleImport(item.tableName);
            },
          },

          {
            label: "导出",
            onClick: () => {
              handleExport(item.tableName);
            },
          },
          {
            label: "分割线",
            onClick: () => {},
            isLine: true,
          },
          {
            label: "截断",
            className: "text-[var(--fvm-warning-clr)]",
            onClick: () => {
              handleTruncatePopup(item.tableName);
            },
          },
          {
            label: "删除",
            className: "text-[var(--fvm-danger-clr)]",
            onClick: () => {
              handleDeletePopup(item.tableName);
            },
          },
        ],
      });
    });

    setListData(arr);
  }

  useEffect(() => {
    genListData();
  }, [tablData]);

  useEffect(() => {
    getData();

    // 监听 store 的变化
    const unsubscribe = subscribeKey(appState, "currentDbNme", (_value: any) => {
      getData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="flex justify-between p-2">
        {renderSortBtn(SORT_BY_NAME_ASC, sortByNameAsc, ArrowDownAZ, "按表名正序排序")}
        {renderSortBtn(SORT_BY_NAME_DESC, sortByNameDesc, ArrowDownZA, "按表名倒序排序")}
        {renderSortBtn(SORT_BY_BYTES_ASC, sortByBytesAsc, ArrowDown01, "按表格大小正序排序")}
        {renderSortBtn(SORT_BY_BYTES_DESC, sortByBytesDesc, ArrowUp01, "按表格大小倒序排序")}
        {renderSortBtn(STR_EMPTY, addTable, CirclePlus, "添加表格")}
      </div>
      <hr />

      {!tablData || tablData.length === 0 ? (
        <EmptyList />
      ) : (
        <ListWithAction items={listData} itemClassName="cursor-pointer" />
      )}

      <ConfirmDialog
        open={showDialogRename}
        title={`确认要重命名吗?`}
        content={
          <>
            <div className="flex items-center">
              <div className="pe-4">新名字</div>
              <div className="flex-1">
                <Input onInput={handleRenameInput} />
              </div>
            </div>
            <div className="pt-4">
              <div className="pb-4">将要执行的语句:</div>
              <div>{willExecCmd}</div>
            </div>
          </>
        }
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogRename(false);
        }}
        okText={"确定"}
        okCb={handleRename}
      />

      <ConfirmDialog
        open={showDialogTruncate}
        title={`确认要截断表格"${operateTableName}"吗?`}
        description={`请确认将要执行的语句:`}
        content={<SqlCodeViewer ddl={willExecCmd} />}
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogTruncate(false);
        }}
        okText={"确定"}
        okCb={handleConfirm}
      />
      <ConfirmDialog
        open={showDialogDelete}
        title={`确认要删除表格"${operateTableName}"吗?`}
        description={`请确认将要执行的语句:`}
        content={<SqlCodeViewer ddl={willExecCmd} />}
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogDelete(false);
        }}
        okText={"确定"}
        okCb={handleConfirm}
      />
    </div>
  );
}
