import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义 store 的类型
export interface CoreStoreState {
  currentDbType: string; // 当前数据库类型
  currentDbNme: string; // 当前数据库名
  currentTables: string[]; // 当前模块名

  reset: () => void;
}

// 创建一个 store
export const useCoreStore = create<CoreStoreState>()(
  persist(
    (set) => ({
      currentDbType: "",
      currentDbNme: "",
      currentTables: [],

      // 更新状态
      setCurrentDbType: (val: string) => set({ currentDbType: val }),
      setCurrentDbName: (val: string) => set({ currentDbNme: val }),
      setCurrentTables: (val: string[]) => set({ currentTables: val }),

      // 重置状态
      reset: () =>
        set({
          currentDbType: "",
          currentTables: [],
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
