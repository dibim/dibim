import { MAIN_CONTEN_TYPE_SQL_EDITOR, MAIN_CONTEN_TYPE_TABLE_EDITOR, STR_EMPTY } from "@/constants";
import { useCoreStore } from "@/store";
import { MainContentData } from "@/types/types";
import { SqlEditor } from "./SqlEditor";
import { TableEditor } from "./TableEditor";

export function MainContent(props: MainContentData) {
  const { mainContenType, configFile } = useCoreStore();

  const renderMain = () => {
    return (
      <div className="h-full">
        {mainContenType === MAIN_CONTEN_TYPE_TABLE_EDITOR && <TableEditor />}
        {mainContenType === MAIN_CONTEN_TYPE_SQL_EDITOR && <SqlEditor />}
        {mainContenType === STR_EMPTY && <div>欢迎使用</div>}
      </div>
    );
  };

  return (
    <div className="h-full">
      {configFile.dbConnections.length === 0 ? (
        <div>
          <p>TODO: 新建连接</p>
        </div>
      ) : (
        renderMain()
      )}
    </div>
  );
}
