import { proxy } from "valtio";
import { MAIN_AREA_WELCOME } from "@/constants";
import { FieldStructure } from "@/databases/types";
import { MainAreaTab, MainAreaType } from "@/types/types";

export interface TabState {
  connColor: string;
  setConnColor: (val: string) => void;

  connName: string;
  setConnName: (val: string) => void;

  dbNme: string;
  setDbName: (val: string) => void;

  tableName: string;
  setTableName: (val: string) => void;

  // 唯一字段(主键或唯一索引)的字段名
  // The field name of a unique field (primary key or unique index)
  uniqueFieldName: string;
  setUniqueFieldName: (val: string) => void;

  // 当前表的建表语句
  // The table creation statement for the current table
  tableDdl: string;
  setTableDdl: (val: string) => void;

  tableStructure: FieldStructure[];
  setTableStructure: (val: FieldStructure[]) => void;

  mainAreaType: MainAreaType;
  setMainAreaType: (val: MainAreaType) => void;
  mainAreaTab: MainAreaTab;
  setMainAreaTab: (val: MainAreaTab) => void;

  sqlEditorContent: string;
  setSqlEditorContent: (val: string) => void;

  isAddingTable: boolean;
  setIsAddingTable: (val: boolean) => void;

  // 要编辑的数据库连接
  editDbConnIndex: number;
  setEditDbConnIndex: (val: number) => void;
}

export const createTabState = () => {
  return proxy({
    connColor: "",
    setConnColor(val: string) {
      this.connColor = val;
    },

    connName: "",
    setConnName(val: string) {
      this.connName = val;
    },

    dbNme: "",
    setDbName(val: string) {
      this.dbNme = val;
    },

    tableName: "",
    setTableName(val: string) {
      this.tableName = val;
    },

    uniqueFieldName: "",
    setUniqueFieldName(val: string) {
      this.uniqueFieldName = val;
    },

    tableDdl: "",
    setTableDdl(val: string) {
      this.tableDdl = val;
    },

    tableStructure: [],
    setTableStructure(val: FieldStructure[]) {
      this.tableStructure = val;
    },

    mainAreaType: MAIN_AREA_WELCOME,
    setMainAreaType(val: MainAreaType) {
      this.mainAreaType = val;
    },

    mainAreaTab: "",
    setMainAreaTab(val: MainAreaTab) {
      this.mainAreaTab = val;
    },

    sqlEditorContent: "",
    setSqlEditorContent(val: string) {
      this.sqlEditorContent = val;
    },

    isAddingTable: false,
    setIsAddingTable(val: boolean) {
      this.isAddingTable = val;
    },

    editDbConnIndex: 0,
    setEditDbConnIndex(val: number) {
      this.editDbConnIndex = val;
    },
  } as TabState);
};

export type TabsState = ReturnType<typeof createTabState>;
