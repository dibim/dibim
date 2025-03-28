/**
 * 表格结构
 */
import { useState } from "react";
import { AlertCircle, CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { DIR_H, HEDAER_H, STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY } from "@/constants";
import { exec, genAlterCmd, genDeleteFieldCmd } from "@/databases/adapter,";
import { INDEX_PRIMARY_KEY, INDEX_UNIQUE } from "@/databases/constants";
import { ColumnAlterAction, TableStructure } from "@/databases/types";
import { cn } from "@/lib/utils";
import { useCoreStore } from "@/store";
import { MainContentStructure, UniqueConstraint } from "@/types/types";
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

type DialogAction = typeof STR_EMPTY | typeof STR_ADD | typeof STR_EDIT | typeof STR_DELETE;

export function TableEditorStructure(props: MainContentStructure) {
  const { currentTableStructure, currentTableName } = useCoreStore();

  const [alterData, setAlterData] = useState<ColumnAlterAction[]>([]); // 表结构的修改数据
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set()); // 选中的行
  const [operateRowIndex, setOperateRowIndex] = useState<number>(0); // 现在操作的行的索引
  const [operateFieldName, setOperateFieldName] = useState<string>(""); // 现在操作的行的索引
  const [willExecCmd, setWillExecCmd] = useState<string>(""); // 将要执行的命令(sql 语句)
  const [dialogAction, setDialogAction] = useState<DialogAction>("");
  const [showDialogEdit, setShowDialogEdit] = useState<boolean>(false);
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);
  const [showDialogAlter, setShowDialogAlter] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息
  const [okMessage, setOkMessage] = useState<string>(""); // 成功消息

  const [fieldNameEditing, setFieldNameEditing] = useState<string>(""); // 字段名, 编辑之前记录的原先的字段名
  // 对话框里的数据
  const [fieldName, setFieldName] = useState<string>(""); // 字段名, 输入框里的
  const [fieldType, setFieldType] = useState<string>(""); // 字段类型
  const [fieldSize, setFieldSize] = useState<string>(""); // 字段大小
  const [fieldDefalut, setFieldDefault] = useState<string>(""); // 字段默认值
  const [fieldNotNull, setFieldNotNull] = useState<boolean>(false); // 字段非空
  const [fieldIndexType, setFieldIndexType] = useState<UniqueConstraint>(""); // 字段索引类型
  const [fieldIndexPkAutoIncrement, setFieldIndexPkAutoIncrement] = useState<boolean>(false); // 字段主键自增
  const [fieldIndexName, setFieldIndexName] = useState<string>(""); // 字段索引名
  const [fieldComment, setFieldComment] = useState<string>(""); // 字段备注
  const [tableComment, setTableComment] = useState<string>(""); // 表备注

  function resetDialogData(caa: ColumnAlterAction | null) {
    setFieldName(caa ? caa.fieldName : "");
    setFieldType(caa ? caa.fieldType : "");
    setFieldSize(caa ? caa.fieldSize : "");
    setFieldDefault(caa && caa.fieldDefalut ? caa.fieldDefalut : "");
    setFieldNotNull(caa ? caa.fieldNotNull : false);
    setFieldIndexType(caa ? caa.fieldIndexType : "");
    setFieldIndexPkAutoIncrement(caa ? caa.fieldIndexPkAutoIncrement : false);
    setFieldIndexName(caa ? caa.fieldIndexName : "");
    setFieldComment(caa ? caa.fieldComment : "");
    setTableComment(caa ? caa.tableComment : "");
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
  function handleAddField() {
    resetDialogData(null);
    setShowDialogEdit(true);
    setDialogAction(STR_ADD);
  }

  // 删除选中的列
  function handleDelSelectedField() {
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
    const field = currentTableStructure[index];

    let fieldIndexType: UniqueConstraint = "";
    let fieldIndexName = "";
    if (field.indexes) {
      for (const idx of field.indexes) {
        if (idx.isPrimary) {
          fieldIndexType = INDEX_PRIMARY_KEY;
          fieldIndexName = idx.name;
        }

        if (idx.isUnique) {
          fieldIndexType = INDEX_UNIQUE;
          fieldIndexName = idx.name;
        }
      }
    }

    resetDialogData({
      action: STR_EDIT,
      tableName: currentTableName,
      tableComment: "", // TODO:
      fieldName: field.column_name,
      fieldNameExt: "",
      fieldType: field.data_type,
      fieldSize: `${field.size}`,
      fieldDefalut: field.column_default,
      fieldNotNull: field.is_not_null,
      fieldIndexType: fieldIndexType,
      fieldIndexPkAutoIncrement: false,
      fieldIndexName: fieldIndexName,
      fieldComment: field.comment,
    });
    setFieldNameEditing(field.column_name);
    setOperateRowIndex(index);
    setShowDialogEdit(true);
    setDialogAction(STR_EDIT);
  }

  // 复制字段名
  async function handleCopyFieldName(index: number) {
    const field = currentTableStructure[index];
    try {
      await navigator.clipboard.writeText(field.column_name);
      toast("复制成功");
    } catch (err) {
      toast("复制失败");
    }
  }

  // 复制字段类型
  async function handleCopyFieldType(index: number) {
    const field = currentTableStructure[index];
    try {
      await navigator.clipboard.writeText(field.data_type);
      toast("复制成功");
    } catch (err) {
      toast("复制失败");
    }
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
  // 确定执行语句
  function handleConfirm() {
    console.log(`执行语句:  ${willExecCmd}`);

    // FIXME: 解除注释
    // exec(willExecCmd);
    // props.getData();
  }

  // 提交变更
  async function onSubmit() {
    // 找到 alterData 里对应的字段的数据
    let actionDataFinded: ColumnAlterAction | null = null;
    let actionDataFindedIndex = -1;

    for (let index = 0; index < alterData.length; index++) {
      const ad = alterData[index];
      if (ad.fieldName === fieldName) {
        actionDataFinded = ad;
        actionDataFindedIndex = index;
      }
    }

    const actionData: ColumnAlterAction = {
      action: dialogAction,

      tableName: currentTableName,
      tableComment,

      // 如果是编辑, 要记录编辑之前的列名, 重命名的时候会用到
      // 如果是添加, 直接使用输入框里的字段名
      fieldName: dialogAction === STR_EDIT ? fieldNameEditing : fieldName,
      fieldNameExt: fieldName, // 输入框里的列名
      fieldType,
      fieldSize,
      fieldDefalut,
      fieldNotNull,
      fieldIndexType,
      fieldIndexPkAutoIncrement,
      fieldIndexName,
      fieldComment,
    };

    if (actionDataFindedIndex > -1) {
      alterData[actionDataFindedIndex] = { ...actionDataFinded, ...actionData };
    } else {
      alterData.push(actionData);
    }

    setAlterData(alterData);

    // TODO: 生成语句, 弹窗确认.  应该在点击应用的时候才进行下面的
    setWillExecCmd(genAlterCmd(alterData));
    setShowDialogAlter(true);
  }

  /**
   * 根据索引找到字段名
   * @param index
   * @returns
   */
  const findFieldName = (index: number) => {
    const tableDataPg = currentTableStructure as unknown as TableStructure[];
    if (index <= tableDataPg.length) {
      return tableDataPg[index].column_name;
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
          <ContextMenuItem onClick={() => handleCopyFieldName(index)}>复制字段名</ContextMenuItem>
          <ContextMenuItem onClick={() => handleCopyFieldType(index)}>复制类型</ContextMenuItem>
          <hr className="my-2" />
          <ContextMenuItem onClick={() => handleDeleteColPopup(index)} className={`text-[var(--fvm-danger-clr)]`}>
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const renderBody = () => {
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
  };

  return (
    <div>
      {/* 按钮栏 */}
      <div className="flex pb-2">
        <div className={cn("gap-4 px-2 pb-2 sm:pl-2.5 inline-flex items-center justify-center ")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <RotateCw color="var(--fvm-info-clr)" onClick={() => props.getData()} />
            </TooltipTrigger>
            <TooltipContent>
              <p>刷新</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CirclePlus color="var(--fvm-primary-clr)" onClick={handleAddField} />
            </TooltipTrigger>
            <TooltipContent>
              <p>添加字段</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleMinus color="var(--fvm-danger-clr)" onClick={handleDelSelectedField} />
            </TooltipTrigger>
            <TooltipContent>
              <p>删除字段</p>
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

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"字段名"}>
            <Input value={fieldName} onInput={(e) => setFieldName(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"类型"}>
            <Input value={fieldType} onInput={(e) => setFieldType(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"大小"}>
            <Input value={fieldSize} onInput={(e) => setFieldSize(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"默认值"}>
            <Input value={fieldDefalut} onInput={(e) => setFieldDefault(e.currentTarget.value)} />
            <div className="flex items-center pt-2">
              <Checkbox
                checked={fieldNotNull}
                onClick={() => setFieldNotNull(!fieldNotNull)}
                className="me-4"
                id="fieldNotNull"
              />
              <label htmlFor="fieldNotNull" className="text-sm font-medium">
                非空
              </label>
            </div>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"索引"}>
            <div className="flex gap-4">
              <div className="flex items-center">
                <Checkbox
                  checked={fieldIndexType === INDEX_PRIMARY_KEY}
                  onClick={() =>
                    setFieldIndexType(fieldIndexType === INDEX_PRIMARY_KEY ? STR_EMPTY : INDEX_PRIMARY_KEY)
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
                  onClick={() => setFieldIndexPkAutoIncrement(!fieldIndexPkAutoIncrement)}
                  className="me-4"
                  id="fieldIndexAutoIncrement"
                  disabled={!(fieldIndexType === INDEX_PRIMARY_KEY)}
                />
                <label htmlFor="fieldIndexAutoIncrement" className="text-sm font-medium">
                  主键自增
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  checked={fieldIndexType === INDEX_UNIQUE}
                  onClick={() => setFieldIndexType(fieldIndexType === INDEX_UNIQUE ? STR_EMPTY : INDEX_UNIQUE)}
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
                onInput={(e) => setFieldIndexName(e.currentTarget.value)}
                placeholder="索引名"
                disabled={fieldIndexType === STR_EMPTY}
              />
            </div>
          </LabeledDiv>
          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"备注"}>
            <Input value={fieldComment} onInput={(e) => setFieldComment(e.currentTarget.value)} />
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
            <Button type="submit" onClick={onSubmit}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认要执行的删除语句 */}
      <ConfirmDialog
        open={showDialogDelete}
        title={`确认要删除字段${operateFieldName}吗?`}
        content={
          <>
            <div className="pt-4">
              <div className="pb-4">将要执行的语句:</div>
              <pre>{willExecCmd}</pre>
            </div>
          </>
        }
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogDelete(false);
        }}
        okText={"确定"}
        okCb={handleConfirm}
      />

      {/* 确认要执行的变更语句 */}
      <ConfirmDialog
        open={showDialogAlter}
        title={`确认要保存变更吗?`}
        content={
          <>
            <div className="pt-4">
              <div className="pb-4">将要执行的语句:</div>
              <pre>{willExecCmd}</pre>
            </div>
          </>
        }
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogAlter(false);
        }}
        okText={"确定"}
        okCb={handleConfirm}
      />
    </div>
  );
}
