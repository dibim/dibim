import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  // 当前连接颜色
  currentConnColor: string;
  setCurrentConnColor: (val: string) => void;

  // 当前数据库名
  currentDbNme: string;
  setCurrentDbName: (val: string) => void;

  // 当前表名
  currentTableName: string;
  setCurrentTableName: (val: string) => void;

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
      currentConnColor: "",
      setCurrentConnColor: (val: string) => set({ currentConnColor: val }),

      currentDbNme: "",
      setCurrentDbName: (val: string) => set({ currentDbNme: val }),

      currentTableName: "",
      setCurrentTableName: (val: string) => set({ currentTableName: val }),

      currentTableStructure: [],
      setCurrentTableStructure: (val: TableStructure[]) => set({ currentTableStructure: val }),

      sidebarOpen: true,
      setSidebarOpen: (val: boolean) => set({ sidebarOpen: val }),

      listBarOpen: true,
      setListBarOpen: (val: boolean) => set({ listBarOpen: val }),
      listBarType: LIST_BAR_TYPE_DB_LIST,
      setListBarType: (val: ListBarType) => set({ listBarType: val }),

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
          currentConnColor: "",
          currentDbNme: "",
          currentTableName: "",
          currentTableStructure: [],
          sidebarOpen: true,
          listBarType: LIST_BAR_TYPE_DB_LIST,
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
