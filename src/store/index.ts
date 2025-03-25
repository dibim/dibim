import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DB_TYPE_POSTGRESQL,
  DEFAULT_MAIN_PASSWORD,
  MAIN_CONTEN_TYPE_WELCOME,
  SUB_SIDEBAR_TYPE_DB_LIST,
} from "@/constants";
import { TableStructure } from "@/databases/types";
import { invoker } from "@/invoke";
import { ConfigFile } from "@/types/conf_file";
import { DbType, MainContenType, SubSidebarType } from "@/types/types";
import { saveConfigFile } from "@/utils/config_file";

// 定义 store 的类型
export interface CoreStoreState {
  // 配置文件相关
  config: ConfigFile;
  setConfig: (val: ConfigFile, notWriteToFile?: boolean) => void;
  mainPasswordSha: string;
  setMainPasswordSha: (val: string) => void;

  // 当前数据库类型
  currentDbType: DbType;
  setCurrentDbType: (val: DbType) => void;

  // 当前数据库名
  currentDbNme: string;
  setCurrentDbName: (val: string) => void;

  // 当前表名
  currentTableName: string;
  setCurrentTableName: (val: string) => void;

  // 当前表结构
  currentTableStructure: TableStructure[];
  setCurrentTableStructure: (val: TableStructure[]) => void;

  // 次级侧边栏的类型
  subSidebarType: SubSidebarType;
  setSubSidebarType: (val: SubSidebarType) => void;

  // 主要区域的类型
  mainContenType: MainContenType;
  setMainContenType: (val: MainContenType) => void;

  // 侧边栏
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;

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

export const defaultMainPasswordSha = await invoker.sha256(DEFAULT_MAIN_PASSWORD);

// 创建一个 store
export const useCoreStore = create<CoreStoreState>()(
  persist(
    (set, get) => ({
      config: emptyConfigFile,
      setConfig: (val: ConfigFile, notWrite?: boolean) => {
        set({ config: val });
        if (notWrite !== true) {
          saveConfigFile(JSON.stringify(val), get().mainPasswordSha); // 保存到配置文件
        }
      },
      mainPasswordSha: defaultMainPasswordSha,
      setMainPasswordSha: (val: string) => set({ mainPasswordSha: val }),

      currentDbType: DB_TYPE_POSTGRESQL,
      setCurrentDbType: (val: DbType) => set({ currentDbType: val }),

      currentDbNme: "",
      setCurrentDbName: (val: string) => set({ currentDbNme: val }),

      currentTableName: "",
      setCurrentTableName: (val: string) => set({ currentTableName: val }),

      currentTableStructure: [],
      setCurrentTableStructure: (val: TableStructure[]) => set({ currentTableStructure: val }),

      subSidebarType: SUB_SIDEBAR_TYPE_DB_LIST,
      setSubSidebarType: (val: SubSidebarType) => set({ subSidebarType: val }),

      mainContenType: MAIN_CONTEN_TYPE_WELCOME,
      setMainContenType: (val: MainContenType) => set({ mainContenType: val }),

      sidebarOpen: true,
      setSidebarOpen: (val: boolean) => set({ sidebarOpen: val }),

      // 重置状态
      reset: () =>
        set({
          config: emptyConfigFile,
          mainPasswordSha: defaultMainPasswordSha,
          currentDbType: DB_TYPE_POSTGRESQL,
          currentDbNme: "",
          currentTableName: "",
          currentTableStructure: [],
          subSidebarType: SUB_SIDEBAR_TYPE_DB_LIST,
          mainContenType: MAIN_CONTEN_TYPE_WELCOME,
          sidebarOpen: true,
        }),
    }),
    {
      name: "core-store", // localStorage key
    },
  ),
);
