/**
 * 表格结构
 */
import { useState } from "react";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { DB_TYPE_MY_SQL, DB_TYPE_POSTGRES_SQL, DB_TYPE_SQLITE, HEDAER_H } from "@/constants";
import { AlterActionData } from "@/databases/PostgreSQL/alter";
import { TableStructurePostgresql } from "@/databases/PostgreSQL/types";
import { cn } from "@/lib/utils";
import { useCoreStore } from "@/store";
import { MainContentStructure } from "@/types/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function TableEditorStructure(props: MainContentStructure) {
  const { currentDbType, currentTableStructure } = useCoreStore();

  const [alterData, setAlterData] = useState<AlterActionData[]>([]); // 表结构的修改数据
  // TODO: 实现 src/databases/PostgreSQL/alter.ts 里的功能

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const handleRowClick = (id: number) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  const renderBody = () => {
    if (currentDbType === DB_TYPE_MY_SQL) {
      // TODO: 实现逻辑
    }

    if (currentDbType === DB_TYPE_POSTGRES_SQL) {
      const tableDataPg = currentTableStructure as unknown as TableStructurePostgresql[];
      return tableDataPg.map((row, index) => (
        <>
          <TableRow
            onClick={() => handleRowClick(index)}
            style={{
              color: selectedRows.has(index) ? "var(--fvm-primary-clr)" : "",
              cursor: "pointer",
            }}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>{row.column_name}</TableCell>
            <TableCell>{row.data_type}</TableCell>
            <TableCell>{row.is_primary_key ? "✅" : ""}</TableCell>
            <TableCell>{row.has_foreign_key ? "✅" : ""}</TableCell>
            <TableCell>{row.is_unique ? "✅" : ""}</TableCell>
            <TableCell>{row.has_check_conditions ? "✅" : ""}</TableCell>
            <TableCell>{row.is_nullable === "YES" ? "✅" : ""}</TableCell>
            <TableCell>{row.column_default}</TableCell>
            <TableCell>{row.comment}</TableCell>
          </TableRow>
        </>
      ));
    }

    if (currentDbType === DB_TYPE_SQLITE) {
      // TODO: 实现逻辑
    }

    return <></>;
  };

  return (
    <div>
      {/* 按钮栏 */}
      <div className="flex pb-2">
        <div className={cn("gap-4 px-2 pb-2 sm:pl-2.5 inline-flex items-center justify-center ")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <RotateCw color="var(--fvm-info-clr)" onClick={() => props.getStructure()} />
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
              <p>添加列</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleMinus color="var(--fvm-danger-clr)" />
            </TooltipTrigger>
            <TooltipContent>
              <p>删除列</p>
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
      </div>

      {/* 主体表格 */}
      <div className="flex-1 overflow-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H * 5})` }}>
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>列名</TableHead>
              <TableHead>数据类型</TableHead>
              <TableHead>主键</TableHead>
              <TableHead>外键</TableHead>
              <TableHead>唯一</TableHead>
              <TableHead>条件</TableHead>
              <TableHead>非空</TableHead>
              <TableHead>默认值</TableHead>
              <TableHead>备注</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderBody()}</TableBody>
        </Table>
      </div>
    </div>
  );
}
