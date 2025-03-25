import {
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_CONTEN_TYPE_SQL_EDITOR,
  MAIN_CONTEN_TYPE_TABLE_EDITOR,
} from "@/constants";
import { useCoreStore } from "@/store";
import { MainContentData } from "@/types/types";
import { AddConnection } from "./AddConnection";
import { Settings } from "./Settings";
import { SqlEditor } from "./SqlEditor";
import { TableEditor } from "./TableEditor";

export function MainContent(props: MainContentData) {
  const { mainContenType, configFile } = useCoreStore();

  const renderMain = () => {
    return (
      <>
        {mainContenType === MAIN_CONTEN_TYPE_ADD_CONNECTION && <AddConnection />}
        {mainContenType === MAIN_CONTEN_TYPE_TABLE_EDITOR && <TableEditor />}
        {mainContenType === MAIN_CONTEN_TYPE_SETTINGS && <Settings />}
        {mainContenType === MAIN_CONTEN_TYPE_SQL_EDITOR && <SqlEditor />}
      </>
    );
  };

  return (
    <div className="h-full">
      {configFile.dbConnections.length === 0 ? (
        <div>
          <AddConnection />
        </div>
      ) : (
        renderMain()
      )}
    </div>
  );
}
