import { useEffect, useRef, useState } from "react";
import { AlertCircle, CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { subscribeKey } from "valtio/utils";
import { DIR_H, HEDAER_H, STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY, STR_FIELD } from "@/constants";
import { exec, fieldTypeOptions, genAlterCmd, genDeleteFieldCmd } from "@/databases/adapter,";
import { INDEX_PRIMARY_KEY, INDEX_UNIQUE } from "@/databases/constants";
import { AllAlterAction, FieldAlterAction, FieldStructure } from "@/databases/types";
import { cn } from "@/lib/utils";
import { appState } from "@/store/valtio";
import { UniqueConstraint } from "@/types/types";
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

  const [operateFieldName, setOperateFieldName] = useState<string>(""); // 现在操作的行的索引
  const [willExecCmd, setWillExecCmd] = useState<string>(""); // 将要执行的命令(sql 语句)
  const [dialogAction, setDialogAction] = useState<DialogAction>("");
  const [showDialogEdit, setShowDialogEdit] = useState<boolean>(false);
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);
  const [showDialogAlter, setShowDialogAlter] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息
  const [okMessage, setOkMessage] = useState<string>(""); // 成功消息

  const [fieldNameEditing, setFieldNameEditing] = useState<string>(""); // 字段名, 编辑之前记录的原先的字段名
  const [fieldIndexEditing, setFieldIndexEditing] = useState<number>(-1); // 字段索引, 右键菜单点击删除时临时记录
  // 对话框里的数据
  const [fieldComment, setFieldComment] = useState<string>(""); // 字段备注
  const [fieldDefalut, setFieldDefault] = useState<string>(""); // 字段默认值
  const [fieldIndexName, setFieldIndexName] = useState<string>(""); // 字段索引名
  const [fieldIndexPkAutoIncrement, setFieldIndexPkAutoIncrement] = useState<boolean>(false); // 字段主键自增
  const [fieldIndexType, setFieldIndexType] = useState<UniqueConstraint>(""); // 字段索引类型
  const [fieldName, setFieldName] = useState<string>(""); // 字段名, 输入框里的
  const [fieldNotNull, setFieldNotNull] = useState<boolean>(false); // 字段非空
  const [fieldSize, setFieldSize] = useState<string>(""); // 字段大小
  const [fieldType, setFieldType] = useState<string>(""); // 字段类型
  // 备份原先的数据
  const [fieldDefalutOld, setFieldDefaultOld] = useState<string>(""); // 字段默认值
  const [fieldIndexTypeOld, setFieldIndexTypeOld] = useState<UniqueConstraint>(""); // 字段索引类型
  const [fieldNotNullOld, setFieldNotNullOld] = useState<boolean>(false); // 字段类型
  const [fieldTypeOld, setFieldTypeOld] = useState<string>(""); // 字段类型

  function resetDialogData(faa: FieldAlterAction | null) {
    setFieldComment(faa?.fieldComment || "");
    setFieldDefault(faa?.fieldDefalut || "");
    setFieldIndexName(faa?.fieldIndexName || "");
    setFieldIndexPkAutoIncrement(faa?.fieldIndexPkAutoIncrement || false);
    setFieldIndexType(faa?.fieldIndexType || "");
    setFieldName(faa?.fieldName || "");
    setFieldNotNull(faa?.fieldIsNullable || false);
    setFieldSize(faa?.fieldSize || "");
    setFieldType(faa?.fieldType || "");

    setFieldDefaultOld(faa?.fieldDefalutOld || "");
    setFieldIndexTypeOld(faa?.fieldIndexTypeOld || "");
    setFieldNotNullOld(faa?.fieldNotNullOld || false);
    setFieldTypeOld(faa?.fieldTypeOld || "");
  }

  // 点击添加字段
  function handleAddField() {
    resetDialogData(null);
    setShowDialogEdit(true);
    setDialogAction(STR_ADD);
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

          fieldName: field.name,
          fieldNameExt: "",
          fieldType: "",
          fieldSize: "",
          fieldDefalut: "",
          fieldIsNullable: false,
          fieldIndexType: "",
          fieldIndexPkAutoIncrement: false,
          fieldIndexName: "",
          fieldComment: "",
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
    tableRef.current?.resetMultiSelectData();
  }

  // 点击编辑按钮, 弹出编辑对话框
  function handleEditFieldPopup(index: number) {
    const field = appState.currentTableStructure[index];

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
      target: STR_FIELD,
      action: STR_EDIT,
      tableName: appState.currentTableName,

      fieldComment: field.comment,
      fieldDefalut: field.defaultValue,
      fieldIndexName: fieldIndexName,
      fieldIndexPkAutoIncrement: false,
      fieldIndexType: fieldIndexType,
      fieldName: field.name,
      fieldNameExt: "",
      fieldIsNullable: field.isNullable,
      fieldSize: `${field.size}`,
      fieldType: field.type,

      fieldDefalutOld: field.defaultValue,
      fieldIndexTypeOld: fieldIndexType,
      fieldNotNullOld: field.isNullable,
      fieldTypeOld: field.type,
    });
    setFieldNameEditing(field.name);
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
      setFieldIndexEditing(index);
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
        if (ad.fieldName === fieldName) {
          actionDataFindedIndex = index;
        }
      }
    }

    const actionData: FieldAlterAction = {
      target: STR_FIELD,
      action: dialogAction,
      tableName: appState.currentTableName,

      fieldComment,
      fieldDefalut,
      fieldIndexName,
      fieldIndexPkAutoIncrement,
      fieldIndexType,
      fieldName: dialogAction === STR_EDIT ? fieldNameEditing : fieldName, // 如果是编辑, 要记录编辑之前的字段名
      fieldNameExt: fieldName, // 输入框里的字段名
      fieldIsNullable: fieldNotNull,
      fieldSize,
      fieldType,

      fieldDefalutOld,
      fieldIndexTypeOld,
      fieldNotNullOld,
      fieldTypeOld,
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
          defaultValue: fieldDefalut,
          name: actionData.fieldName,
          comment: fieldComment,
          type: fieldType,
          hasCheckConditions: false,
          isForeignKey: false,
          isNullable: fieldNotNull,
          isPrimaryKey: fieldIndexType === INDEX_PRIMARY_KEY,
          isUniqueKey: fieldIndexType === INDEX_UNIQUE,
          size: fieldSize,

          indexes: fieldIndexType
            ? [
                {
                  name: "",
                  type: fieldIndexType,
                  isUnique: fieldIndexType === INDEX_UNIQUE,
                  isPrimary: fieldIndexType === INDEX_PRIMARY_KEY,
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
    "columnName",
    "dataType",
    "isPrimaryKey",
    "isForeignKey",
    "isUniqueKey",
    "hasCheckConditions",
    "isNotNull",
    "defaultValue",
    "comment",
  ];
  const fieldNameTitle = ["字段名", "类型", "主键", "外键", "唯一", "条件", "非空", "默认值", "备注"];
  const [dataArr, setDataArr] = useState<ListRow[]>([]);

  function updateDataArr() {
    const dataArrTemp = appState.currentTableStructure.map(
      (row) =>
        ({
          columnName: { value: row.name, render: (val: any) => <div>{val}</div> },
          dataType: {
            value: row.type,
            render: (val: any) => (
              <div className="flex">
                <span className="pe-2">{DataTypeIcon(val)}</span>
                <span>{val}</span>
              </div>
            ),
          },
          isPrimaryKey: { value: row.isPrimaryKey, render: (val: any) => <div>{val ? "✅" : ""}</div> },
          isForeignKey: { value: row.isForeignKey, render: (val: any) => <div>{val ? "✅" : ""}</div> },
          isUniqueKey: { value: row.isUniqueKey, render: (val: any) => <div>{val ? "✅" : ""}</div> },
          hasCheckConditions: { value: row.hasCheckConditions, render: (val: any) => <div>{val ? "✅" : ""}</div> },
          isNotNull: { value: !row.isNullable, render: (val: any) => <div>{val ? "✅" : ""}</div> },
          defaultValue: { value: row.defaultValue, render: (val: any) => <div>{val}</div> },
          comment: { value: row.comment, render: (val: any) => <div className="w-full">{val}</div> },
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
            <Input value={fieldName} onInput={(e) => setFieldName(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={"类型"}>
            <Input value={fieldType} onInput={(e) => setFieldType(e.currentTarget.value)} />
            <div className="py-1"></div>
            <SearchableSelect value={fieldType} optionsData={fieldTypeOptions()} onChange={setFieldType} />
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
        title={`确认要删除字段"${operateFieldName}"吗?`}
        content={<div />}
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogDelete(false);
        }}
        okText={"确定"}
        okCb={() => {
          setShowDialogDelete(false);
          tableRef.current?.deleteRow(fieldIndexEditing);
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
