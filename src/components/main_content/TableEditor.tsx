/**
 * 点击表格显示数据
 */
import { useEffect } from "react";
import {
  STR_EMPTY,
  TAB_CONSTRAINT,
  TAB_DATA,
  TAB_DDL,
  TAB_FOREIGN_KEY,
  TAB_PARTITION,
  TAB_STRUCTURE,
} from "@/constants";
import { getTableStructure } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TableEditorConstraint } from "./TableEditorConstraint";
import { TableEditorData } from "./TableEditorData";
import { TableEditorDdl } from "./TableEditorDdl";
import { TableEditorStructure } from "./TableEditorStructure";

export function TableEditor() {
  const {
    currentTableName,
    setCurrentTableName,
    setCurrentTableStructure,
    mainContenTab,
    setMainContenTab,
    isAddingTable,
  } = useCoreStore();

  // 获取表结构, 会在多个地方用, 在这里记录到 store
  const getData = async () => {
    if (currentTableName === "") {
      return;
    }

    const res = await getTableStructure(currentTableName);
    if (res && res.data) {
      setCurrentTableStructure(res.data);
      if (mainContenTab === STR_EMPTY) setMainContenTab(TAB_DATA);
    }
  };

  useEffect(() => {
    getData();
  }, [currentTableName]);

  useEffect(() => {
    getData();
  }, []);

  return (
    // 注意: 使用 value 控制 Tabs 组件的显示, TabsTrigger 要添加 onClick 修改 mainContenTab
    <Tabs value={mainContenTab} className="w-full">
      <div className="flex">
        <div className="flex items-center pe-4">
          {isAddingTable ? (
            <Input
              placeholder={"请输入表名"}
              onInput={(e) => {
                setCurrentTableName(e.currentTarget.value);
              }}
            />
          ) : (
            <strong>{currentTableName}</strong>
          )}
        </div>
        <TabsList className="grid grid-cols-6">
          <TabsTrigger
            value={TAB_STRUCTURE}
            onClick={() => {
              setMainContenTab(TAB_STRUCTURE);
            }}
          >
            表结构
          </TabsTrigger>

          <TabsTrigger
            value={TAB_DDL}
            onClick={() => {
              setMainContenTab(TAB_DDL);
            }}
          >
            DDL
          </TabsTrigger>

          <TabsTrigger
            value={TAB_CONSTRAINT}
            onClick={() => {
              setMainContenTab(TAB_CONSTRAINT);
            }}
          >
            约束
          </TabsTrigger>

          <TabsTrigger
            value={TAB_FOREIGN_KEY}
            onClick={() => {
              setMainContenTab(TAB_FOREIGN_KEY);
            }}
          >
            外键
          </TabsTrigger>

          <TabsTrigger
            value={TAB_PARTITION}
            onClick={() => {
              setMainContenTab(TAB_PARTITION);
            }}
          >
            分区
          </TabsTrigger>

          <TabsTrigger
            value={TAB_DATA}
            onClick={() => {
              setMainContenTab(TAB_DATA);
            }}
          >
            数据
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value={TAB_STRUCTURE}>
        <Card className="p-4">
          <CardContent className="p-0">
            <TableEditorStructure getData={getData} />
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
