import { proxy } from "valtio";
import { MAIN_AREA_WELCOME } from "@/constants";
import { FieldStructure } from "@/databases/types";
import { MainAreaTab, MainAreaType } from "@/types/types";

export interface TabState {
  // 当前数据库名
  currentDbNme: string;
  setCurrentDbName: (val: string) => void;

  // 当前表名
  currentTableName: string;
  setCurrentTableName: (val: string) => void;

  // 唯一字段(主键或唯一索引)的字段名
  uniqueFieldName: string;
  setUniqueFieldName: (val: string) => void;

  // 当前表的建表语句
  currentTableDdl: string;
  setCurrentTableDdl: (val: string) => void;

  // 当前表结构
  currentTableStructure: FieldStructure[];
  setCurrentTableStructure: (val: FieldStructure[]) => void;

  // 主要区域的类型
  mainAreaType: MainAreaType;
  setMainAreaType: (val: MainAreaType) => void;
  // 主要区域的标签页
  mainAreaTab: MainAreaTab;
  setMainAreaTab: (val: MainAreaTab) => void;

  // 编辑器里的内容
  sqlEditorContent: string;
  setSqlEditorContent: (val: string) => void;

  // 是建表
  isAddingTable: boolean;
  setIsAddingTable: (val: boolean) => void;

  // 要编辑的数据库连接
  editDbConnIndex: number;
  setEditDbConnIndex: (val: number) => void;
}

// 状态工厂函数
export const createTabState = () => {
  return proxy({
    // 当前数据库名
    currentDbNme: "",
    setCurrentDbName(val: string) {
      this.currentDbNme = val;
    },
    // 表名
    currentTableName: "",
    setCurrentTableName(val: string) {
      this.currentTableName = val;
    },
    // 唯一字段(主键或唯一索引)的字段名
    uniqueFieldName: "",
    setUniqueFieldName(val: string) {
      this.uniqueFieldName = val;
    },
    // 当前表的建表语句
    currentTableDdl: "",
    setCurrentTableDdl(val: string) {
      this.currentTableDdl = val;
    },
    // 当前表结构
    currentTableStructure: [],
    setCurrentTableStructure(val: FieldStructure[]) {
      this.currentTableStructure = val;
    },
    // 主要区域的类型
    mainAreaType: MAIN_AREA_WELCOME,
    setMainAreaType(val: MainAreaType) {
      this.mainAreaType = val;
    },
    // 主要区域的标签页
    mainAreaTab: "",
    setMainAreaTab(val: MainAreaTab) {
      this.mainAreaTab = val;
    },
    // 编辑器里的内容
    sqlEditorContent: "",
    setSqlEditorContent(val: string) {
      this.sqlEditorContent = val;
    },
    // 是建表
    isAddingTable: false,
    setIsAddingTable(val: boolean) {
      this.isAddingTable = val;
    },
    // 要编辑的数据库连接
    editDbConnIndex: 0,
    setEditDbConnIndex(val: number) {
      this.editDbConnIndex = val;
    },
  } as TabState);
};

export type TabsState = ReturnType<typeof createTabState>;
