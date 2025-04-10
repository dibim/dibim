import { proxy } from "valtio";
import { LIST_BAR_DB, MAIN_PASSWORD_DEFAULT } from "@/constants";
import { DB_POSTGRESQL } from "@/databases/constants";
import { DbType } from "@/databases/types";
import { invoker } from "@/invoker";
import { ConfigFileMain } from "@/types/conf_file";
import { ListBarType, TextNotificationData, TextNotificationType } from "@/types/types";
import { saveConfigFile } from "@/utils/config_file";
import { AppTab, createTabState } from "./tabs";

interface AppState {
  // 配置文件相关
  config: ConfigFileMain;
  setConfig: (val: ConfigFileMain, notWriteToFile?: boolean) => Promise<void>;
  mainPasswordSha: string;
  setMainPasswordSha: (val: string) => void;

  // 关于
  aboutOpen: boolean;
  setAboutOpen: (val: boolean) => void;

  // 侧边栏的宽度
  sideBarWidth: number;
  setSideBarWidth: (val: number) => void;
  // 大屏幕下侧边栏的宽度, 传递给 SidebarProvider
  sideBarWidthPc: string;
  setSideBarWidthPc: (val: string) => void;
  // 小屏幕下侧边栏的宽度, 传递给 SidebarProvider
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

  // 通知
  textNotificationArr: TextNotificationData[];
  addTextNotification: (val: TextNotificationData) => void;

  // Tab
  tabs: AppTab[];
  setTabs: (val: AppTab[]) => void;
  addTabs: (val: AppTab) => void;
  activeTabId: string;
  setActiveTabId: (val: string) => void;

  //
  // 当前连接类型
  currentConnType: DbType;
  setCurrentConnType: (val: DbType) => void;
  // 当前连接名
  currentConnName: string;
  setCurrentConnName: (val: string) => void;
  // 当前连接颜色
  currentConnColor: string;
  setCurrentConnColor: (val: string) => void;
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
  async setConfig(val: ConfigFileMain, notWrite?: boolean): Promise<void> {
    appState.config = val;
    if (notWrite !== true) {
      await saveConfigFile(val, appState.mainPasswordSha); // 保存到配置文件
    }
  },
  mainPasswordSha: defaultMainPasswordSha,
  setMainPasswordSha(val: string): void {
    appState.mainPasswordSha = val;
  },

  aboutOpen: false,
  setAboutOpen(val: boolean): void {
    appState.aboutOpen = val;
  },

  sideBarWidth: 0,
  setSideBarWidth(val: number): void {
    appState.sideBarWidth = val;
  },
  sideBarWidthPc: "10rem",
  setSideBarWidthPc(val: string): void {
    appState.sideBarWidthPc = val;
  },
  sideBarWidthMobile: "20rem",
  setSideBarWidthMobile(val: string): void {
    appState.sideBarWidthMobile = val;
  },

  listBarOpen: true,
  setListBarOpen(val: boolean): void {
    appState.listBarOpen = val;
  },
  listBarWidth: 0,
  setListBarWidth(val: number): void {
    appState.listBarWidth = val;
  },
  listBarType: LIST_BAR_DB,
  setListBarType(val: ListBarType): void {
    appState.listBarType = val;
  },

  textNotificationArr: [],
  addTextNotification(val: TextNotificationData): void {
    appState.textNotificationArr = [...appState.textNotificationArr, val];
  },

  // Tab
  tabs: [],
  setTabs(val: AppTab[]): void {
    appState.tabs = val;
  },
  addTabs(val: AppTab): void {
    appState.tabs = [...appState.tabs, val];
  },
  activeTabId: "",
  setActiveTabId(val: string): void {
    // console.log("设置标签页  ::: ", val);
    appState.activeTabId = val;
  },

  // 当前连接类型
  currentConnType: DB_POSTGRESQL,
  setCurrentConnType(val: DbType) {
    this.currentConnType = val;
  },
  // 当前连接名
  currentConnName: "",
  setCurrentConnName(val: string) {
    this.currentConnName = val;
  },
  // 当前连接颜色
  currentConnColor: "",
  setCurrentConnColor(val: string) {
    this.currentConnColor = val;
  },
}) as AppState;

export function addNotification(message: string, type: TextNotificationType) {
  appState.addTextNotification({
    message,
    type,
    time: new Date(),
  });
}

export function addTab() {
  const tabId = `${new Date().getTime()}`;
  const newTab: AppTab = {
    id: tabId,
    title: `Tab ${appState.tabs.length + 1}`,
    store: createTabState(),
  };

  appState.setTabs([...appState.tabs, newTab]);
  appState.setActiveTabId(tabId);
}

export function delTab(id: string) {
  const newTabs = appState.tabs.filter((item) => item.id !== id);
  appState.setTabs(newTabs);

  const existId = appState.tabs.some((item) => item.id === appState.activeTabId);
  if (!existId && appState.tabs) {
    appState.setActiveTabId(newTabs[0].id);
  } else {
    appState.setActiveTabId("");
  }
}
