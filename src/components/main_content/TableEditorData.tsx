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

  // 获取表格数据
  const getData = async () => {
    const res = await getTableData(currentDbType, {
      tableName: currentTableName,
      orderBy: "",
      currentPage: 1,
      pageSize: 20,
    });

    if (res && res.data) {
      setTableData(res.data);

      const firstRow = res.data[0];
      const names: string[] = [];
      for (const key in firstRow) {
        names.push(key);
      }

      setColNames(names);
    }
  };

  useEffect(() => {
    getData();
  }, [currentTableName]);

  useEffect(() => {
    getData();
  }, []);

  const renderRow = (row: { [key: string]: any }) => {
    return colNames.map((colName) => <TableCell className="font-medium">{row[colName]}</TableCell>);
  };

  return (
    <div className="relative">
      {/* 按钮栏 */}
      <div className="flex">
        <div className={cn("gap-4 px-2.5 sm:pl-2.5 inline-flex items-center justify-center ")}>
          {/* 刷新 */}
          <RotateCw color="var(--fvm-info-clr)" />
          {/* 添加行 */}
          <CirclePlus color="var(--fvm-primary-clr)" />
          {/* 删除行 */}
          <CircleMinus color="var(--fvm-danger-clr)" />
          {/* 应用 */}
          <CircleCheck color="var(--fvm-success-clr)" />
          {/* 取消 */}
          <CircleX color="var(--fvm-warning-clr)" />
        </div>
        <Pagination className="justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationFirst href="#" text={""} />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious href="#" text={""} />
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
              <PaginationNext href="#" text={""} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast href="#" text={""} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* 主体表格 */}
      <div className="flex-1 overflow-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H * 5})` }}>
        <Table>
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
