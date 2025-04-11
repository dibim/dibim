import { useEffect, useRef } from "react";
import { subscribeKey } from "valtio/utils";
import type { TabState } from "@/store/tabs";
import { coreState } from "@/store/valtio";

export const useActiveTabStore = <K extends keyof TabState>(
  tabId: string,
  key: K,
  callback: (value: TabState[K]) => void,
) => {
  // 使用 ref 存储稳定的回调引用和状态
  const callbackRef = useRef(callback);
  const isolationRef = useRef<{
    targetStore: TabState | null;
    unsubscribe: () => void;
    lastValue?: TabState[K];
    currentKey?: K;
  }>({
    targetStore: null,
    unsubscribe: () => {},
    lastValue: undefined,
    currentKey: undefined, // 初始化新增属性
  });

  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 主订阅逻辑
  useEffect(() => {
    const isolation = isolationRef.current;

    // 查找目标标签页
    const targetTab = coreState.tabs.find((t) => t.id === tabId);
    if (!targetTab) {
      console.warn(`Tab ${tabId} 不存在`);
      return;
    }

    // 获取目标存储对象
    const targetStore = targetTab.state;

    // 如果目标存储未变化且 key 相同，跳过重复订阅
    if (isolation.targetStore === targetStore && isolation.currentKey === key) {
      return;
    }

    // 清理旧订阅
    if (isolation.unsubscribe) {
      isolation.unsubscribe();
      console.log("清理旧订阅");
    }

    // 创建隔离的订阅逻辑
    const specificCallback = (value: TabState[K]) => {
      // 严格检查当前存储是否匹配
      if (isolation.targetStore === targetStore) {
        if (value !== isolation.lastValue) {
          isolation.lastValue = value;
          callbackRef.current(value);
        }
      }
    };

    // 建立新订阅
    console.log("建立隔离订阅", { tabId, key });
    isolation.unsubscribe = subscribeKey(targetStore, key, specificCallback);
    isolation.targetStore = targetStore;
    isolation.currentKey = key; // 正确设置当前键

    // 初始化同步状态
    const initialValue = targetStore[key];
    if (initialValue !== undefined) {
      isolation.lastValue = initialValue;
      callbackRef.current(initialValue);
    }

    return () => {
      if (isolation.targetStore === targetStore && isolation.currentKey === key) {
        // 现在 currentKey 已正确定义
        isolation.unsubscribe();
        isolation.targetStore = null;
        isolation.currentKey = undefined; // 清理时重置
        console.log("正常清理隔离订阅", { tabId, key });
      }
    };
  }, [tabId, key]);
};
