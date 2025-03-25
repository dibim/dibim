import {
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
  MAIN_CONTEN_TYPE_TABLE_EDITOR,
  MAIN_CONTEN_TYPE_WELCOME,
} from "@/constants";
import { useCoreStore } from "@/store";
import { AddConnection } from "./AddConnection";
import { Settings } from "./Settings";
import { SqlEditor } from "./SqlEditor";
import { TableEditor } from "./TableEditor";
import { Welcome } from "./Welcome";

export function MainContent() {
  const { mainContenType } = useCoreStore();

  return (
    <div className="h-full">
      {mainContenType === MAIN_CONTEN_TYPE_ADD_CONNECTION && <AddConnection />}
      {mainContenType === MAIN_CONTEN_TYPE_TABLE_EDITOR && <TableEditor />}
      {mainContenType === MAIN_CONTEN_TYPE_SETTINGS && <Settings />}
      {mainContenType === MAIN_CONTEN_TYPE_SQL_EDITOR && <SqlEditor />}
      {mainContenType === MAIN_CONTEN_TYPE_WELCOME && <Welcome />}
    </div>
  );
}
