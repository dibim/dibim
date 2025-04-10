import { useEffect } from "react";
import { subscribeKey } from "valtio/utils";
import { TabStore } from "@/store/tabs";
import { appState } from "@/store/valtio";

export const getActiveTabStore = (): TabStore | null => {
  if (!appState.activeTabId) return null;
  const activeTab = appState.tabs.find((t) => t.id === appState.activeTabId);
  return activeTab?.store || null;
};

export const useActiveTabStore = <K extends keyof TabStore>(key: K, callback: (value: TabStore[K]) => void) => {
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const checkAndSubscribe = () => {
      const store = getActiveTabStore();
      if (store) {
        unsubscribe = subscribeKey(store, key, callback);
      }
    };

    // 初始订阅
    checkAndSubscribe();

    // 监听活动标签页变化
    const globalUnsubscribe = subscribeKey(appState, "activeTabId", checkAndSubscribe);

    return () => {
      unsubscribe();
      globalUnsubscribe();
    };
  }, [key, callback]);
};
