import { proxy } from "valtio";
import { LIST_BAR_DB, MAIN_PASSWORD_DEFAULT } from "@/constants";
import { DB_POSTGRESQL } from "@/databases/constants";
import { DbType } from "@/databases/types";
import { invoker } from "@/invoker";
import { ConfigFileMain } from "@/types/conf_file";
import { ListBarType, TextNotificationData, TextNotificationType } from "@/types/types";
import { saveConfigFile } from "@/utils/config_file";
import { TabState, createTabState } from "./tabs";

// 标签页类型
interface Tab {
  id: string;
  title: string;
  state: TabState;
}

interface CoreState {
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
  setTextNotification: (val: TextNotificationData[]) => void;

  // Tab
  tabs: Tab[];
  setTabs: (val: Tab[]) => void;
  addTabs: (val: Tab) => void;
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

export const coreState = proxy<CoreState>({
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

  aboutOpen: false,
  setAboutOpen(val: boolean): void {
    this.aboutOpen = val;
  },

  sideBarWidth: 0,
  setSideBarWidth(val: number): void {
    this.sideBarWidth = val;
  },

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

  textNotificationArr: [],
  setTextNotification(val: TextNotificationData[]): void {
    this.textNotificationArr = val;
  },

  // Tab
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
}) as CoreState;

// 以下是工具函数

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
