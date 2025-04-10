import { proxy } from "valtio";
import { LIST_BAR_DB, MAIN_AREA_WELCOME, MAIN_PASSWORD_DEFAULT } from "@/constants";
import { DB_POSTGRESQL } from "@/databases/constants";
import { DbType, FieldStructure } from "@/databases/types";
import { invoker } from "@/invoker";
import { ConfigFileMain } from "@/types/conf_file";
import { ListBarType, MainAreaTab, MainAreaType, TextNotificationData, TextNotificationType } from "@/types/types";
import { saveConfigFile } from "@/utils/config_file";

interface AppState {
  // 配置文件相关
  config: ConfigFileMain;
  setConfig: (val: ConfigFileMain, notWriteToFile?: boolean) => Promise<void>;
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

  // 当前表的建表语句
  currentTableDdl: string;
  setCurrentTableDdl: (val: string) => void;

  // 当前表结构
  currentTableStructure: FieldStructure[];
  setCurrentTableStructure: (val: FieldStructure[]) => void;

  // 关于
  aboutOpen: boolean;
  setAboutOpen: (val: boolean) => void;

  // 侧边栏
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  // 侧边栏的宽度
  sideBarWidth: number;
  setSideBarWidth: (val: number) => void;
  // 大屏幕下侧边栏的宽度
  sideBarWidthPc: string;
  setSideBarWidthPc: (val: string) => void;
  // 小屏幕下侧边栏的宽度
  sideBarWidthMobile: string;
  setSideBarWidthMobile: (val: string) => void;

  // 列表栏是否显示
  listBarOpen: boolean;
  setListBarOpen: (val: boolean) => void;
  // 列表栏的宽度
  listBarWidth: number;
  setListBarWidth: (val: number) => void;
  // 列表栏的类型
  listBarType: ListBarType;
  setListBarType: (val: ListBarType) => void;

  // 主要区域的类型
  mainContenType: MainAreaType;
  setMainContenType: (val: MainAreaType) => void;
  // 主要区域的标签页
  mainContenTab: MainAreaTab;
  setMainContenTab: (val: MainAreaTab) => void;

  // 编辑器里的内容
  sqlEditorContent: string;
  setSqlEditorContent: (val: string) => void;

  // 是建表
  isAddingTable: boolean;
  setIsAddingTable: (val: boolean) => void;

  // 要编辑的数据库连接
  editDbConnIndex: number;
  setEditDbConnIndex: (val: number) => void;

  // 通知
  textNotificationArr: TextNotificationData[];
  addTextNotification: (val: TextNotificationData) => void;
}

// 按照默认密码生成默认的 sha
export const defaultMainPasswordSha = await invoker.sha256(MAIN_PASSWORD_DEFAULT);

const emptyConfigFile: ConfigFileMain = {
  dbConnections: [],
  settings: {
    colorScheme: "",
    timeFormat: "",
    lang: "",
  },
};

export const appState = proxy<AppState>({
  config: emptyConfigFile,
  setConfig: async (val: ConfigFileMain, notWrite?: boolean) => {
    appState.config = val;
    if (notWrite !== true) {
      await saveConfigFile(val, appState.mainPasswordSha); // 保存到配置文件
    }
  },
  mainPasswordSha: defaultMainPasswordSha,
  setMainPasswordSha: (val: string) => (appState.mainPasswordSha = val),

  currentDbType: DB_POSTGRESQL,
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

  currentTableDdl: "",
  setCurrentTableDdl: (val: string) => (appState.currentTableDdl = val),

  currentTableStructure: [],
  setCurrentTableStructure: (val: FieldStructure[]) => (appState.currentTableStructure = val),

  aboutOpen: false,
  setAboutOpen: (val: boolean) => (appState.aboutOpen = val),

  sidebarOpen: false,
  setSidebarOpen: (val: boolean) => (appState.sidebarOpen = val),
  sideBarWidth: 0,
  setSideBarWidth: (val: number) => (appState.sideBarWidth = val),
  sideBarWidthPc: "10rem",
  setSideBarWidthPc: (val: string) => (appState.sideBarWidthPc = val),
  sideBarWidthMobile: "20rem",
  setSideBarWidthMobile: (val: string) => (appState.sideBarWidthMobile = val),

  listBarOpen: true,
  setListBarOpen: (val: boolean) => (appState.listBarOpen = val),
  listBarWidth: 0,
  setListBarWidth: (val: number) => (appState.listBarWidth = val),
  listBarType: LIST_BAR_DB,
  setListBarType: (val: ListBarType) => (appState.listBarType = val),

  mainContenType: MAIN_AREA_WELCOME,
  setMainContenType: (val: MainAreaType) => (appState.mainContenType = val),
  mainContenTab: "",
  setMainContenTab: (val: MainAreaTab) => (appState.mainContenTab = val),

  sqlEditorContent: "",
  setSqlEditorContent: (val: string) => (appState.sqlEditorContent = val),

  isAddingTable: false,
  setIsAddingTable: (val: boolean) => (appState.isAddingTable = val),

  editDbConnIndex: 0,
  setEditDbConnIndex: (val: number) => (appState.editDbConnIndex = val),

  textNotificationArr: [],
  addTextNotification: (val: TextNotificationData) =>
    (appState.textNotificationArr = [...appState.textNotificationArr, val]),
}) as AppState;

export function addNotification(message: string, type: TextNotificationType) {
  appState.addTextNotification({
    message,
    type,
    time: new Date(),
  });
}
