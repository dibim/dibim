/**
 * 点击表格显示数据
 */
import { useEffect } from "react";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
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

  // 获取表格数据
  const getData = async () => {
    await getTableData(currentDbType, {
      tableName: currentTableName,
      orderBy: "",
      currentPage: 1,
      pageSize: 20,
    });
  };

  useEffect(() => {
    getData();
  }, []);

  const testData = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
  ];

  return (
    <>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testData.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">{invoice.totalAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
