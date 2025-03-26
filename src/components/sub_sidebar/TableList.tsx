import { useEffect, useState } from "react";
import bytes from "bytes";
import { ArrowDown01, ArrowDownAZ, ArrowDownZA, ArrowUp01, LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { MAIN_CONTEN_TYPE_TABLE_EDITOR } from "@/constants";
import { getAllTableName, getAllTableSize } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { ListWithAction, ListItem } from "../ListWithAction";
import { EmptyList } from "../EmptyList";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type TableData = {
  tableName: string;
  size: string;
  bytes: number; // size 转成的 字节大小
};

export function TableList() {
  const { setCurrentTableName, setMainContenType, currentDbType } = useCoreStore();

  const [tablData, setTableData] = useState<TableData[]>([]);

  const clickItem = (item: ListItem) => {
    setCurrentTableName(item.id);
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

  // 列表数据
  const [listData, setListData] = useState<ListItem[]>([]);

  const getData = async () => {
    // 获取表名
    const res = await getAllTableName(currentDbType);

    if (res && res.data) {
      // 获取表格大小
      const sizeRes = await getAllTableSize(currentDbType);

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
              handleRename(item.tableName);
            },
          },
          {
            label: "复制表名",
            onClick: () => {
              handleCopy(item.tableName);
            },
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
            label: "截断",
            className: "text-[var(--fvm-warning-clr)]",
            onClick: () => {
              handleDelete(item.tableName);
            },
          },
          {
            label: "删除",
            className: "text-[var(--fvm-danger-clr)]",
            onClick: () => {
              handleImport(item.tableName);
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
    useCoreStore.subscribe(() => {
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
      </div>
      {!tablData || (tablData.length === 0 && <EmptyList />)}

      {tablData.length > 0 && <ListWithAction items={listData} itemClassName="py-2 cursor-pointer" />}
    </div>
  );
}
