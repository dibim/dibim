import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { useSnapshot } from "valtio";
import { DIR_H, HEDAER_H, STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY, STR_FIELD } from "@/constants";
import { getTab } from "@/context";
import { execMany, fieldTypeOptions, genAlterCmd } from "@/databases/adapter,";
import { AllAlterAction, AlterAction, FieldAlterAction } from "@/databases/types";
import { useActiveTabStore } from "@/hooks/useActiveTabStore";
import { cn } from "@/lib/utils";
import { addNotification, coreState } from "@/store/core";
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
  getData: () => Promise<void>;
  alterData: AllAlterAction[];
  setAlterData: (val: AllAlterAction[]) => void;
  changeTable: () => void;
  editingTableComment: string;
  setEditingTableComment: (val: string) => void;
};

export function TableStructure({
  getData,
  alterData,
  setAlterData,
  changeTable,
  editingTableComment,
  setEditingTableComment,
}: TableEditorStructureProps) {
  const tab = getTab();
  if (tab === null) return <p>No tab found</p>;
  const tabState = tab.state;
  const tabSnap = useSnapshot(tabState);

  const { t } = useTranslation();
  const tableRef = useRef<EditableTableMethods | null>(null);

  // ========== 对话框 | Dialog ==========

  const [dialogAction, setDialogAction] = useState<DialogAction>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [okMessage, setOkMessage] = useState<string>("");
  const [showDialogAlter, setShowDialogAlter] = useState<boolean>(false);
  const [showDialogEdit, setShowDialogEdit] = useState<boolean>(false);
  const [willExecCmd, setWillExecCmd] = useState<string>("");

  // 字段编辑对话框里的数据 | Data in the field editing dialog
  const [autoIncrement, setAutoIncrement] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [defalutValue, setDefaultValue] = useState<string>("");
  const [indexName, setIndexName] = useState<string>(""); // 字段索引名 | Field index name
  const [isNullable, setIsNullable] = useState<boolean>(false);
  const [isPrimaryKey, setIsPrimaryKey] = useState<boolean>(false);
  const [isUniqueKey, setIsUniqueKey] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [type, setType] = useState<string>("");
  // 备份原先的数据 | Backup original data
  // const [autoIncrementOld, setAutoIncrementOld] = useState<boolean>(false);
  const [commentOld, setCommentOld] = useState<string>("");
  const [defalutValueOld, setDefaultValueOld] = useState<string>("");
  const [indexNameOld, setIndexNameOld] = useState<string>("");
  const [isNullableOld, setIsNullableOld] = useState<boolean>(false);
  const [isPrimaryKeyOld, setIsPrimaryKeyOld] = useState<boolean>(false);
  const [isUniqueKeyOld, setIsUniqueKeyOld] = useState<boolean>(false);
  const [nameOld, setNameOld] = useState<string>("");
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

    // setAutoIncrementOld(faa?.autoIncrement || false);
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

  // 找到 alterData 里对应的字段的数据 | Find the data corresponding to the field in alterData
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
      tableName: tabState.currentTableName,

      autoIncrement: autoIncrement,
      comment: comment,
      defaultValue: defalutValue,
      indexName: indexName,
      isNullable: isNullable,
      isPrimaryKey: isPrimaryKey,
      isUniqueKey: false,
      name: dialogAction === STR_ADD ? name : nameOld, // 添加时, 使用新 name | When adding, use a new name
      nameNew: name, // 重命名时使用新 name | Use the new name when renaming
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
              columnName: "", // 仅显示用,留空 | Display only, leave blank
              indexName: "", // 仅显示用,留空 | Display only, leave blank
              indexType: "", // 仅显示用,留空 | Display only, leave blank
              isPrimaryKey: isUniqueKey,
              isUniqueKey: isPrimaryKey,
            },
          ]
        : undefined,
    };

    // 找到 alterData 里对应的字段的数据 | Find the data corresponding to the field in alterData
    let fieldDataIndex = -1;
    tabState.currentTableStructure.map((item, index) => {
      if (item.name === nameOld) {
        fieldDataIndex = index;
      }
    });

    if (dialogAction === STR_ADD) {
      tabState.setCurrentTableStructure([...tabState.currentTableStructure, newFieldData]);
    }

    if (dialogAction === STR_EDIT) {
      tabState.setCurrentTableStructure(
        tabState.currentTableStructure.map((field, index) => (index === fieldDataIndex ? newFieldData : field)),
      );

      // 向 TableSection 内部添加变化 | Add changes to the inside of the TableSection
      // FIXME: 添加对 autoIncrement 的支持
      // if (autoIncrement != autoIncrementOld) addChange(fieldDataIndex, "", autoIncrementOld, autoIncrement);
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

  // ========== 对话框 结束 | Dialog end ==========

  // ========== 按钮 |Button ==========

  function handleAddField() {
    resetDialogData(null);
    setDialogAction(STR_ADD);
    setShowDialogEdit(true);
  }

  function handleDelSelectedField() {
    const arr = tableRef.current?.getMultiSelectData() || [];
    for (const index of arr) {
      const field = tabState.currentTableStructure[index];

      // 创建表格时不需要记录字段的删除动作
      // When creating a table, do not need to delete a record field
      if (!tabState.isAddingTable) {
        const action = {
          target: STR_FIELD,
          action: STR_DELETE,
          tableName: tabState.currentTableName,

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
      addNotification(t("&selectFieldFirst"), "warning");
      return;
    }

    setWillExecCmd(genAlterCmd(alterData) || "");
    setShowDialogAlter(true);
  }

  function handleCancel() {
    setAlterData([]);
    tableRef.current?.resetData();
  }

  function handleEditFieldPopup(index: number) {
    const field = tabState.currentTableStructure[index];

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
      tableName: tabState.currentTableName,

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
    const field = tabState.currentTableStructure[index];
    try {
      await navigator.clipboard.writeText(field.name);
      addNotification(t("Copied"), "success");
    } catch (err) {
      console.log("Copy failed, error: ", err);
      addNotification(t("Copy failed"), "error");
    }
  }

  async function handleCopyFieldType(index: number) {
    const field = tabState.currentTableStructure[index];
    try {
      await navigator.clipboard.writeText(field.type);
      addNotification(t("Copied"), "success");
    } catch (err) {
      console.log("Copy failed, error: ", err);
      addNotification(t("Copy failed"), "error");
    }
  }

  function handleDeleteField(index: number) {
    const field = tabState.currentTableStructure[index];
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

  async function handleConfirm() {
    const res = await execMany(willExecCmd);
    if (!res) {
      addNotification("The result of execMany is null", "error");
    } else if (res.errorMessage === "") {
      setShowDialogAlter(false);
      await getData();
      resetData(true);
      setOkMessage("OK");
      addNotification("OK", "success");
    } else {
      setErrorMessage(res.errorMessage);
      addNotification(res.errorMessage, "error");
    }
  }

  const tooltipSectionData = [
    {
      trigger: <RotateCw color="var(--fvm-info-clr)" onClick={async () => await getData()} />,
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

  // ========== 按钮 结束 | Button end ==========

  // ========== 表格处理 | Table data processing ==========

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
    const dataArrTemp = tabState.currentTableStructure.map(
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
          // 注意显示的是非空, 不是 isNullable 本身, 要取反
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

  // ========== 表格处理 结束 | Table data processing end ==========

  function resetData(resetAlterData: boolean) {
    // 监听 currentTableStructure 变化后不可以执行 setAlterData, 否则应用表结构变化的数据会被清空
    if (resetAlterData) setAlterData([]);
    tableRef.current?.resetData();
    updateDataArr();
  }

  // 监听 store 的变化 | Monitor changes in the store
  useActiveTabStore(coreState.activeTabId, "currentTableStructure", (_value: any) => {
    resetData(false);
  });

  useEffect(() => {
    updateDataArr();
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
          editable={tabSnap.uniqueFieldName !== ""}
          multiSelect={true}
          fieldNames={fieldNames}
          fieldNamesTitle={fieldNameTitle}
          fieldNamesUnique={[tabSnap.uniqueFieldName]}
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
            <DialogTitle>{dialogAction === STR_ADD ? t("Add field") : t("Edit field")}</DialogTitle>
          </DialogHeader>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={t("Field name")}>
            <Input value={name} onInput={(e) => setName(e.currentTarget.value)} />
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} labelWidth="6rem" label={t("Type")}>
            <Input value={type} onInput={(e) => setType(e.currentTarget.value)} />
            <div className="py-1"></div>
            <SearchableSelect value={type} optionsData={fieldTypeOptions() || []} onChange={setType} />
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
          {okMessage && <TextNotification type="success" message={okMessage}></TextNotification>}

          <DialogFooter>
            <Button type="submit" onClick={onSubmit}>
              {t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDialogAlter}
        title={t("&confirmChanges")}
        description={t("&confirmStatement")}
        content={
          <>
            <SqlCodeViewer ddl={willExecCmd} />
            {errorMessage && <TextNotification type="error" message={errorMessage}></TextNotification>}
            {okMessage && <TextNotification type="success" message={okMessage}></TextNotification>}
          </>
        }
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
