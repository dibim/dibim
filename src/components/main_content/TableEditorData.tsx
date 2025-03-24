/**
 * 点击表格显示数据
 */
import { useEffect, useState } from "react";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { HEDAER_H } from "@/constants";
import { getTableData } from "@/databases/adapter,";
import { cn } from "@/lib/utils";
import { useCoreStore } from "@/store";
import { MainContentData } from "@/types/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/x_pagination";

export function TableEditorData(props: MainContentData) {
  const { currentDbType, currentTableName } = useCoreStore();
  const [tableData, setTableData] = useState<any[]>([]); // 表格数据
  const [colNames, setColNames] = useState<string[]>([]); // 列名

  const [currentPage, setCurrentPage] = useState<number>(1); // 当前页码
  const [pageSize, setPageSize] = useState<number>(100); // 页面大小
  const [pageTotal, setPageTotal] = useState<number>(0); // 页数
  const [itemsTotal, setItemsTotal] = useState<number>(0); // 数据总条数

  // 获取表格数据
  const getData = async (page: number) => {
    const res = await getTableData(currentDbType, {
      tableName: currentTableName,
      orderBy: "",
      currentPage: page,
      pageSize: pageSize,
    });

    if (res) {
      setTableData(res.data);
      setItemsTotal(res.itemsTotal);
      setPageTotal(res.pageTotal);

      const firstRow = res.data[0];
      const names: string[] = [];
      for (const key in firstRow) {
        names.push(key);
      }

      setColNames(names);
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

  useEffect(() => {
    getData(currentPage);
  }, [currentTableName]);

  useEffect(() => {
    getData(currentPage);
  }, []);

  const renderRow = (row: { [key: string]: any }) => {
    return colNames.map((colName) => <TableCell className="font-medium">{row[colName]}</TableCell>);
  };

  return (
    <div>
      {/* 按钮栏 */}
      <div className="flex">
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
        <Pagination className="justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationFirst href="#" text={""} onClick={() => firstPage()} />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious href="#" text={""} onClick={() => prevPage()} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" text={""} onClick={() => nextPage()} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast href="#" text={""} onClick={() => lastPage()} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* 主体表格 */}
      <div className="flex-1 overflow-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H * 5})` }}>
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              {colNames.map((colName) => (
                <TableHead>{colName}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((item) => (
              <TableRow key={item.invoice}>{renderRow(item)}</TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
