import { proxy } from "valtio";
import { LIST_BAR_DB, MAIN_PASSWORD_DEFAULT } from "@/constants";
import { DB_POSTGRESQL } from "@/databases/constants";
import { DbType } from "@/databases/types";
import { invoker } from "@/invoker";
import { ConfigFileMain } from "@/types/conf_file";
import { ListBarType, TextNotificationData, TextNotificationType } from "@/types/types";
import { saveConfigFile } from "@/utils/config_file";
import { TabState, createTabState } from "./tabs";

interface Tab {
  id: string;
  title: string;
  state: TabState;
}

interface CoreState {
  // 配置文件 | Configuration file
  config: ConfigFileMain;
  setConfig: (val: ConfigFileMain, notWriteToFile?: boolean) => Promise<void>;
  mainPasswordSha: string;
  setMainPasswordSha: (val: string) => void;

  // 关于 | About
  aboutOpen: boolean;
  setAboutOpen: (val: boolean) => void;

  // 侧边栏 | Sidebar
  sideBarWidth: number;
  setSideBarWidth: (val: number) => void;

  // 列表栏 | List bar
  listBarOpen: boolean;
  setListBarOpen: (val: boolean) => void;
  listBarWidth: number;
  setListBarWidth: (val: number) => void;
  listBarType: ListBarType;
  setListBarType: (val: ListBarType) => void;

  // 通知 | Notification
  textNotificationArr: TextNotificationData[];
  setTextNotification: (val: TextNotificationData[]) => void;

  // 标签页 | Tabs
  tabs: Tab[];
  setTabs: (val: Tab[]) => void;
  addTabs: (val: Tab) => void;
  activeTabId: string;
  setActiveTabId: (val: string) => void;

  // 数据库连接 | Database connection
  currentConnType: DbType;
  setCurrentConnType: (val: DbType) => void;
  currentConnName: string;
  setCurrentConnName: (val: string) => void;
  currentConnColor: string;
  setCurrentConnColor: (val: string) => void;
}

// 按照默认密码生成默认的 sha
// TODO: 使用更安全的存储方式
export const defaultMainPasswordSha = await invoker.sha256(MAIN_PASSWORD_DEFAULT);

const emptyConfigFile: ConfigFileMain = {
  dbConnections: [],
  settings: {
    colorScheme: "",
    timeFormat: "",
    lang: "",
  },
};

export const coreState = proxy<CoreState>({
  // 配置文件 | Configuration file
  config: emptyConfigFile,
  async setConfig(val: ConfigFileMain, notWrite?: boolean): Promise<void> {
    coreState.config = val;
    if (notWrite !== true) {
      await saveConfigFile(val, this.mainPasswordSha); // 保存到配置文件
    }
  },
  mainPasswordSha: defaultMainPasswordSha,
  setMainPasswordSha(val: string): void {
    this.mainPasswordSha = val;
  },

  // 关于 | About
  aboutOpen: false,
  setAboutOpen(val: boolean): void {
    this.aboutOpen = val;
  },

  // 侧边栏 | Sidebar
  sideBarWidth: 0,
  setSideBarWidth(val: number): void {
    this.sideBarWidth = val;
  },

  // 列表栏 | List bar
  listBarOpen: true,
  setListBarOpen(val: boolean): void {
    this.listBarOpen = val;
  },
  listBarWidth: 0,
  setListBarWidth(val: number): void {
    this.listBarWidth = val;
  },
  listBarType: LIST_BAR_DB,
  setListBarType(val: ListBarType): void {
    this.listBarType = val;
  },

  // 通知 | Notification
  textNotificationArr: [],
  setTextNotification(val: TextNotificationData[]): void {
    this.textNotificationArr = val;
  },

  // Tabs
  tabs: [],
  setTabs(val: Tab[]): void {
    this.tabs = val;
  },
  addTabs(val: Tab): void {
    this.tabs = [...this.tabs, val];
  },
  activeTabId: "",
  setActiveTabId(val: string): void {
    this.activeTabId = val;
  },

  // 数据库连接 | Database connection
  currentConnType: DB_POSTGRESQL,
  setCurrentConnType(val: DbType) {
    this.currentConnType = val;
  },
  currentConnName: "",
  setCurrentConnName(val: string) {
    this.currentConnName = val;
  },
  currentConnColor: "",
  setCurrentConnColor(val: string) {
    this.currentConnColor = val;
  },
}) as CoreState;

// 
// 以下是工具函数 | Here are the utility functions
// 

export function addNotification(message: string, type: TextNotificationType) {
  coreState.setTextNotification([
    ...coreState.textNotificationArr,
    {
      message,
      type,
      time: new Date(),
    },
  ]);
}

export function addTab() {
  const tabId = `${new Date().getTime()}`;
  const newTab: Tab = {
    id: tabId,
    title: `Tab ${coreState.tabs.length + 1}`,
    state: createTabState(),
  };

  coreState.setTabs([...coreState.tabs, newTab]);
  coreState.setActiveTabId(tabId);
}

export function delTab(id: string) {
  const newTabs = coreState.tabs.filter((item) => item.id !== id);
  coreState.setTabs(newTabs);

  const existId = coreState.tabs.some((item) => item.id === coreState.activeTabId);
  if (!existId && coreState.tabs) {
    coreState.setActiveTabId(newTabs[0].id);
  } else {
    coreState.setActiveTabId("");
  }
}
