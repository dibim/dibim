/**
 * 点击表格显示数据
 */
import { useEffect, useState } from "react";
import { getTableStructure } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TableEditorConstraint } from "./TableEditorConstraint";
import { TableEditorData } from "./TableEditorData";
import { TableEditorDdl } from "./TableEditorDdl";
import { TableEditorStructure } from "./TableEditorStructure";

const TAB_STRUCTURE = "TAB_STRUCTURE";
const TAB_DDL = "TAB_DDL";
const TAB_CONSTRAINT = "TAB_CONSTRAINT";
const TAB_DATA = "TAB_DATA";
const TAB_PARTITION = "TAB_PARTITION";
const TAB_FOREIGN_KEY = "TAB_FOREIGN_KEY";

export function TableEditor() {
  const { currentDbType, currentTableName, setCurrentTableStructure } = useCoreStore();

  // tabName 先使用空的, 避免表结构没获取到就查询表数据出问题
  // 注意: 使用 value 控制 Tabs 组件的显示, TabsTrigger 要添加 onClick 修改 tabName
  const [tabName, setTabName] = useState<string>("");

  // 获取表结构, 会在多个地方用, 在这里记录到 store
  const getStructure = async () => {
    if (currentTableName === "") {
      return;
    }

    const res = await getTableStructure(currentDbType, currentTableName);

    if (res && res.data) {
      setCurrentTableStructure(res.data);
      setTabName(TAB_DATA);
    }
  };

  useEffect(() => {
    getStructure();
  }, [currentTableName]);

  useEffect(() => {
    getStructure();
  }, []);

  return (
    <Tabs value={tabName} className="w-full">
      <div className="flex">
        <div className="flex items-center pe-4">
          <strong>{currentTableName}</strong>{" "}
        </div>
        <TabsList className="grid grid-cols-6">
          <TabsTrigger
            value={TAB_STRUCTURE}
            onClick={() => {
              setTabName(TAB_STRUCTURE);
            }}
          >
            表结构
          </TabsTrigger>

          <TabsTrigger
            value={TAB_DDL}
            onClick={() => {
              setTabName(TAB_DDL);
            }}
          >
            DDL
          </TabsTrigger>

          <TabsTrigger
            value={TAB_CONSTRAINT}
            onClick={() => {
              setTabName(TAB_CONSTRAINT);
            }}
          >
            约束
          </TabsTrigger>

          <TabsTrigger
            value={TAB_FOREIGN_KEY}
            onClick={() => {
              setTabName(TAB_FOREIGN_KEY);
            }}
          >
            外键
          </TabsTrigger>

          <TabsTrigger
            value={TAB_PARTITION}
            onClick={() => {
              setTabName(TAB_PARTITION);
            }}
          >
            分区
          </TabsTrigger>

          <TabsTrigger
            value={TAB_DATA}
            onClick={() => {
              setTabName(TAB_DATA);
            }}
          >
            数据
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value={TAB_STRUCTURE}>
        <Card className="p-4">
          <CardContent className="p-0">
            <TableEditorStructure getStructure={getStructure} />
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
