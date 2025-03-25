import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STR_EMPTY } from "@/constants";
import { TableStructure } from "@/databases/types";
import { ConfigFile } from "@/types/conf_file";
import { DbType, MainContenType } from "@/types/types";

// 定义 store 的类型
export interface CoreStoreState {
  // 配置文件
  configFile: ConfigFile;
  setConfigFile: (val: ConfigFile) => void;

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

  // 主要区域的类型
  mainContenType: MainContenType;
  setMainContenType: (val: MainContenType) => void;

  // 侧边栏
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;

  // 重置
  reset: () => void;
}

// 创建一个 store
export const useCoreStore = create<CoreStoreState>()(
  persist(
    (set) => ({
      configFile: {
        dbConnections: [],
        settings: {
          theme: "",
          timeFormat: "",
          lang: ""
        },
      },
      setConfigFile: (val: ConfigFile) => set({ configFile: val }),

      currentDbType: STR_EMPTY,
      setCurrentDbType: (val: DbType) => set({ currentDbType: val }),

      currentDbNme: "",
      setCurrentDbName: (val: string) => set({ currentDbNme: val }),

      currentTableName: "",
      setCurrentTableName: (val: string) => set({ currentTableName: val }),

      // 当前表结构
      currentTableStructure: [],
      setCurrentTableStructure: (val: TableStructure[]) => set({ currentTableStructure: val }),

      mainContenType: STR_EMPTY,
      setMainContenType: (val: MainContenType) => set({ mainContenType: val }),

      sidebarOpen: true,
      setSidebarOpen: (val: boolean) => set({ sidebarOpen: val }),

      // 重置状态
      reset: () =>
        set({
          currentDbType: STR_EMPTY,
          currentDbNme: "",
          currentTableName: "",
          currentTableStructure: [],
          mainContenType: STR_EMPTY,
          sidebarOpen: true,
        }),
    }),
    {
      name: "core-store", // localStorage key
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    },
  ),
);
