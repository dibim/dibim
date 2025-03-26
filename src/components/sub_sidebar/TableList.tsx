import { useEffect, useState } from "react";
import bytes from "bytes";
import { ArrowDown01, ArrowDownAZ, ArrowDownZA, ArrowUp01, LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { MAIN_CONTEN_TYPE_TABLE_EDITOR } from "@/constants";
import { getAllTableName, getAllTableSize } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { EmptyList } from "../EmptyList";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type TableData = {
  tableName: string;
  size: string;
  bytes: number; // size 转成的 字节大小
};

export function TableList() {
  const { setCurrentTableName, setMainContenType, currentDbType } = useCoreStore();

  const [tablData, setTableData] = useState<TableData[]>([]);

  const getData = async () => {
    // 获取表名
    const res = await getAllTableName(currentDbType);

    if (res && res.data) {
      // 获取表格大小
      const sizeRes = await getAllTableSize(currentDbType);

      if (sizeRes && sizeRes.data) {
        const arr: TableData[] = [];

        // 合并数据
        for (const tn of res.data.sort()) {
          for (const sr of sizeRes.data) {
            if (sr.table_name == tn) {
              arr.push({
                tableName: tn,
                size: sr.total_size,
                bytes: bytes(sr.total_size) || 0,
              });
              break;
            }
          }
        }

        setTableData(arr);
      }
    }
  };

  const clickItem = (item: string) => {
    setCurrentTableName(item);
    setMainContenType(MAIN_CONTEN_TYPE_TABLE_EDITOR);
  };

  // ========== 排序 ==========
  // 正序排序 (A-Z)
  const sortByNameAsc = () => {
    setTableData([...tablData].sort((a, b) => a.tableName.localeCompare(b.tableName)));
  };

  // 倒序排序 (Z-A)
  const sortByNameDesc = () => {
    setTableData([...tablData].sort((a, b) => b.tableName.localeCompare(a.tableName)));
  };

  // 正序排序 (小到大)
  const sortByBytesAsc = () => {
    setTableData([...tablData].sort((a, b) => a.bytes - b.bytes));
  };

  // 倒序排序 (大到小)
  const sortByBytesDesc = () => {
    setTableData([...tablData].sort((a, b) => b.bytes - a.bytes));
  };

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
  const handleRename = async (text: string) => {
    // TODO:
  };
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("复制成功");
    } catch (err) {
      toast("复制失败");
    }
  };
  const handleImport = async (text: string) => {
    // TODO:
  };
  const handleExport = async (text: string) => {
    // TODO:
  };
  const handleTruncate = async (text: string) => {
    // TODO:
  };
  const handleDelete = async (text: string) => {
    // TODO:
  };
  // ========== 上下文按钮功能 结束 ==========

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="flex justify-between pb-2">
        {renderSortBtn(sortByNameAsc, ArrowDownAZ, "按表名正序排序")}
        {renderSortBtn(sortByNameDesc, ArrowDownZA, "按表名倒序排序")}
        {renderSortBtn(sortByBytesAsc, ArrowDown01, "按表格大小正序排序")}
        {renderSortBtn(sortByBytesDesc, ArrowUp01, "按表格大小倒序排序")}
      </div>
      {!tablData || (tablData.length === 0 && <EmptyList />)}

      {tablData.map((item, index) => (
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className="py-1 cursor-pointer flex justify-between items-center"
              key={index}
              onClick={() => {
                clickItem(item.tableName);
              }}
            >
              {/* 表名部分 - 占用剩余空间，不换行，超出显示省略号 */}
              <div className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title={item.tableName}>
                {item.tableName}
              </div>

              {/* 大小部分 - 不收缩，优先显示 */}
              <div className="flex-shrink-0 bg-muted">{item.size}</div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => {
                handleRename(item.tableName);
              }}
            >
              重命名
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                handleCopy(item.tableName);
              }}
            >
              复制表名
            </ContextMenuItem>
            <hr />
            <ContextMenuItem
              onClick={() => {
                handleImport(item.tableName);
              }}
            >
              导入
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                handleExport(item.tableName);
              }}
            >
              导出
            </ContextMenuItem>
            <hr />
            <ContextMenuItem
              className="text-[var(--fvm-warning-clr)]"
              onClick={() => {
                handleTruncate(item.tableName);
              }}
            >
              截断
            </ContextMenuItem>
            <ContextMenuItem
              className="text-[var(--fvm-danger-clr)]"
              onClick={() => {
                handleDelete(item.tableName);
              }}
            >
              删除
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  );
}
