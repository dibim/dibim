/**
 * 表格结构
 */
import { useState } from "react";
import { AlertCircle, CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import {
  DB_TYPE_MYSQL,
  DB_TYPE_POSTGRESQL,
  DB_TYPE_SQLITE,
  DIR_H,
  HEDAER_H,
  STR_ADD,
  STR_DELETE,
  STR_EDIT,
  STR_EMPTY,
} from "@/constants";
import { exec, genDeleteFieldCmd } from "@/databases/adapter,";
import { INDEX_PRIMARY_KEY, INDEX_UNIQUE } from "@/databases/constants";
import { ColumnAlterAction, TableStructure } from "@/databases/types";
import { cn } from "@/lib/utils";
import { useCoreStore } from "@/store";
import { MainContentStructure } from "@/types/types";
import { ConfirmDialog } from "../ConfirmDialog";
import { LabeledDiv } from "../LabeledDiv";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type IndexType = typeof STR_EMPTY | typeof INDEX_PRIMARY_KEY | typeof INDEX_UNIQUE;
type DialogAction = typeof STR_EMPTY | typeof STR_ADD | typeof STR_EDIT | typeof STR_DELETE;

export function TableEditorStructure(props: MainContentStructure) {
  const { currentDbType, currentTableStructure, currentTableName } = useCoreStore();

  const [alterData, setAlterData] = useState<ColumnAlterAction[]>([]); // 表结构的修改数据
  // TODO: 实现 src/databases/PostgreSQL/alter.ts 里的功能

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set()); // 选中的行
  const [operateRowIndex, setOperateRowIndex] = useState<number>(0); // 现在操作的行的索引
  const [operateFieldName, setOperateFieldName] = useState<string>(""); // 现在操作的行的索引
  const [willExecCmd, setWillExecCmd] = useState<string>(""); // 将要执行的命令(sql 语句)
  const [dialogAction, setDialogAction] = useState<DialogAction>("");
  const [showDialogEdit, setShowDialogEdit] = useState<boolean>(false);
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息
  const [okMessage, setOkMessage] = useState<string>(""); // 成功消息

  // 对话框里的数据
  const [fieldName, setFieldName] = useState<string>(""); // 字段名
  const [fieldType, setFieldType] = useState<string>(""); // 字段类型
  const [fieldSize, setFieldSize] = useState<string>(""); // 字段大小
  const [fieldDefalut, setFieldDefault] = useState<string>(""); // 字段默认值
  const [fieldNotNull, setFieldNotNull] = useState<boolean>(false); // 字段非空
  const [fieldIndexType, setFieldIndexType] = useState<IndexType>(""); // 字段索引类型
  const [fieldIndexPkAutoIncrement, setFieldIndexPkAutoIncrement] = useState<boolean>(false); // 字段主键自增
  const [fieldIndexName, setFieldIndexName] = useState<string>(""); // 字段索引名
  const [fieldComment, setFieldComment] = useState<string>(""); // 字段备注

  const [tableComment, setTableComment] = useState<string>(""); // 表备注

  // 记录动作
  function logAction() {
    // TODO: 先找到 alterData 里对应的字段的数据

    if (dialogAction === STR_ADD) {
      //
    } else if (dialogAction === STR_EDIT) {
      //
    } else if (dialogAction === STR_DELETE) {
      //
    }

    setAlterData(alterData);
  }

  function changeFieldName(val: string) {
    // TODO: 记录动作

    setFieldName(val);
  }
  function changeFieldType(val: string) {
    //TODO: 记录动作
    setFieldType(val);
  }

  function changeFieldSize(val: string) {
    //TODO: 记录动作
    setFieldSize(val);
  }

  function changeFieldDefault(val: string) {
    //TODO: 记录动作
    setFieldDefault(val);
  }

  function changeFieldNotNull(val: boolean) {
    //TODO: 记录动作
    setFieldNotNull(val);
  }

  function changeFieldIndexType(val: IndexType) {
    //TODO: 记录动作
    setFieldIndexType(val);
  }

  function changeFieldIndexPkAutoIncrement(val: boolean) {
    //TODO: 记录动作
    setFieldIndexPkAutoIncrement(val);
  }

  function changeFieldIndexName(val: string) {
    //TODO: 记录动作
    setFieldIndexName(val);
  }

  function changeFieldComment(val: string) {
    //TODO: 记录动作
    setFieldComment(val);
  }
  function changeTableComment(val: string) {
    //TODO: 记录动作
    setTableComment(val);
  }

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

    setShowDialogEdit(true);
    setDialogAction(STR_ADD);
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
    setOperateRowIndex(index);
    setShowDialogEdit(true);
    setDialogAction(STR_EDIT);
  }
  function handleEditCol(index: number) {
    console.log("editCol");

    setOperateRowIndex(index);
    setDialogAction(STR_EMPTY);
  }

  // 弹出确认删除1列
  function handleDeleteColPopup(index: number) {
    const fieldName = findFieldName(index);
    if (fieldName !== "") {
      setOperateFieldName(fieldName);
      setShowDialogDelete(true);
      setWillExecCmd(genDeleteFieldCmd(currentTableName, fieldName) || "");
    } else {
      // TODO: 报错
    }
  }
  // 执行删除字段
  function handleDelete() {
    exec(willExecCmd);
  }

  // 提交变更
  async function onSubmit() {
    if (dialogAction === STR_ADD) {
      // TODO: 添加记录, 等电影应用按钮的时候再执行修改
    }

    if (dialogAction === STR_EDIT) {
      // TODO: 执行修改
    }
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
      const tableDataPg = currentTableStructure as unknown as TableStructure[];

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
          <ContextMenuItem onClick={() => handleDeleteColPopup(index)} className={`text-[var(--fvm-danger-clr)]`}>
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const renderBody = () => {
    if (currentDbType === DB_TYPE_MYSQL) {
      // TODO: 实现逻辑
    }

    if (currentDbType === DB_TYPE_POSTGRESQL) {
      const tableDataPg = currentTableStructure as unknown as TableStructure[];
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
              <div>{row.is_foreign_key ? "✅" : ""}</div>
            </TableCell>
            <TableCell>
              <div>{row.is_unique_key ? "✅" : ""}</div>
            </TableCell>
            <TableCell>
              <div>{row.has_check_conditions ? "✅" : ""}</div>
            </TableCell>
            <TableCell>
              <div>{row.is_not_null ? "✅" : ""}</div>
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

      <Dialog open={showDialogEdit} onOpenChange={setShowDialogEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAction === STR_ADD ? "添加" : "编辑"}字段</DialogTitle>
          </DialogHeader>

          <LabeledDiv direction={DIR_H} label={"字段名"}>
            <Input value={fieldName} onInput={(e) => changeFieldName(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"类型"}>
            <Input value={fieldType} onInput={(e) => changeFieldType(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"大小"}>
            <Input value={fieldSize} onInput={(e) => changeFieldSize(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"默认值"}>
            <Input value={fieldDefalut} onInput={(e) => changeFieldDefault(e.currentTarget.value)} />
            <div className="flex items-center pt-2">
              <Checkbox
                checked={fieldNotNull}
                onClick={() => changeFieldNotNull(!fieldNotNull)}
                className="me-4"
                id="fieldNotNull"
              />
              <label htmlFor="fieldNotNull" className="text-sm font-medium">
                非空
              </label>
            </div>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"索引"}>
            <div className="flex gap-4">
              <div className="flex items-center">
                <Checkbox
                  checked={fieldIndexType === INDEX_PRIMARY_KEY}
                  onClick={() =>
                    changeFieldIndexType(fieldIndexType === INDEX_PRIMARY_KEY ? STR_EMPTY : INDEX_PRIMARY_KEY)
                  }
                  className="me-4"
                  id="INDEX_PRIMARY_KEY"
                />
                <label htmlFor="INDEX_PRIMARY_KEY" className="text-sm font-medium">
                  主键
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  checked={fieldIndexPkAutoIncrement}
                  onClick={() => changeFieldIndexPkAutoIncrement(!fieldIndexPkAutoIncrement)}
                  className="me-4"
                  id="fieldIndexAutoIncrement"
                  disabled={fieldIndexType === STR_EMPTY}
                />
                <label htmlFor="fieldIndexAutoIncrement" className="text-sm font-medium">
                  主键自增
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  checked={fieldIndexType === INDEX_UNIQUE}
                  onClick={() => changeFieldIndexType(fieldIndexType === INDEX_UNIQUE ? STR_EMPTY : INDEX_UNIQUE)}
                  className="me-4"
                  id="INDEX_UNIQUE"
                />
                <label htmlFor="INDEX_UNIQUE" className="text-sm font-medium">
                  唯一
                </label>
              </div>
            </div>
            <div className="pt-2">
              <Input
                value={fieldIndexName}
                onInput={(e) => changeFieldIndexName(e.currentTarget.value)}
                placeholder="索引名"
                disabled={fieldIndexType === STR_EMPTY}
              />
            </div>
          </LabeledDiv>
          <LabeledDiv direction={DIR_H} label={"备注"}>
            <Input value={fieldComment} onInput={(e) => changeFieldComment(e.currentTarget.value)} />
          </LabeledDiv>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>错误提示</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {okMessage && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>提示</AlertTitle>
              <AlertDescription>{okMessage}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
