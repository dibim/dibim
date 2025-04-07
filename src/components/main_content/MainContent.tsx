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
import { appState } from "@/store/valtio";
import { Connection } from "./Connection";
import { Settings } from "./Settings";
import { SqlEditor } from "./SqlEditor";
import { TableEditor } from "./TableEditor";
import { Welcome } from "./Welcome";

export function MainContent() {
  const snap = useSnapshot(appState);

  return (
    <div style={{ height: `calc(100vh - var(--spacing) * ${HEDAER_H})` }}>
      {snap.mainContenType === MAIN_AREA_ADD_CONNECTION && <Connection action={"add"} />}
      {snap.mainContenType === MAIN_AREA_EDIT_CONNECTION && <Connection action={"edit"} />}
      {snap.mainContenType === MAIN_AREA_TABLE_EDITOR && <TableEditor />}
      {snap.mainContenType === MAIN_AREA_SETTINGS && <Settings />}
      {snap.mainContenType === MAIN_AREA_SQL_EDITOR && <SqlEditor />}
      {snap.mainContenType === MAIN_AREA_WELCOME && <Welcome />}
    </div>
  );
}
