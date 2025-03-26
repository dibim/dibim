import { useEffect, useState } from "react";
import { MAIN_CONTEN_TYPE_TABLE_EDITOR } from "@/constants";
import { getAllTables } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { EmptyList } from "./EmptyList";

// TODO: 排序方式支持按表名和表的大小排序

export function TableList() {
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
      <div>TableList</div>

      {!tablenames || (tablenames.length === 0 && <EmptyList />)}

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
