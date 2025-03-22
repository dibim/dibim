import { MAIN_CONTEN_TYPE_SQL_EDITOR, MAIN_CONTEN_TYPE_TABLE_DATA, STR_EMPTY } from "@/constants";
import { useCoreStore } from "@/store";
import { MainContentData } from "@/types/types";
import { SqlEditor } from "./SqlEditor";
import { TableData } from "./TableData";

export function MainContent(props: MainContentData) {
  const { mainContenType } = useCoreStore();

  return (
    <div className="h-full">
      <div>标签页(表结构 / DDL /数据)</div>
      {mainContenType === MAIN_CONTEN_TYPE_TABLE_DATA && <TableData />}
      {mainContenType === MAIN_CONTEN_TYPE_SQL_EDITOR && <SqlEditor />}
      {mainContenType === STR_EMPTY && <div>欢迎使用</div>}
    </div>
  );
}
