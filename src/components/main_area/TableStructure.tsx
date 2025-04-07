import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { subscribeKey } from "valtio/utils";
import { DIR_H, HEDAER_H, STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY, STR_FIELD } from "@/constants";
import { exec, fieldTypeOptions, genAlterCmd } from "@/databases/adapter,";
import { AllAlterAction, AlterAction, FieldAlterAction } from "@/databases/types";
import { cn } from "@/lib/utils";
import { appState } from "@/store/valtio";
import { ConfirmDialog } from "../ConfirmDialog";
import { DataTypeIcon } from "../DataTypeIcon";
import { EditableTable, EditableTableMethods, ListRow } from "../EditableTable";
import { LabeledDiv } from "../LabeledDiv";
import { SearchableSelect } from "../SearchableSelect";
import { SqlCodeViewer } from "../SqlCodeViewer";
import { TextNotification } from "../TextNotification";
import { TooltipGroup } from "../TooltipGroup";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

type DialogAction = typeof STR_EMPTY | typeof STR_ADD | typeof STR_EDIT | typeof STR_DELETE;

export type TableEditorStructureProps = {
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
}: TableEditorStructureProps) {
  const { t } = useTranslation();
  const tableRef = useRef<EditableTableMethods | null>(null);

  // ========== 对话框 ==========

  // 提示对话框
  const [dialogAction, setDialogAction] = useState<DialogAction>("");
  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息
  const [okMessage, setOkMessage] = useState<string>(""); // 成功消息
  const [showDialogAlter, setShowDialogAlter] = useState<boolean>(false);
  const [showDialogEdit, setShowDialogEdit] = useState<boolean>(false);
  const [willExecCmd, setWillExecCmd] = useState<string>(""); // 将要执行的命令(sql 语句)

  // 字段编辑对话框里的数据
  const [autoIncrement, setAutoIncrement] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [defalutValue, setDefaultValue] = useState<string>("");
  const [indexName, setIndexName] = useState<string>(""); // 字段索引名
  const [isNullable, setIsNullable] = useState<boolean>(false);
  const [isPrimaryKey, setIsPrimaryKey] = useState<boolean>(false);
  const [isUniqueKey, setIsUniqueKey] = useState<boolean>(false);
  const [name, setName] = useState<string>(""); // 字段名, 输入框里的
  const [size, setSize] = useState<string>("");
  const [type, setType] = useState<string>("");
  // 备份原先的数据
  const [autoIncrementOld, setAutoIncrementOld] = useState<boolean>(false);
  const [commentOld, setCommentOld] = useState<string>("");
  const [defalutValueOld, setDefaultValueOld] = useState<string>("");
  const [indexNameOld, setIndexNameOld] = useState<string>(""); // 字段索引名
  const [isNullableOld, setIsNullableOld] = useState<boolean>(false);
  const [isPrimaryKeyOld, setIsPrimaryKeyOld] = useState<boolean>(false);
  const [isUniqueKeyOld, setIsUniqueKeyOld] = useState<boolean>(false);
  const [nameOld, setNameOld] = useState<string>(""); // 字段名, 编辑之前记录的原先的字段名
  const [sizeOld, setSizeOld] = useState<string>("");
  const [typeOld, setTypeOld] = useState<string>("");

  function resetDialogData(faa: FieldAlterAction | null) {
    setAutoIncrement(faa?.autoIncrement || false);
    setComment(faa?.comment || "");
    setDefaultValue(faa?.defaultValue || "");
    setName(faa?.name || "");
    setIndexName(faa?.indexName || "");
    setIsNullable(faa?.isNullable || false);
    setIsPrimaryKey(faa?.isPrimaryKey || false);
    setIsUniqueKey(faa?.isUniqueKey || false);
    setSize(faa?.size || "");
    setType(faa?.type || "");
    // 备份原先的数据
    setAutoIncrementOld(faa?.autoIncrement || false);
    setCommentOld(faa?.comment || "");
    setDefaultValueOld(faa?.defaultValue || "");
    setIndexNameOld(faa?.indexName || "");
    setIsNullableOld(faa?.isNullable || false);
    setIsPrimaryKeyOld(faa?.isPrimaryKey || false);
    setIsUniqueKeyOld(faa?.isUniqueKey || false);
    setSizeOld(faa?.size || "");
    setNameOld(faa?.name || "");
    setTypeOld(faa?.type || "");
  }

  // 找到 alterData 里对应的字段的数据
  function getActionDataIndex() {
    let actionDataIndex = -1;

    for (let index = 0; index < alterData.length; index++) {
      const item = alterData[index];
      if (item.target === STR_FIELD) {
        const ad = item as FieldAlterAction;
        if (ad.name === name) {
          actionDataIndex = index;
        }
      }
    }

    return actionDataIndex;
  }

  function genActionData(action: AlterAction): FieldAlterAction {
    return {
      target: STR_FIELD,
      action,
      tableName: appState.currentTableName,

      autoIncrement: autoIncrement,
      comment: comment,
      defaultValue: defalutValue,
      indexName: indexName,
      isNullable: isNullable,
      isPrimaryKey: isPrimaryKey,
      isUniqueKey: false,
      name: dialogAction === STR_ADD ? name : nameOld, // 添加时, 使用新 name
      nameNew: name, // 重命名时使用新 name
      size: size,
      type: type,

      autoIncrementOld: false,
      commentOld: "",
      defalutValueOld: defalutValueOld,
      indexNameOld: "",
      isNullableOld: isNullableOld,
      isPrimaryKeyOld: isPrimaryKeyOld,
      isUniqueKeyOld: isUniqueKeyOld,
      nameOld: nameOld,
      sizeOld: sizeOld,
      typeOld: typeOld,
    };
  }

  // 对话框提交变更
  async function onSubmit() {
    const actionDataIndex = getActionDataIndex();
    const actionData = genActionData(dialogAction);
    if (actionDataIndex > -1) {
      setAlterData(alterData.map((item, index) => (index === actionDataIndex ? { ...item, ...actionData } : item)));
    } else {
      setAlterData([...alterData, actionData]);
    }

    const newFieldData = {
      comment: comment,
      defaultValue: defalutValue,
      hasCheckConditions: false,
      isForeignKey: false,
      isNullable: isNullable,
      isPrimaryKey: isPrimaryKey,
      isUniqueKey: isUniqueKey,
      name: name,
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
    };

    // 找到 alterData 里对应的字段的数据
    let fieldDataIndex = -1;
    appState.currentTableStructure.map((item, index) => {
      if (item.name === nameOld) {
        fieldDataIndex = index;
      }
    });

    if (dialogAction === STR_ADD) {
      appState.setCurrentTableStructure([...appState.currentTableStructure, newFieldData]);
    }

    if (dialogAction === STR_EDIT) {
      appState.setCurrentTableStructure(
        appState.currentTableStructure.map((field, index) => (index === fieldDataIndex ? newFieldData : field)),
      );

      // 向 TableSection 内部添加变化
      // if (autoIncrement != autoIncrementOld) addChange(fieldDataIndex, "", autoIncrementOld, autoIncrement); // FIXME: 添加支持
      if (comment != commentOld) addChange(fieldDataIndex, "comment", commentOld, comment);
      if (defalutValue != defalutValueOld) addChange(fieldDataIndex, "defalutValue", defalutValueOld, defalutValue);
      if (indexName != indexNameOld) addChange(fieldDataIndex, "indexName", indexNameOld, indexName);
      if (isNullable != isNullableOld) addChange(fieldDataIndex, "isNullable", isNullableOld, isNullable);
      if (isPrimaryKey != isPrimaryKeyOld) addChange(fieldDataIndex, "isPrimaryKey", isPrimaryKeyOld, isPrimaryKey);
      if (isUniqueKey != isUniqueKeyOld) addChange(fieldDataIndex, "isUniqueKey", isUniqueKeyOld, isUniqueKey);
      if (name != nameOld) addChange(fieldDataIndex, "name", nameOld, name);
      if (size != sizeOld) addChange(fieldDataIndex, "size", sizeOld, size);
      if (type != typeOld) addChange(fieldDataIndex, "type", typeOld, type);
    }

    updateDataArr();
    setShowDialogEdit(false);
  }

  function addChange(index: number, field: string, old: any, newVal: any) {
    tableRef.current?.addChange({ index, field, old, new: newVal });
  }

  // ========== 对话框 结束 ==========

  // ========== 按钮 ==========

  function handleAddField() {
    resetDialogData(null);
    setDialogAction(STR_ADD);
    setShowDialogEdit(true);
  }

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
          defaultValue: "",
          autoIncrement: false,
          indexName: "",
          isNullable: false,
          isPrimaryKey: false,
          isUniqueKey: false,
          name: field.name,
          nameNew: "",
          size: "",
          type: "",
        } as FieldAlterAction;
        alterData.push(action);
      }
    }

    tableRef.current?.deleteMultiSelectedRow();
    setAlterData(alterData);
  }

  function handleApply() {
    if (alterData.length === 0) {
      toast(t("&selectFieldFirst"));
      return;
    }

    setWillExecCmd(genAlterCmd(alterData));
    setShowDialogAlter(true);
  }

  function handleCancel() {
    setAlterData([]);
    tableRef.current?.resettData();
  }

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
      defaultValue: field.defaultValue,
      indexName: fieldIndexName,
      isNullable: field.isNullable,
      isPrimaryKey: isPrimaryKey,
      isUniqueKey: isUniqueKey,
      name: field.name,
      nameNew: "",
      size: `${field.size}`,
      type: field.type,

      autoIncrementOld: false,
      commentOld: field.comment,
      defalutValueOld: field.defaultValue,
      indexNameOld: "",
      isNullableOld: field.isNullable,
      isPrimaryKeyOld: isPrimaryKey,
      isUniqueKeyOld: isUniqueKey,
      nameOld: field.name,
      sizeOld: field.size || "",
      typeOld: field.type,
    });
    setShowDialogEdit(true);
    setDialogAction(STR_EDIT);
  }

  async function handleCopyFieldName(index: number) {
    const field = appState.currentTableStructure[index];
    try {
      await navigator.clipboard.writeText(field.name);
      toast(t("Copied"));
    } catch (err) {
      toast(t("Copy failed"));
    }
  }

  async function handleCopyFieldType(index: number) {
    const field = appState.currentTableStructure[index];
    try {
      await navigator.clipboard.writeText(field.type);
      toast(t("Copied"));
    } catch (err) {
      toast(t("Copy failed"));
    }
  }

  function handleDeleteField(index: number) {
    const field = appState.currentTableStructure[index];
    const actionDataIndex = getActionDataIndex();
    const actionData = genActionData(STR_DELETE);
    actionData.name = field.name;
    if (actionDataIndex > -1) {
      setAlterData(alterData.map((item, index) => (index === actionDataIndex ? { ...item, ...actionData } : item)));
    } else {
      setAlterData([...alterData, actionData]);
    }

    tableRef.current?.deleteRow(index);
  }

  function handleConfirm() {
    exec(willExecCmd);
    getData();
  }

  const tooltipSectionData = [
    {
      trigger: <RotateCw color="var(--fvm-info-clr)" onClick={() => getData()} />,
      content: <p>{t("Refresh")}</p>,
    },
    {
      trigger: <CirclePlus color="var(--fvm-primary-clr)" onClick={handleAddField} />,
      content: <p>{t("Add field")}</p>,
    },
    {
      trigger: <CircleMinus color="var(--fvm-danger-clr)" onClick={handleDelSelectedField} />,
      content: <p>{t("Delete field")}</p>,
    },
    {
      trigger: <CircleCheck color="var(--fvm-success-clr)" onClick={handleApply} />,
      content: <p>{t("Apply")}</p>,
    },
    {
      trigger: <CircleX color="var(--fvm-warning-clr)" onClick={handleCancel} />,
      content: <p>{t("Refresh")}</p>,
    },
  ];

  // ========== 按钮 结束 ==========

  // ========== 表格处理 ==========

  /**
   * 给每一行套上一个菜单 | Wrap each line with a right-click context menu
   * @param index 行的索引 | Index of row
   * @param node 行的节点 | Node of row
   * @returns
   */
  function renderRowContextMenu(index: number, node: React.ReactNode) {
    return (
      <ContextMenu key={index}>
        <ContextMenuTrigger asChild>{node}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleEditFieldPopup(index)}>{t("Edit")}</ContextMenuItem>
          <ContextMenuItem onClick={() => handleCopyFieldName(index)}>{t("Copy field name")}</ContextMenuItem>
          <ContextMenuItem onClick={() => handleCopyFieldType(index)}>{t("Copy type")}</ContextMenuItem>
          <hr className="my-2" />
          <ContextMenuItem onClick={() => handleDeleteField(index)} className={`text-[var(--fvm-danger-clr)]`}>
            {t("Delete")}
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
  const fieldNameTitle = [
    t("Field name"),
    t("Type"),
    t("Not null"),
    t("Default value"),
    t("Primary key"),
    t("Foreign key"),
    t("Unique key"),
    t("Check condition"),
    t("Comment"),
  ];
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

  // ========== 表格处理 结束 ==========

  useEffect(() => {
    updateDataArr();

    // 监听 store 的变化 | Monitor changes in the store
    const unsubscribe = subscribeKey(appState, "currentTableName", (_value: any) => {
      updateDataArr();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="flex pb-2">
        <div className={cn("gap-4 px-2 pb-2 sm:pl-2.5 inline-flex items-center justify-center ")}>
          <TooltipGroup dataArr={tooltipSectionData} />
        </div>
        <div className="flex-1">
          <Input
            defaultValue={editingTableComment}
            placeholder={t("Please enter table comments")}
            onChange={changeTable}
            onInput={(e) => {
              setEditingTableComment(e.currentTarget.value);
            }}
          />
        </div>
      </div>

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
            <DialogTitle>{dialogAction === STR_ADD ? t("Add") : t("Edit")}t("Field")</DialogTitle>
          </DialogHeader>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={t("Field name")}>
            <Input value={name} onInput={(e) => setName(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={t("Type")}>
            <Input value={type} onInput={(e) => setType(e.currentTarget.value)} />
            <div className="py-1"></div>
            <SearchableSelect value={type} optionsData={fieldTypeOptions()} onChange={setType} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={t("Size")}>
            <Input value={size} onInput={(e) => setSize(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={t("Default value")}>
            <Input value={defalutValue} onInput={(e) => setDefaultValue(e.currentTarget.value)} />
            <div className="flex items-center pt-2">
              <Checkbox
                checked={!isNullable}
                onClick={() => setIsNullable(!isNullable)}
                className="me-4"
                id="fieldNotNull"
              />
              <label htmlFor="fieldNotNull" className="text-sm font-medium">
                {t("Not null")}
              </label>
            </div>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={t("Index")}>
            <div className="flex gap-4">
              <div className="flex items-center">
                <Checkbox
                  checked={isPrimaryKey}
                  onClick={() => setIsPrimaryKey(!isPrimaryKey)}
                  className="me-4"
                  id="indexPrimaryKey"
                />
                <label htmlFor="indexPrimaryKey" className="text-sm font-medium">
                  {t("Primary key")}
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
                  {t("Auto increment")}
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  checked={isUniqueKey}
                  onClick={() => setIsUniqueKey(isUniqueKey)}
                  className="me-4"
                  id="indexUniqueKey"
                />
                <label htmlFor="indexUniqueKey" className="text-sm font-medium">
                  {t("Unique key")}
                </label>
              </div>
            </div>
            <div className="pt-2">
              <Input
                value={indexName}
                onInput={(e) => setIndexName(e.currentTarget.value)}
                placeholder={t("Index name")}
                disabled={!(isPrimaryKey || isUniqueKey)}
              />
            </div>
          </LabeledDiv>
          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={t("Comment")}>
            <Input value={comment} onInput={(e) => setComment(e.currentTarget.value)} />
          </LabeledDiv>

          {errorMessage && <TextNotification type="error" message={errorMessage}></TextNotification>}
          {okMessage && <TextNotification type="error" message={okMessage}></TextNotification>}

          <DialogFooter>
            <Button type="submit" onClick={onSubmit}>
              {t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDialogAlter}
        title={t("Are you sure you want to save the changes?")}
        description={t("&confirmStatement")}
        content={<SqlCodeViewer ddl={willExecCmd} />}
        cancelText={t("Cancel")}
        cancelCb={() => {
          setShowDialogAlter(false);
        }}
        okText={t("Confirm")}
        okCb={handleConfirm}
      />
    </div>
  );
}
