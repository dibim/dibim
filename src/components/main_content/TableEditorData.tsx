/**
 * 点击表格显示数据
 */
import { useEffect, useState } from "react";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, CornerDownLeft, RotateCw } from "lucide-react";
import { HEDAER_H } from "@/constants";
import { getDefultOrderField } from "@/databases/PostgreSQL/utils";
import { getTableData } from "@/databases/adapter,";
import { cn } from "@/lib/utils";
import { useCoreStore } from "@/store";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "../ui/x_pagination";

export function TableEditorData() {
  const { currentDbType, currentTableName, currentTableStructure } = useCoreStore();
  const [tableData, setTableData] = useState<any[]>([]); // 表格数据
  const [colNames, setColNames] = useState<string[]>([]); // 列名

  const [currentPage, setCurrentPage] = useState<number>(1); // 当前页码
  const [pageSize, setPageSize] = useState<number>(100); // 页面大小
  const [pageTotal, setPageTotal] = useState<number>(0); // 页数
  const [itemsTotal, setItemsTotal] = useState<number>(0); // 数据总条数
  const [inputedPage, setInputedPage] = useState<number>(1); // 输入的页码

  // 获取表格数据
  const getData = async (page: number) => {
    if (currentTableName === "") {
      return;
    }

    // 整理字段名
    setColNames(currentTableStructure.map((f) => f.column_name));

    // 整理参数
    const orderBy = getDefultOrderField(currentTableStructure);
    const lastRow = tableData[tableData.length - 1];
    const lastOrderByValue = lastRow ? lastRow[orderBy] : null;

    if (orderBy === "") {
      console.log("orderBy 为空字符串");
      return;
    }

    const res = await getTableData(currentDbType, {
      tableName: currentTableName,
      sortField: orderBy,
      sortOrder: "ASC",
      currentPage: page,
      pageSize: pageSize,
      lastOrderByValue,
    });

    if (res) {
      setTableData(res.data);
      setItemsTotal(res.itemsTotal);
      setPageTotal(res.pageTotal);
    }
  };

  // 第一页
  const firstPage = () => {
    let page = 1;
    getData(page);
    setCurrentPage(page);
  };
  // 最后一页
  const lastPage = () => {
    let page = pageTotal;
    getData(page);
    setCurrentPage(page);
  };
  // 上一页
  const prevPage = () => {
    let page = currentPage - 1;
    if (page > 0) {
      getData(page);
      setCurrentPage(page);
    }
  };
  // 下一页
  const nextPage = () => {
    let page = currentPage + 1;
    if (page <= pageTotal) {
      getData(page);
      setCurrentPage(page);
    }
  };
  // 跳转到指定的页码
  const goToPage = () => {
    let page = inputedPage;
    if (page <= 0) page = 1;
    if (page > pageTotal) page = pageTotal;

    getData(page);
    setCurrentPage(page);
  };

  // 输入框里的页面跟随当前页码变化
  useEffect(() => {
    setInputedPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    getData(currentPage);
  }, [currentTableName]);

  useEffect(() => {
    getData(currentPage);

    // TODO: 为了编译不报错
    setPageSize(100);
  }, []);

  const renderRow = (row: { [key: string]: any }, indexRow: number) => {
    return colNames.map((colName, indexCell) => (
      <TableCell className="font-medium" key={`r${indexRow}|c${indexCell}`}>
        {row[colName]}
      </TableCell>
    ));
  };

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
          <Pagination className="flex-1 justify-start px-8">
            <PaginationContent>
              <PaginationItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PaginationFirst className="!px-1" href="#" text={""} onClick={() => firstPage()} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>第一页</p>
                  </TooltipContent>
                </Tooltip>
              </PaginationItem>
              <PaginationItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PaginationPrevious className="!px-1" href="#" text={""} onClick={() => prevPage()} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>上一页</p>
                  </TooltipContent>
                </Tooltip>
              </PaginationItem>
              <PaginationItem className="flex">
                <div className="pe-2 w-20">
                  <Input
                    value={inputedPage}
                    onChange={(e) => {
                      try {
                        setInputedPage(parseInt(e.target.value));
                      } catch (error) {
                        console.log("解析要跳转额页码出错: ", error);
                      }
                    }}
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center pe-4">
                      <CornerDownLeft onClick={goToPage} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>跳转到第{inputedPage}页</p>
                  </TooltipContent>
                </Tooltip>
              </PaginationItem>
              <PaginationItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PaginationNext className="!px-1" href="#" text={""} onClick={() => nextPage()} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>下一页</p>
                  </TooltipContent>
                </Tooltip>
              </PaginationItem>
              <PaginationItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PaginationLast className="!px-1" href="#" text={""} onClick={() => lastPage()} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>最后一页</p>
                  </TooltipContent>
                </Tooltip>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="ppp">
            {currentPage} / {pageTotal} <strong>页</strong> {itemsTotal} <strong>行</strong>
          </div>
        </div>
      </div>

      {/* 主体表格 */}
      <div className="flex-1 overflow-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H * 5})` }}>
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              {colNames.map((colName, index) => (
                <TableHead key={`h${index}`}>{colName}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((item, index) => (
              <TableRow key={`r${index}`}>{renderRow(item, index)}</TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
