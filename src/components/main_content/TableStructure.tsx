import { useEffect, useRef, useState } from "react";
import { AlertCircle, CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { subscribeKey } from "valtio/utils";
import { DIR_H, HEDAER_H, STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY, STR_FIELD } from "@/constants";
import { exec, fieldTypeOptions, genAlterCmd } from "@/databases/adapter,";
import { AllAlterAction, FieldAlterAction, FieldStructure } from "@/databases/types";
import { cn } from "@/lib/utils";
import { appState } from "@/store/valtio";
import { ConfirmDialog } from "../ConfirmDialog";
import { DataTypeIcon } from "../DataTypeIcon";
import { EditableTable, EditableTableMethods, ListRow } from "../EditableTable";
import { LabeledDiv } from "../LabeledDiv";
import { SearchableSelect } from "../SearchableSelect";
import { SqlCodeViewer } from "../SqlCodeViewer";
import { TooltipGroup } from "../TooltipGroup";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

type DialogAction = typeof STR_EMPTY | typeof STR_ADD | typeof STR_EDIT | typeof STR_DELETE;

export type MainContentStructureProp = {
  getData: () => void;
  alterData: AllAlterAction[];
  setAlterData: (val: AllAlterAction[]) => void;
  changeTable: () => void;
  editingTableComment: string;
  setEditingTableComment: (val: string) => void;
};

export function TableEditorStructure({
  getData,
  alterData,
  setAlterData,
  changeTable,
  editingTableComment,
  setEditingTableComment,
}: MainContentStructureProp) {
  const tableRef = useRef<EditableTableMethods | null>(null);

  const [dialogAction, setDialogAction] = useState<DialogAction>("");
  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息
  const [okMessage, setOkMessage] = useState<string>(""); // 成功消息
  const [operateFieldName, setOperateFieldName] = useState<string>(""); // 现在操作的行的索引
  const [showDialogAlter, setShowDialogAlter] = useState<boolean>(false);
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);
  const [showDialogEdit, setShowDialogEdit] = useState<boolean>(false);
  const [willExecCmd, setWillExecCmd] = useState<string>(""); // 将要执行的命令(sql 语句)

  const [nameEditing, setNameEditing] = useState<string>(""); // 字段名, 编辑之前记录的原先的字段名
  const [indexEditing, setIndexEditing] = useState<number>(-1); // 字段索引, 右键菜单点击删除时临时记录
  // 对话框里的数据
  const [autoIncrement, setAutoIncrement] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [defalutValue, setDefaultValue] = useState<string>("");
  const [indexName, setIndexName] = useState<string>(""); // 字段索引名
  const [isNullable, setIsNullable] = useState<boolean>(false);
  const [isPrimaryKey, setIsPrimaryKey] = useState<boolean>(false);
  const [isUniqueKey, setIsUniqueKey] = useState<boolean>(false);
  const [name, setdName] = useState<string>(""); // 字段名, 输入框里的
  const [size, setSize] = useState<string>("");
  const [type, setType] = useState<string>("");
  // 备份原先的数据
  const [defalutValueOld, setDefaultValueOld] = useState<string>("");
  const [isNullableOld, setIsNullableOld] = useState<boolean>(false);
  const [isPrimaryKeyOld, setIsPrimaryKeyOld] = useState<boolean>(false);
  const [isUniqueKeyOld, setIsUniqueKeyOld] = useState<boolean>(false);
  const [typeOld, setTypeOld] = useState<string>("");

  function resetDialogData(faa: FieldAlterAction | null) {
    setAutoIncrement(faa?.autoIncrement || false);
    setComment(faa?.comment || "");
    setDefaultValue(faa?.defalutValue || "");
    setdName(faa?.name || "");
    setIndexName(faa?.indexName || "");
    setIsNullable(faa?.isNullable || false);
    setIsPrimaryKey(faa?.isPrimaryKey || false);
    setIsUniqueKey(faa?.isUniqueKey || false);
    setSize(faa?.size || "");
    setType(faa?.type || "");

    setDefaultValueOld(faa?.defalutValueOld || "");
    setIsNullableOld(faa?.isNullableOld || false);
    setIsPrimaryKeyOld(faa?.isPrimaryKeyOld || false);
    setIsUniqueKeyOld(faa?.isUniqueKeyOld || false);
    setTypeOld(faa?.typeOld || "");
  }

  // 点击添加字段
  function handleAddField() {
    resetDialogData(null);
    setDialogAction(STR_ADD);
    setShowDialogEdit(true);
  }

  // 删除选中的字段
  function handleDelSelectedField() {
    const arr = tableRef.current?.getMultiSelectData() || [];
    for (const index of arr) {
      const field = appState.currentTableStructure[index];

      // 创建表格时不需要记录字段的删除动作
      if (!appState.isAddingTable) {
        const action = {
          target: STR_FIELD,
          action: STR_DELETE,
          tableName: appState.currentTableName,

          comment: "",
          defalutValue: "",
          autoIncrement: false,
          indexName: "",
          isNullable: false,
          isPrimaryKey: false,
          isUniqueKey: false,
          name: field.name,
          nameExt: "",
          size: "",
          type: "",
        } as FieldAlterAction;
        alterData.push(action);
      }
    }

    tableRef.current?.deleteMultiSelectedRow();
    setAlterData(alterData);
  }

  // 点击应用按钮, 弹出确认框, 确认之后才执行
  function handleApply() {
    if (alterData.length === 0) {
      toast("请先选中要操作的字段");
      return;
    }

    setWillExecCmd(genAlterCmd(alterData));
    setShowDialogAlter(true);
  }

  // 点击取消按钮
  function handleCancel() {
    setAlterData([]);
    tableRef.current?.resettData();
  }

  // 点击编辑按钮, 弹出编辑对话框
  function handleEditFieldPopup(index: number) {
    const field = appState.currentTableStructure[index];

    let isPrimaryKey = field.isPrimaryKey;
    let isUniqueKey = field.isUniqueKey;
    let fieldIndexName = "";

    if (field.indexes) {
      for (const idx of field.indexes) {
        if (idx.columnName === field.name) {
          if (idx.isPrimaryKey) {
            isPrimaryKey = true;
            fieldIndexName = idx.indexName;
          }

          if (idx.isUniqueKey) {
            isUniqueKey = true;
            fieldIndexName = idx.indexName;
          }
        }
      }
    }

    resetDialogData({
      target: STR_FIELD,
      action: STR_EDIT,
      tableName: appState.currentTableName,

      autoIncrement: false, // FIXME: 添加支持
      comment: field.comment,
      defalutValue: field.defaultValue,
      indexName: fieldIndexName,
      isNullable: field.isNullable,
      isPrimaryKey: isPrimaryKey,
      isUniqueKey: isUniqueKey,
      name: field.name,
      nameExt: "",
      size: `${field.size}`,
      type: field.type,

      defalutValueOld: field.defaultValue,
      isNullableOld: field.isNullable,
      isPrimaryKeyOld: isPrimaryKey,
      isUniqueKeyOld: isUniqueKey,
      typeOld: field.type,
    });
    setNameEditing(field.name);
    setShowDialogEdit(true);
    setDialogAction(STR_EDIT);
  }

  // 复制字段名
  async function handleCopyFieldName(index: number) {
    const field = appState.currentTableStructure[index];
    try {
      await navigator.clipboard.writeText(field.name);
      toast("复制成功");
    } catch (err) {
      toast("复制失败");
    }
  }

  // 复制字段类型
  async function handleCopyFieldType(index: number) {
    const field = appState.currentTableStructure[index];
    try {
      await navigator.clipboard.writeText(field.type);
      toast("复制成功");
    } catch (err) {
      toast("复制失败");
    }
  }

  // 弹出确认删除字段
  function handleDeletePopup(index: number) {
    const fieldName = findFieldNameByIndex(index);
    if (fieldName !== "") {
      setOperateFieldName(fieldName);
      setShowDialogDelete(true);
      setIndexEditing(index);
    } else {
      // TODO: 报错
    }
  }

  // 确定执行语句
  function handleConfirm() {
    exec(willExecCmd);
    getData();
  }

  // 对话框提交变更
  async function onSubmit() {
    // 找到 alterData 里对应的字段的数据
    let actionDataFindedIndex = -1;

    for (let index = 0; index < alterData.length; index++) {
      const item = alterData[index];
      if (item.target === STR_FIELD) {
        const ad = item as FieldAlterAction;
        if (ad.name === name) {
          actionDataFindedIndex = index;
        }
      }
    }

    const actionData: FieldAlterAction = {
      target: STR_FIELD,
      action: dialogAction,
      tableName: appState.currentTableName,

      autoIncrement: autoIncrement,
      comment: comment,
      defalutValue: defalutValue,
      indexName: indexName,
      isNullable: isNullable,
      isPrimaryKey: isPrimaryKey,
      isUniqueKey: false,
      name: dialogAction === STR_EDIT ? nameEditing : name, // 如果是编辑, 要记录编辑之前的字段名
      nameExt: name, // 输入框里的字段名
      size: size,
      type: type,

      defalutValueOld: defalutValueOld,
      isNullableOld: isNullableOld,
      isPrimaryKeyOld: isPrimaryKeyOld,
      isUniqueKeyOld: isUniqueKeyOld,
      typeOld: typeOld,
    };

    if (actionDataFindedIndex > -1) {
      setAlterData(
        alterData.map((item, index) => (index === actionDataFindedIndex ? { ...item, ...actionData } : item)),
      );
    } else {
      setAlterData([...alterData, actionData]);

      // 添加字段的还得在前端添加表结构数据
      appState.setCurrentTableStructure([
        ...appState.currentTableStructure,
        {
          comment: comment,
          defaultValue: defalutValue,
          hasCheckConditions: false,
          isForeignKey: false,
          isNullable: isNullable,
          isPrimaryKey: isPrimaryKey,
          isUniqueKey: isUniqueKey,
          name: actionData.name,
          size: size,
          type: type,

          indexes: isPrimaryKey
            ? [
                {
                  columnName: "", // 仅显示用,留空
                  indexName: "", // 仅显示用,留空
                  indexType: "", // 仅显示用,留空
                  isPrimaryKey: isUniqueKey,
                  isUniqueKey: isPrimaryKey,
                },
              ]
            : undefined,
        },
      ]);

      updateDataArr();
    }

    setShowDialogEdit(false);
  }

  /**
   * 根据索引找到字段名
   * @param index
   * @returns
   */
  function findFieldNameByIndex(index: number) {
    const tableDataPg = appState.currentTableStructure as unknown as FieldStructure[];
    if (index <= tableDataPg.length) {
      return tableDataPg[index].name;
    }

    return "";
  }

  /**
   * 给每一行套上一个菜单
   * @param index 行的索引
   * @param node 行的节点
   * @returns
   */
  function renderRowContextMenu(index: number, node: React.ReactNode) {
    return (
      <ContextMenu key={index}>
        <ContextMenuTrigger asChild>{node}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleEditFieldPopup(index)}>编辑</ContextMenuItem>
          <ContextMenuItem onClick={() => handleCopyFieldName(index)}>复制字段名</ContextMenuItem>
          <ContextMenuItem onClick={() => handleCopyFieldType(index)}>复制类型</ContextMenuItem>
          <hr className="my-2" />
          <ContextMenuItem onClick={() => handleDeletePopup(index)} className={`text-[var(--fvm-danger-clr)]`}>
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  const fieldNames = [
    "name",
    "type",
    "isNotNull",
    "defaultValue",
    "isPrimaryKey",
    "isForeignKey",
    "isUniqueKey",
    "hasCheckConditions",
    "comment",
  ];
  const fieldNameTitle = ["字段名", "类型", "非空", "默认值", "主键", "外键", "唯一", "条件", "备注"];
  const [dataArr, setDataArr] = useState<ListRow[]>([]);

  function updateDataArr() {
    const dataArrTemp = appState.currentTableStructure.map(
      (row) =>
        ({
          name: { value: row.name, render: (val: any) => <div>{val}</div> },
          type: {
            value: row.type,
            render: (val: any) => (
              <div className="flex">
                <span className="pe-2">{DataTypeIcon(val)}</span> <span>{val}</span>{" "}
              </div>
            ),
          },
          isNotNull: { value: !(row.isNullable === true), render: (val: any) => <div>{val ? "✅" : ""}</div> },
          defaultValue: { value: row.defaultValue, render: (val: any) => <div>{val}</div> },
          isPrimaryKey: { value: row.isPrimaryKey, render: (val: any) => <div>{val ? "✅" : ""}</div> },
          isUniqueKey: { value: row.isUniqueKey, render: (val: any) => <div>{val ? "✅" : ""}</div> },
          hasCheckConditions: { value: row.hasCheckConditions, render: (val: any) => <div>{val ? "✅" : ""}</div> },
          isForeignKey: { value: row.isForeignKey, render: (val: any) => <div>{val ? "✅" : ""}</div> },

          comment: { value: row.comment, render: (val: any) => <div>{val}</div> },
        }) as ListRow,
    );

    setDataArr(dataArrTemp);
  }

  useEffect(() => {
    updateDataArr();

    // 监听 store 的变化
    const unsubscribe = subscribeKey(appState, "currentTableName", (_value: any) => {
      updateDataArr();
    });
    return () => unsubscribe();
  }, []);

  const tooltipSectionData = [
    {
      trigger: <RotateCw color="var(--fvm-info-clr)" onClick={() => getData()} />,
      content: <p>刷新</p>,
    },
    {
      trigger: <CirclePlus color="var(--fvm-primary-clr)" onClick={handleAddField} />,
      content: <p>添加字段</p>,
    },
    {
      trigger: <CircleMinus color="var(--fvm-danger-clr)" onClick={handleDelSelectedField} />,
      content: <p>删除字段</p>,
    },
    {
      trigger: <CircleCheck color="var(--fvm-success-clr)" onClick={handleApply} />,
      content: <p>应用</p>,
    },
    {
      trigger: <CircleX color="var(--fvm-warning-clr)" onClick={handleCancel} />,
      content: <p>取消</p>,
    },
  ];

  return (
    <div>
      {/* 按钮栏 */}
      <div className="flex pb-2">
        <div className={cn("gap-4 px-2 pb-2 sm:pl-2.5 inline-flex items-center justify-center ")}>
          <TooltipGroup dataArr={tooltipSectionData} />
        </div>
        <div className="flex-1">
          <Input
            defaultValue={editingTableComment}
            placeholder={"请输入表注释"}
            onChange={changeTable}
            onInput={(e) => {
              setEditingTableComment(e.currentTarget.value);
            }}
          />
        </div>
      </div>

      {/* 主体表格 */}
      <div className="flex-1 overflow-scroll" style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H * 5})` }}>
        <EditableTable
          ref={tableRef}
          editable={appState.uniqueFieldName !== ""}
          multiSelect={true}
          fieldNames={fieldNames}
          fieldNamesTitle={fieldNameTitle}
          fieldNamesUnique={[appState.uniqueFieldName]}
          dataArr={dataArr}
          onChange={() => {
            // TODO: 快捷修改字段名等
          }}
          renderRowContextMenu={renderRowContextMenu}
          height={""}
          width={""}
        />
      </div>

      <Dialog open={showDialogEdit} onOpenChange={setShowDialogEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAction === STR_ADD ? "添加" : "编辑"}字段</DialogTitle>
          </DialogHeader>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"字段名"}>
            <Input value={name} onInput={(e) => setdName(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"类型"}>
            <Input value={type} onInput={(e) => setType(e.currentTarget.value)} />
            <div className="py-1"></div>
            <SearchableSelect value={type} optionsData={fieldTypeOptions()} onChange={setType} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"大小"}>
            <Input value={size} onInput={(e) => setSize(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"默认值"}>
            <Input value={defalutValue} onInput={(e) => setDefaultValue(e.currentTarget.value)} />
            <div className="flex items-center pt-2">
              <Checkbox
                checked={!isNullable}
                onClick={() => setIsNullable(!isNullable)}
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
                  checked={isPrimaryKey}
                  onClick={() => setIsPrimaryKey(!isPrimaryKey)}
                  className="me-4"
                  id="INDEX_PRIMARY_KEY"
                />
                <label htmlFor="INDEX_PRIMARY_KEY" className="text-sm font-medium">
                  主键
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  checked={autoIncrement}
                  onClick={() => setAutoIncrement(!autoIncrement)}
                  className="me-4"
                  id="fieldIndexAutoIncrement"
                  disabled={!isPrimaryKey}
                />
                <label htmlFor="fieldIndexAutoIncrement" className="text-sm font-medium">
                  主键自增
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  checked={isUniqueKey}
                  onClick={() => setIsUniqueKey(isUniqueKey)}
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
                value={indexName}
                onInput={(e) => setIndexName(e.currentTarget.value)}
                placeholder="索引名"
                disabled={!(isPrimaryKey || isUniqueKey)}
              />
            </div>
          </LabeledDiv>
          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"备注"}>
            <Input value={comment} onInput={(e) => setComment(e.currentTarget.value)} />
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
        title={`确认要删除字段"${operateFieldName}"吗?`}
        content={<div />}
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogDelete(false);
        }}
        okText={"确定"}
        okCb={() => {
          setShowDialogDelete(false);
          tableRef.current?.deleteRow(indexEditing);
        }}
      />

      {/* 确认要执行的变更语句 */}
      <ConfirmDialog
        open={showDialogAlter}
        title={`确认要保存变更吗?`}
        description={`请确认将要执行的语句:`}
        content={<SqlCodeViewer ddl={willExecCmd} />}
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
