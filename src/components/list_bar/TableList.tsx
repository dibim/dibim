import { useEffect, useState } from "react";
import bytes from "bytes";
import { ArrowDown01, ArrowDownAZ, ArrowDownZA, ArrowUp01, CirclePlus, LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { EMPTY_NEW_TABLE_NAE, MAIN_CONTEN_TYPE_TABLE_EDITOR, TAB_STRUCTURE } from "@/constants";
import {
  exec,
  genDeleteTableCmd,
  genRenameTableCmd,
  genTruncateTableCmd,
  getAllTableName,
  getAllTableSize,
} from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyList } from "../EmptyList";
import { ListItem, ListWithAction } from "../ListWithAction";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type TableData = {
  tableName: string;
  size: string;
  bytes: number; // size 转成的 字节大小
};

export function TableList() {
  const { setCurrentTableName, setMainContenType, setMainContenTab, setIsAddingTable } = useCoreStore();

  const [tablData, setTableData] = useState<TableData[]>([]);

  const clickItem = (item: ListItem) => {
    setCurrentTableName(item.id);
    setMainContenType(MAIN_CONTEN_TYPE_TABLE_EDITOR);
  };

  const addTable = () => {
    setIsAddingTable(true);
    setCurrentTableName(EMPTY_NEW_TABLE_NAE);
    setMainContenTab(TAB_STRUCTURE);
  };

  // ========== 排序 ==========
  // 按表名正序排序 (A-Z)
  const sortByNameAsc = () => setTableData([...tablData].sort((a, b) => a.tableName.localeCompare(b.tableName)));

  // 按表名倒序排序 (Z-A)
  const sortByNameDesc = () => setTableData([...tablData].sort((a, b) => b.tableName.localeCompare(a.tableName)));

  // 按大小正序排序 (小到大)
  const sortByBytesAsc = () => setTableData([...tablData].sort((a, b) => a.bytes - b.bytes));

  // 按大小倒序排序 (大到小)
  const sortByBytesDesc = () => setTableData([...tablData].sort((a, b) => b.bytes - a.bytes));

  const renderSortBtn = (sortByNameAsc: () => void, Icon: LucideIcon, text: string) => {
    return (
      <div onClick={sortByNameAsc}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Icon />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  };

  // ========== 排序 结束 ==========

  // ========== 上下文按钮功能 ==========
  const [operateTableName, setOperateTableName] = useState<string>(""); // 现在操作的表名
  const [willExecCmd, setWillExecCmd] = useState<string>(""); // 将要执行的命令(sql 语句)
  const [showDialogRename, setShowDialogRename] = useState<boolean>(false);
  const [showDialogTruncate, setShowDialogTruncate] = useState<boolean>(false);
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);

  // 弹出确认重命名表
  const handleRenamePopup = async (tableName: string) => {
    setOperateTableName(tableName);
    setShowDialogRename(true);
  };
  // 处理重命名表格的输入
  const handleRenameInput = async (e: React.FormEvent<HTMLInputElement>) => {
    setWillExecCmd(genRenameTableCmd(operateTableName, e.currentTarget.value) || "");
  };
  // 执行重命名表
  const handleRename = async () => {
    exec(willExecCmd);
    getData();
  };

  // 复制表名
  const handleCopy = async (tableName: string) => {
    try {
      await navigator.clipboard.writeText(tableName);
      toast("复制成功");
    } catch (err) {
      toast("复制失败");
    }
  };

  // 导入数据
  const handleImport = async (tableName: string) => {
    // TODO:
  };

  // 导出数据
  const handleExport = async (tableName: string) => {
    // TODO:
  };

  // 弹出确认截断表
  const handleTruncatePopup = async (tableName: string) => {
    setOperateTableName(tableName);
    setWillExecCmd(genTruncateTableCmd(tableName) || "");
    setShowDialogTruncate(true);
  };

  // 弹出确认删除表
  const handleDeletePopup = async (tableName: string) => {
    setOperateTableName(tableName);
    setWillExecCmd(genDeleteTableCmd(tableName) || "");
    setShowDialogDelete(true);
  };

  // 确定执行语句
  const handleConfirm = async () => {
    exec(willExecCmd);
    getData();
  };

  // ========== 上下文按钮功能 结束 ==========

  // 列表数据
  const [listData, setListData] = useState<ListItem[]>([]);

  const getData = async () => {
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
  };

  // 生成带按钮的列表数据
  function genListData() {
    const arr: ListItem[] = [];
    tablData.map((item, index) => {
      arr.push({
        id: item.tableName,
        content: (
          <div className="py-1 cursor-pointer flex justify-between items-center" key={index}>
            {/* 表名部分 - 占用剩余空间，不换行，超出显示省略号 */}
            <div className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title={item.tableName}>
              {item.tableName}
            </div>

            {/* 大小部分 - 不收缩，优先显示 */}
            <div className="flex-shrink-0 bg-muted">{item.size}</div>
          </div>
        ),
        contentOnClick: async (item) => {
          clickItem(item);
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
    useCoreStore.subscribe((_state, _prevState) => {
      getData();
    });
  }, []);

  return (
    <div>
      <div className="flex justify-between pb-2">
        {renderSortBtn(sortByNameAsc, ArrowDownAZ, "按表名正序排序")}
        {renderSortBtn(sortByNameDesc, ArrowDownZA, "按表名倒序排序")}
        {renderSortBtn(sortByBytesAsc, ArrowDown01, "按表格大小正序排序")}
        {renderSortBtn(sortByBytesDesc, ArrowUp01, "按表格大小倒序排序")}
        {renderSortBtn(addTable, CirclePlus, "添加表格")}
      </div>

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
        title={`确认要截断${operateTableName}吗?`}
        description={`请确认将要执行的语句:`}
        content={<pre>{willExecCmd}</pre>}
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogTruncate(false);
        }}
        okText={"确定"}
        okCb={handleConfirm}
      />
      <ConfirmDialog
        open={showDialogDelete}
        title={`确认要删除表格${operateTableName}吗?`}
        description={`请确认将要执行的语句:`}
        content={<pre>{willExecCmd}</pre>}
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
