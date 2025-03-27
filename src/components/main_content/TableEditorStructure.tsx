/**
 * 表格结构
 */
import { useState } from "react";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { DB_TYPE_MYSQL, DB_TYPE_POSTGRESQL, DB_TYPE_SQLITE, HEDAER_H } from "@/constants";
import { AlterActionData } from "@/databases/PostgreSQL/alter";
import { TableStructurePostgresql } from "@/databases/PostgreSQL/types";
import { exec, genDeleteFieldCmd } from "@/databases/adapter,";
import { cn } from "@/lib/utils";
import { useCoreStore } from "@/store";
import { MainContentStructure } from "@/types/types";
import { ConfirmDialog } from "../ConfirmDialog";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function TableEditorStructure(props: MainContentStructure) {
  const { currentDbType, currentTableStructure, currentTableName } = useCoreStore();

  const [alterData, setAlterData] = useState<AlterActionData[]>([]); // 表结构的修改数据
  // TODO: 实现 src/databases/PostgreSQL/alter.ts 里的功能

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set()); // 选中的行
  const [operateRowIndex, setOperateRowIndex] = useState<number>(0); // 现在操作的行的索引
  const [operateFieldName, setOperateFieldName] = useState<string>(""); // 现在操作的行的索引
  const [willExecCmd, setWillExecCmd] = useState<string>(""); // 将要执行的命令(sql 语句)
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);

  // 选中行, 删除的时候使用
  const handleSelectRow = (id: number) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  // 添加列
  function handleAddCol() {
    console.log("添加列");
  }

  // 删除选中的列
  function handleDelSelectedCol() {
    console.log("删除列");
  }

  // 应用
  function handleApply() {
    console.log("应用");
  }

  // 取消
  function handleCancel() {
    console.log("取消");
  }

  // 弹出确认编辑列
  function handleEditColPopup(index: number) {
    console.log("editCol");

    setOperateRowIndex(index);
  }
  function handleEditCol(index: number) {
    console.log("editCol");

    setOperateRowIndex(index);
  }

  // 弹出确认删除1列
  function handleDeleteColPopup(index: number) {
    const fieldName = findFieldName(index);

    console.log("fieldName:: ", fieldName, index, currentDbType);

    if (fieldName !== "") {
      setOperateFieldName(fieldName);
      setShowDialogDelete(true);
      setWillExecCmd(genDeleteFieldCmd(currentDbType, currentTableName, fieldName) || "");
    } else {
      // TODO: 报错
    }
  }
  // 执行删除字段
  function handleDelete() {
    exec(currentDbType, willExecCmd);
  }

  /**
   * 根据索引找到字段名
   * @param index
   * @returns
   */
  const findFieldName = (index: number) => {
    if (currentDbType === DB_TYPE_MYSQL) {
      // TODO: 实现逻辑
    }

    if (currentDbType === DB_TYPE_POSTGRESQL) {
      const tableDataPg = currentTableStructure as unknown as TableStructurePostgresql[];

      console.log("tableDataPg.length:: ", tableDataPg.length);

      if (index <= tableDataPg.length) {
        return tableDataPg[index].column_name;
      }
    }

    return "";
  };

  /**
   * 给每一行套上一个菜单
   * @param index 行的索引
   * @param node 行的节点
   * @returns
   */
  const renderContextMenu = (index: number, node: React.ReactNode) => {
    return (
      <ContextMenu key={index}>
        <ContextMenuTrigger asChild>{node}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleEditColPopup(index)}>编辑</ContextMenuItem>
          <ContextMenuItem onClick={() => handleDeleteColPopup(index)}>删除</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const renderBody = () => {
    if (currentDbType === DB_TYPE_MYSQL) {
      // TODO: 实现逻辑
    }

    if (currentDbType === DB_TYPE_POSTGRESQL) {
      const tableDataPg = currentTableStructure as unknown as TableStructurePostgresql[];
      return tableDataPg.map((row, index) =>
        renderContextMenu(
          index,
          <TableRow className={`${selectedRows.has(index) ? "text-[var(--fvm-primary-clr)] font-bold" : ""}`}>
            <TableCell
              className="cursor-grab"
              onClick={() => {
                handleSelectRow(index);
              }}
            >
              <div>{index + 1}</div>
            </TableCell>
            <TableCell>
              <div>{row.column_name}</div>
            </TableCell>
            <TableCell>
              <div>{row.data_type}</div>
            </TableCell>
            <TableCell>
              <div>{row.is_primary_key ? "✅" : ""}</div>
            </TableCell>
            <TableCell>
              <div>{row.has_foreign_key ? "✅" : ""}</div>
            </TableCell>
            <TableCell>
              <div>{row.is_unique ? "✅" : ""}</div>
            </TableCell>
            <TableCell>
              <div>{row.has_check_conditions ? "✅" : ""}</div>
            </TableCell>
            <TableCell>
              <div>{row.is_nullable === "YES" ? "✅" : ""}</div>
            </TableCell>
            <TableCell>
              <div>{row.column_default}</div>
            </TableCell>
            <TableCell>
              <div className="w-full">{row.comment}</div>
            </TableCell>
          </TableRow>,
        ),
      );
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
              <CirclePlus color="var(--fvm-primary-clr)" onClick={handleAddCol} />
            </TooltipTrigger>
            <TooltipContent>
              <p>添加列</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleMinus color="var(--fvm-danger-clr)" onClick={handleDelSelectedCol} />
            </TooltipTrigger>
            <TooltipContent>
              <p>删除列</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleCheck color="var(--fvm-success-clr)" onClick={handleApply} />
            </TooltipTrigger>
            <TooltipContent>
              <p>应用</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleX color="var(--fvm-warning-clr)" onClick={handleCancel} />
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

      <ConfirmDialog
        open={showDialogDelete}
        title={`确认要删除字段${operateFieldName}吗?`}
        content={
          <>
            <div className="pt-4">
              <div className="pb-4">将要执行的语句:</div>
              <div>{willExecCmd}</div>
            </div>
          </>
        }
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogDelete(false);
        }}
        okText={"确定"}
        okCb={handleDelete}
      />
    </div>
  );
}
