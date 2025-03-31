import { ReactNode, useEffect, useState } from "react";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { subscribeKey } from "valtio/utils";
import { DEFAULT_PAGE_SIZE, HEDAER_H } from "@/constants";
import { getDefultOrderField } from "@/databases/PostgreSQL/utils/sql";
import { getTableData } from "@/databases/adapter,";
import { TableStructure } from "@/databases/types";
import { cn } from "@/lib/utils";
import { appState } from "@/store/valtio";
import { EditableTable, ListItem, TableDataChange } from "../EditableTable";
import { PaginationSection } from "../PaginationSection";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function TableEditorData() {
  const [tableData, setTableData] = useState<object[]>([]); // 表格数据
  const [fieldNames, setFieldNames] = useState<string[]>([]); // 字段名

  // 获取表格数据
  const getData = async (page: number) => {
    console.log("TableEditorData  appState.currentTableName::: ", appState.currentTableName);

    if (appState.currentTableName === "") {
      return [];
    }

    // 整理参数
    const orderBy = getDefultOrderField(appState.currentTableStructure as TableStructure[]);
    const lastRow = tableData[tableData.length - 1];
    const lastOrderByValue = lastRow ? (lastRow as any)[orderBy] : null;

    if (orderBy === "") {
      console.log("orderBy 为空字符串");
      return [];
    }

    const res = await getTableData({
      tableName: appState.currentTableName,
      sortField: orderBy,
      sortOrder: "ASC",
      currentPage: page,
      pageSize: DEFAULT_PAGE_SIZE,
      lastOrderByValue,
    });

    console.log(
      "getData::: currentTableName 的 ",
      appState.currentTableName,

      " 结果 ::  ",
      res,
    );

    if (res) {
      setFieldNames(res.columnName);
      setTableData(res.data);
      setItemsTotal(res.itemsTotal);
      setPageTotal(res.pageTotal);

      return res.data;
    }

    return [];
  };

  // ========== 分页 ==========
  const [currentPage, setCurrentPage] = useState<number>(1); // 当前页码
  const [pageTotal, setPageTotal] = useState<number>(0); // 页数
  const [itemsTotal, setItemsTotal] = useState<number>(0); // 数据总条数

  //  表格的变化
  const [changes, setChanges] = useState<TableDataChange[]>([]); // 记录所有修改的变量
  function onChange(val: TableDataChange[]) {
    setChanges(val);
    // TODO: 保存时生成语句
  }
  // ========== 分页 结束 ==========

  const [dataArr, setDataArr] = useState<ListItem[]>([]);
  function updateDataArr(data: object[]) {
    const dataArrTemp: ListItem[] = [];
    data.map((row) => {
      const wrappedObj: { [key: string]: ReactNode } = {};
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          wrappedObj[key] = <div>{(row as any)[key]}</div>;
        }
      }

      dataArrTemp.push(wrappedObj);
    });
    setDataArr(dataArrTemp);
  }

  async function initData() {
    const data = await getData(1);
    setCurrentPage(1);
    updateDataArr(data);
  }

  useEffect(() => {
    initData();

    // 监听 store 的变化
    const unsubscribe = subscribeKey(appState, "currentTableName", (_value: any) => {
      initData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {/* 按钮栏 */}
      <div className="flex flex-wrap pb-2">
        <div className={cn("gap-4 px-2 pb-2 sm:pl-2.5 inline-flex items-center justify-center ")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <RotateCw color="var(--fvm-info-clr)" onClick={() => getData(currentPage)} />
            </TooltipTrigger>
            <TooltipContent>
              <p>刷新</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CirclePlus color="var(--fvm-primary-clr)" />
            </TooltipTrigger>
            <TooltipContent>
              <p>添加行</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleMinus color="var(--fvm-danger-clr)" />
            </TooltipTrigger>
            <TooltipContent>
              <p>删除行</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleCheck color="var(--fvm-success-clr)" />
            </TooltipTrigger>
            <TooltipContent>
              <p>应用</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleX color="var(--fvm-warning-clr)" />
            </TooltipTrigger>
            <TooltipContent>
              <p>取消</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-1 justify-between">
          <PaginationSection
            currentPage={currentPage}
            setCurrentPage={(val) => setCurrentPage(val)}
            pageTotal={pageTotal}
            itemsTotal={itemsTotal}
            getData={getData}
          />
        </div>
      </div>

      {/* 主体表格 */}
      <div className="flex-1 overflow-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H * 5})` }}>
        {/* TODO: 找到主键和唯一索引, 不能写死 id */}
        <EditableTable
          fieldNames={fieldNames}
          fieldNamesUnique={["id"]}
          dataArr={dataArr}
          onChange={onChange}
          editable={true}
          multiSelect={true}
        />
      </div>
    </div>
  );
}
