import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STR_EMPTY } from "@/constants";
import { DbType, MainContenType } from "@/types/types";

// 定义 store 的类型
export interface CoreStoreState {
  currentDbType: DbType; // 当前数据库类型
  currentDbNme: string; // 当前数据库名
  currentTableName: string; // 当前表名
  mainContenType: MainContenType; // 主要区域的类型

  setCurrentDbType: (val: DbType) => void;
  setCurrentDbName: (val: string) => void;
  setCurrentTableName: (val: string) => void;
  setMainContenType: (val: MainContenType) => void;
  reset: () => void;
}

// 创建一个 store
export const useCoreStore = create<CoreStoreState>()(
  persist(
    (set) => ({
      currentDbType: STR_EMPTY,
      currentDbNme: "",
      currentTableName: "",
      mainContenType: STR_EMPTY,

      // 更新状态
      setCurrentDbType: (val: DbType) => set({ currentDbType: val }),
      setCurrentDbName: (val: string) => set({ currentDbNme: val }),
      setCurrentTableName: (val: string) => set({ currentTableName: val }),
      setMainContenType: (val: MainContenType) => set({ mainContenType: val }),

      // 重置状态
      reset: () =>
        set({
          currentDbType: STR_EMPTY,
          currentDbNme: "",
          currentTableName: "",
          mainContenType: STR_EMPTY,
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
