import { ReactNode } from "react";
import { Plus, SquareX } from "lucide-react";
import { useSnapshot } from "valtio";
import {
  HEDAER_H,
  MAIN_AREA_ADD_CONNECTION,
  MAIN_AREA_EDIT_CONNECTION,
  MAIN_AREA_SETTINGS,
  MAIN_AREA_SQL_EDITOR,
  MAIN_AREA_TABLE_EDITOR,
  MAIN_AREA_WELCOME,
} from "@/constants";
import { TabStateContext, useTabState } from "@/context";
import { TabsState } from "@/store/tabs";
import { addTab, coreState, delTab } from "@/store/core";
import { Connection } from "./Connection";
import { Settings } from "./Settings";
import { SqlEditor } from "./SqlEditor";
import { TableEditor } from "./TableEditor";
import { Welcome } from "./Welcome";

interface TabContainerProps {
  state: TabsState;
  children?: ReactNode;
}

const MainAreaComponent = () => {
  const state = useTabState();
  const snap = useSnapshot(state);

  return (
    <div style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}>
      {snap.mainAreaType === MAIN_AREA_ADD_CONNECTION && <Connection action={"add"} />}
      {snap.mainAreaType === MAIN_AREA_EDIT_CONNECTION && <Connection action={"edit"} />}
      {snap.mainAreaType === MAIN_AREA_TABLE_EDITOR && <TableEditor />}
      {snap.mainAreaType === MAIN_AREA_SETTINGS && <Settings />}
      {snap.mainAreaType === MAIN_AREA_SQL_EDITOR && <SqlEditor />}
      {snap.mainAreaType === MAIN_AREA_WELCOME && <Welcome />}
    </div>
  );
};

const TabContainer = ({ state, children }: TabContainerProps) => {
  return <TabStateContext.Provider value={state}>{children}</TabStateContext.Provider>;
};

export const MainArea = () => {
  const coreSnap = useSnapshot(coreState);

  return (
    <>
      <div className="w-full flex gap-2">
        {coreSnap.tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex px-2 ${coreSnap.activeTabId === tab.id ? "text-muted bg-muted-foreground" : ""}`}
          >
            <button onClick={() => coreState.setActiveTabId(tab.id)}>{tab.title}</button>
            <div
              className="ps-2"
              onClick={() => {
                delTab(tab.id);
              }}
            >
              <SquareX />
            </div>
          </div>
        ))}

        <button onClick={addTab}>
          <Plus />
        </button>
      </div>

      <div className="p-2 border-t">
        {coreSnap.tabs.map((tab, index) => (
          <div key={tab.id} style={{ display: coreSnap.activeTabId === tab.id ? "block" : "none" }}>
            <TabContainer state={coreState.tabs[index].state}>
              <MainAreaComponent />
            </TabContainer>
          </div>
        ))}
      </div>
    </>
  );
};
