import React from "react";
import { useContext } from "react";
import { TabsState } from "@/store/tabs";
import { coreState } from "./store/core";

// Context
export const TabStateContext = React.createContext<TabsState | null>(null);

export const useTabState = (): TabsState => {
  const context = useContext(TabStateContext);
  if (!context) {
    throw new Error("useTabState must be used within a TabContainer");
  }
  return context;
};

export function getTab() {
  const tab = coreState.tabs.filter((item) => item.id === coreState.activeTabId);
  if (tab.length > 0) return tab[0];
  return null;
}
