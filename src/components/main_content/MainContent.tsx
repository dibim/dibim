import {
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_EDIT_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
  MAIN_CONTEN_TYPE_TABLE_EDITOR,
  MAIN_CONTEN_TYPE_WELCOME,
} from "@/constants";
import { useCoreStore } from "@/store";
import { Connection } from "./Connection";
import { Settings } from "./Settings";
import { SqlEditor } from "./SqlEditor";
import { TableEditor } from "./TableEditor";
import { Welcome } from "./Welcome";

export function MainContent() {
  const { mainContenType } = useCoreStore();

  return (
    <div className="h-full">
      {mainContenType === MAIN_CONTEN_TYPE_ADD_CONNECTION && <Connection action={"add"} />}
      {mainContenType === MAIN_CONTEN_TYPE_EDIT_CONNECTION && <Connection action={"edit"} />}
      {mainContenType === MAIN_CONTEN_TYPE_TABLE_EDITOR && <TableEditor />}
      {mainContenType === MAIN_CONTEN_TYPE_SETTINGS && <Settings />}
      {mainContenType === MAIN_CONTEN_TYPE_SQL_EDITOR && <SqlEditor />}
      {mainContenType === MAIN_CONTEN_TYPE_WELCOME && <Welcome />}
    </div>
  );
}
