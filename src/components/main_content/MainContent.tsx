import { useSnapshot } from "valtio";
import {
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_EDIT_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
  MAIN_CONTEN_TYPE_TABLE_EDITOR,
  MAIN_CONTEN_TYPE_WELCOME,
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
    <div className="h-full">
      {snap.mainContenType === MAIN_CONTEN_TYPE_ADD_CONNECTION && <Connection action={"add"} />}
      {snap.mainContenType === MAIN_CONTEN_TYPE_EDIT_CONNECTION && <Connection action={"edit"} />}
      {snap.mainContenType === MAIN_CONTEN_TYPE_TABLE_EDITOR && <TableEditor />}
      {snap.mainContenType === MAIN_CONTEN_TYPE_SETTINGS && <Settings />}
      {snap.mainContenType === MAIN_CONTEN_TYPE_SQL_EDITOR && <SqlEditor />}
      {snap.mainContenType === MAIN_CONTEN_TYPE_WELCOME && <Welcome />}
    </div>
  );
}
