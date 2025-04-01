import { proxy } from "valtio";
import {
  DB_TYPE_POSTGRESQL,
  LIST_BAR_TYPE_DB_LIST,
  MAIN_CONTEN_TYPE_WELCOME,
  MAIN_PASSWORD_DEFAULT,
} from "@/constants";
import { TableStructure } from "@/databases/types";
import { invoker } from "@/invoker";
import { ConfigFile } from "@/types/conf_file";
import { DbType, ListBarType, MainContenType, MainContentTab } from "@/types/types";
import { saveConfigFile } from "@/utils/config_file";

interface AppState {
  // 配置文件相关
  config: ConfigFile;
  setConfig: (val: ConfigFile, notWriteToFile?: boolean) => Promise<void>;
  mainPasswordSha: string;
  setMainPasswordSha: (val: string) => void;

  // 当前数据库类型
  currentDbType: DbType;
  setCurrentDbType: (val: DbType) => void;

  // 当前连接名
  currentConnName: string;
  setCurrentConnName: (val: string) => void;
  // 当前连接颜色
  currentConnColor: string;
  setCurrentConnColor: (val: string) => void;

  // 当前数据库名
  currentDbNme: string;
  setCurrentDbName: (val: string) => void;

  // 当前表名
  currentTableName: string;
  setCurrentTableName: (val: string) => void;

  // 唯一字段(主键或唯一索引)的字段名
  uniqueFieldName: string;
  setUniqueFieldName: (val: string) => void;

  // 当前表结构
  currentTableStructure: TableStructure[];
  setCurrentTableStructure: (val: TableStructure[]) => void;

  // 侧边栏
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;

  // 列表栏是否显示
  listBarOpen: boolean;
  setListBarOpen: (val: boolean) => void;
  // 列表栏的类型
  listBarType: ListBarType;
  setListBarType: (val: ListBarType) => void;

  // 主要区域的类型
  mainContenType: MainContenType;
  setMainContenType: (val: MainContenType) => void;
  // 主要区域的标签页
  mainContenTab: MainContentTab;
  setMainContenTab: (val: MainContentTab) => void;

  // 是建表
  isAddingTable: boolean;
  setIsAddingTable: (val: boolean) => void;

  // 要编辑的数据库连接
  editDbConnIndex: number;
  setEditDbConnndex: (val: number) => void;
}

// 按照默认密码生成默认的 sha
export const defaultMainPasswordSha = await invoker.sha256(MAIN_PASSWORD_DEFAULT);

const emptyConfigFile: ConfigFile = {
  dbConnections: [],
  settings: {
    theme: "",
    timeFormat: "",
    lang: "",
  },
};

export const appState = proxy<AppState>({
  config: emptyConfigFile,
  setConfig: async (val: ConfigFile, notWrite?: boolean) => {
    appState.config = val;
    if (notWrite !== true) {
      await saveConfigFile(JSON.stringify(val), appState.mainPasswordSha); // 保存到配置文件
    }
  },
  mainPasswordSha: defaultMainPasswordSha,
  setMainPasswordSha: (val: string) => (appState.mainPasswordSha = val),

  currentDbType: DB_TYPE_POSTGRESQL,
  setCurrentDbType: (val: DbType) => (appState.currentDbType = val),

  currentConnName: "",
  setCurrentConnName: (val: string) => (appState.currentConnName = val),
  currentConnColor: "",
  setCurrentConnColor: (val: string) => (appState.currentConnColor = val),

  currentDbNme: "",
  setCurrentDbName: (val: string) => (appState.currentDbNme = val),

  currentTableName: "",
  setCurrentTableName: (val: string) => (appState.currentTableName = val),
  uniqueFieldName: "",
  setUniqueFieldName: (val: string) => (appState.uniqueFieldName = val),

  currentTableStructure: [],
  setCurrentTableStructure: (val: TableStructure[]) => (appState.currentTableStructure = val),

  sidebarOpen: true,
  setSidebarOpen: (val: boolean) => (appState.sidebarOpen = val),

  listBarOpen: true,
  setListBarOpen: (val: boolean) => (appState.listBarOpen = val),
  listBarType: LIST_BAR_TYPE_DB_LIST,
  setListBarType: (val: ListBarType) => (appState.listBarType = val),

  mainContenType: MAIN_CONTEN_TYPE_WELCOME,
  setMainContenType: (val: MainContenType) => (appState.mainContenType = val),
  mainContenTab: "",
  setMainContenTab: (val: MainContentTab) => (appState.mainContenTab = val),

  isAddingTable: false,
  setIsAddingTable: (val: boolean) => (appState.isAddingTable = val),

  editDbConnIndex: 0,
  setEditDbConnndex: (val: number) => (appState.editDbConnIndex = val),
}) as AppState;
