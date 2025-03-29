import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DB_TYPE_POSTGRESQL,
  MAIN_CONTEN_TYPE_WELCOME,
  MAIN_PASSWORD_DEFAULT,
  SUB_SIDEBAR_TYPE_DB_LIST,
} from "@/constants";
import { TableStructure } from "@/databases/types";
import { invoker } from "@/invoke";
import { ConfigFile } from "@/types/conf_file";
import { DbType, MainContenType, MainContentTab, SubSidebarType } from "@/types/types";
import { saveConfigFile } from "@/utils/config_file";

// 定义 store 的类型
export interface CoreStoreState {
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

  // 当前数据库名
  currentDbNme: string;
  setCurrentDbName: (val: string) => void;

  // 当前表名
  currentTableName: string;
  setCurrentTableName: (val: string) => void;

  // 当前表结构
  currentTableStructure: TableStructure[];
  setCurrentTableStructure: (val: TableStructure[]) => void;
  currentTableComment: string;
  setCurrentTableComment: (val: string) => void;

  // 侧边栏
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;

  // 次级侧边栏的类型
  subSidebarOpen: boolean;
  setSubSidebarOpen: (val: boolean) => void;
  subSidebarType: SubSidebarType;
  setSubSidebarType: (val: SubSidebarType) => void;

  // 主要区域的类型
  mainContenType: MainContenType;
  setMainContenType: (val: MainContenType) => void;
  mainContenTab: MainContentTab;
  setMainContenTab: (val: MainContentTab) => void;
  isAddingTable: boolean;
  setIsAddingTable: (val: boolean) => void;

  // 要编辑的数据库连接
  editDbConnIndex: number;
  setEditDbConnndex: (val: number) => void;

  // 重置
  reset: () => void;
}

const emptyConfigFile = {
  dbConnections: [],
  settings: {
    theme: "",
    timeFormat: "",
    lang: "",
  },
} as ConfigFile;

// 按照默认密码生成默认的 sha
export const defaultMainPasswordSha = await invoker.sha256(MAIN_PASSWORD_DEFAULT);

const storeName = "core-store";

// 其空当前 store 的数据
export function clearCoreStore() {
  localStorage.removeItem(storeName);
}

export const useCoreStore = create<CoreStoreState>()(
  persist(
    (set, get) => ({
      config: emptyConfigFile,
      setConfig: async (val: ConfigFile, notWrite?: boolean) => {
        set({ config: val });
        if (notWrite !== true) {
          await saveConfigFile(JSON.stringify(val), get().mainPasswordSha); // 保存到配置文件
        }
      },
      mainPasswordSha: defaultMainPasswordSha,
      setMainPasswordSha: (val: string) => set({ mainPasswordSha: val }),

      currentDbType: DB_TYPE_POSTGRESQL,
      setCurrentDbType: (val: DbType) => set({ currentDbType: val }),

      currentConnName: "",
      setCurrentConnName: (val: string) => set({ currentConnName: val }),

      currentDbNme: "",
      setCurrentDbName: (val: string) => set({ currentDbNme: val }),

      currentTableName: "",
      setCurrentTableName: (val: string) => set({ currentTableName: val }),

      currentTableStructure: [],
      setCurrentTableStructure: (val: TableStructure[]) => set({ currentTableStructure: val }),
      currentTableComment: "",
      setCurrentTableComment: (val: string) => set({ currentTableComment: val }),

      sidebarOpen: true,
      setSidebarOpen: (val: boolean) => set({ sidebarOpen: val }),

      subSidebarOpen: true,
      setSubSidebarOpen: (val: boolean) => set({ subSidebarOpen: val }),
      subSidebarType: SUB_SIDEBAR_TYPE_DB_LIST,
      setSubSidebarType: (val: SubSidebarType) => set({ subSidebarType: val }),

      mainContenType: MAIN_CONTEN_TYPE_WELCOME,
      setMainContenType: (val: MainContenType) => set({ mainContenType: val }),
      mainContenTab: "",
      setMainContenTab: (val: MainContentTab) => set({ mainContenTab: val }),
      isAddingTable: false,
      setIsAddingTable: (val: boolean) => set({ isAddingTable: val }),

      editDbConnIndex: 0,
      setEditDbConnndex: (val: number) => set({ editDbConnIndex: val }),

      // 重置状态
      reset: () =>
        set({
          config: emptyConfigFile,
          mainPasswordSha: defaultMainPasswordSha,
          currentDbType: DB_TYPE_POSTGRESQL,
          currentConnName: "",
          currentDbNme: "",
          currentTableName: "",
          currentTableStructure: [],
          currentTableComment: "",
          sidebarOpen: true,
          subSidebarType: SUB_SIDEBAR_TYPE_DB_LIST,
          mainContenType: MAIN_CONTEN_TYPE_WELCOME,
          isAddingTable: false,
          mainContenTab: "",
          editDbConnIndex: 0,
        }),
    }),
    {
      name: storeName, // localStorage key
    },
  ),
);

// 直接导出store的纯函数版本（无hook）, 便于在工具函数里调用
export const coreStore = useCoreStore;
