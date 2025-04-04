import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { subscribeKey } from "valtio/utils";
import {
  STR_ADD,
  STR_EDIT,
  STR_EMPTY,
  STR_TABLE,
  TAB_CONSTRAINT,
  TAB_DATA,
  TAB_DDL,
  TAB_FOREIGN_KEY,
  TAB_PARTITION,
  TAB_STRUCTURE,
} from "@/constants";
import { getTableStructure } from "@/databases/adapter,";
import { AllAlterAction, TableAlterAction } from "@/databases/types";
import { getUniqueFieldName } from "@/databases/utils";
import { appState } from "@/store/valtio";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TableEditorConstraint } from "./TableEditorConstraint";
import { TableEditorData } from "./TableEditorData";
import { TableEditorDdl } from "./TableEditorDdl";
import { TableEditorStructure } from "./TableEditorStructure";

export function TableEditor() {
  const snap = useSnapshot(appState);
  const [alterData, setAlterData] = useState<AllAlterAction[]>([]); // 对表格和字段的修改数据
  const [editingTableName, setEditingTableName] = useState<string>(""); // 输入框中的表名
  const [editingTableComment, setEditingTableComment] = useState<string>(""); // 输入框中的表注释

  // 获取表结构, 会在多个地方用, 在这里记录到 store
  async function getData() {
    if (appState.currentTableName === "") {
      return;
    }

    const res = await getTableStructure(appState.currentTableName);
    if (res && res.data) {
      appState.setCurrentTableStructure(res.data);
      appState.setUniqueFieldName(getUniqueFieldName(res.data));
      if (appState.mainContenTab === STR_EMPTY) appState.setMainContenTab(TAB_DATA);
    }
  }

  // 修改表格数据
  // 对表的操作包括: 重命名 / 注释 / 分区 / 约束 / 表字符集和排序规则 等
  function changeTable() {
    if (editingTableName === "") return;

    let actionDataFindedIndex = -1;

    // 找到已存在的记录
    for (let index = 0; index < alterData.length; index++) {
      const item = alterData[index];
      if (item.target === STR_TABLE) {
        // 对表的操作只有一个不用再判断
        actionDataFindedIndex = index;
      }
    }

    const actionData: TableAlterAction = {
      target: STR_TABLE,
      action: appState.isAddingTable ? STR_ADD : STR_EDIT,
      tableName: editingTableName, // 输入框里的表名
      tableNameOld: appState.currentTableName,
      comment: editingTableComment,
    };

    if (actionDataFindedIndex > -1) {
      setAlterData(
        alterData.map((item, index) => (index === actionDataFindedIndex ? { ...item, ...actionData } : item)),
      );
    } else {
      setAlterData([...alterData, actionData]);
    }
  }

  // 对表格的修改, 要执行 changeTable
  useEffect(() => {
    changeTable();
  }, [editingTableName, editingTableComment]);

  useEffect(() => {
    getData();

    // 监听 store 的变化
    const unsubscribe = subscribeKey(appState, "currentTableName", async (_value: any) => {
      setEditingTableName(_value);
      await getData();
    });
    return () => unsubscribe();
  }, []);

  return (
    // 注意: 使用 value 控制 Tabs 组件的显示, TabsTrigger 要添加 onClick 修改 mainContenTab
    <Tabs value={snap.mainContenTab} className="w-full">
      <div className="flex">
        <div className="flex items-center pe-4">
          <Input
            placeholder={"请输入表名"}
            defaultValue={editingTableName}
            onInput={(e) => {
              setEditingTableName(e.currentTarget.value);
            }}
          />
        </div>
        <TabsList className="grid grid-cols-6">
          <TabsTrigger
            value={TAB_STRUCTURE}
            onClick={() => {
              appState.setMainContenTab(TAB_STRUCTURE);
            }}
          >
            表结构
          </TabsTrigger>

          <TabsTrigger
            value={TAB_DDL}
            onClick={() => {
              appState.setMainContenTab(TAB_DDL);
            }}
          >
            DDL
          </TabsTrigger>

          <TabsTrigger
            value={TAB_CONSTRAINT}
            onClick={() => {
              appState.setMainContenTab(TAB_CONSTRAINT);
            }}
          >
            约束
          </TabsTrigger>

          <TabsTrigger
            value={TAB_FOREIGN_KEY}
            onClick={() => {
              appState.setMainContenTab(TAB_FOREIGN_KEY);
            }}
          >
            外键
          </TabsTrigger>

          <TabsTrigger
            value={TAB_PARTITION}
            onClick={() => {
              appState.setMainContenTab(TAB_PARTITION);
            }}
          >
            分区
          </TabsTrigger>

          <TabsTrigger
            value={TAB_DATA}
            onClick={() => {
              appState.setMainContenTab(TAB_DATA);
            }}
          >
            数据
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value={TAB_STRUCTURE}>
        <Card className="p-4">
          <CardContent className="p-0">
            <TableEditorStructure
              getData={getData}
              changeTable={changeTable}
              alterData={alterData}
              setAlterData={setAlterData}
              editingTableComment={editingTableComment}
              setEditingTableComment={setEditingTableComment}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value={TAB_DDL}>
        <Card className="p-4">
          <CardContent className="p-0">
            <TableEditorDdl />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value={TAB_CONSTRAINT}>
        <Card className="p-4">
          <CardContent className="p-0">
            <TableEditorConstraint />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value={TAB_DATA}>
        <Card className="p-4">
          <CardContent className="p-0">
            <TableEditorData />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
