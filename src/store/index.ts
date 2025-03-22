import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义 store 的类型
export interface CoreStoreState {
  currentDbType: string; // 当前数据库类型
  currentDbNme: string; // 当前数据库名
  currentTable: string; // 当前表名

  setCurrentDbType: (val: string) => void;
  setCurrentDbName: (val: string) => void;
  setCurrentTable: (val: string) => void;
  reset: () => void;
}

// 创建一个 store
export const useCoreStore = create<CoreStoreState>()(
  persist(
    (set) => ({
      currentDbType: "",
      currentDbNme: "",
      currentTable: "",

      // 更新状态
      setCurrentDbType: (val: string) => set({ currentDbType: val }),
      setCurrentDbName: (val: string) => set({ currentDbNme: val }),
      setCurrentTable: (val: string) => set({ currentTable: val }),

      // 重置状态
      reset: () =>
        set({
          currentDbType: "",
          currentDbNme: "",
          currentTable: "",
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
