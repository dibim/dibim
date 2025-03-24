/**
 * 点击表格显示数据
 */
import { useEffect } from "react";
import { getTableStructure } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { MainContentData } from "@/types/types";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TableEditorConstraint } from "./TableEditorConstraint";
import { TableEditorData } from "./TableEditorData";
import { TableEditorDdl } from "./TableEditorDdl";
import { TableEditorStructure } from "./TableEditorStructure";

export function TableEditor(props: MainContentData) {
  const { currentDbType, currentTableName, setCurrentTableStructure } = useCoreStore();

  // 获取表结构, 会在多个地方用, 在这里记录到 store
  const getStructure = async () => {
    const res = await getTableStructure(currentDbType, currentTableName);
    if (res && res.data) {
      setCurrentTableStructure(res.data);
    }
  };

  const tabStructure = "tab1";
  const tabDdl = "tab2";
  const tabConstraint = "tab3";
  const tabData = "tab4";
  const tabPart = "tab5";

  useEffect(() => {
    getStructure();
  }, [currentTableName]);

  useEffect(() => {
    getStructure();
  }, []);

  return (
    <Tabs defaultValue={tabData} className="w-full">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value={tabStructure}>表结构</TabsTrigger>
        {/* <TabsTrigger value={tabDdl}>DDL</TabsTrigger> */}
        {/* <TabsTrigger value={tabConstraint}>约束</TabsTrigger> */}
        <TabsTrigger value={tabData}>数据</TabsTrigger>
        {/* <TabsTrigger value={tabPart}>分区</TabsTrigger> */}
      </TabsList>
      <TabsContent value={tabStructure}>
        <Card>
          <CardContent className="space-y-2">
            <TableEditorStructure getStructure={getStructure} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value={tabDdl}>
        <Card>
          <CardContent className="space-y-2">
            <TableEditorDdl />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value={tabConstraint}>
        <Card>
          <CardContent className="space-y-2">
            <TableEditorConstraint />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value={tabData}>
        <Card>
          <CardContent className="space-y-2">
            <TableEditorData />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
