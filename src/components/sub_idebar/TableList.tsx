import { useEffect, useState } from "react";
import { MAIN_CONTEN_TYPE_TABLE_EDITOR } from "@/constants";
import { getAllTables } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { TableListData } from "@/types/types";

export function TableList(props: TableListData) {
  const { setCurrentTableName, setMainContenType, currentDbType } = useCoreStore();
  const [tablenames, setTablenames] = useState<string[]>([]);

  const getData = async () => {
    const res = await getAllTables(currentDbType);

    if (res) {
      setTablenames(res.data.sort());
    }
  };

  const clickItem = (item: string) => {
    setCurrentTableName(item);
    setMainContenType(MAIN_CONTEN_TYPE_TABLE_EDITOR);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div>TODO: 控制排序方式</div>
      {tablenames.map((item, index) => (
        <p
          className="py-1 cursor-pointer flex justify-between"
          key={index}
          onClick={() => {
            clickItem(item);
          }}
        >
          <span>{item}</span>
          <span>6kb</span>
        </p>
      ))}
    </div>
  );
}
