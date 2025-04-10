import React from "react";
import { useContext } from "react";
import { TabState } from "@/store/tabs";
import { appState } from "./store/valtio";

// Context
export const TabStateContext = React.createContext<TabState | null>(null);

export const useTabState = (): TabState => {
  const context = useContext(TabStateContext);
  if (!context) {
    throw new Error("useTabState must be used within a TabContainer");
  }
  return context;
};

export function getTab() {
  const tab = appState.tabs.filter((item) => item.id === appState.activeTabId);
  if (tab.length > 0) return tab[0];
  return null;
}
