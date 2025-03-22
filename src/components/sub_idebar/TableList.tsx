import { useCoreStore } from "@/store";
import { TableListData } from "@/types/types";

export function TableList(props: TableListData) {
  const { setCurrentTable } = useCoreStore();
  return (
    <div>
      {props.tableNameArray && (
        <div>
          {props.tableNameArray.map((item, index) => (
            <p
              className="py-1 cursor-pointer flex justify-between"
              key={index}
              onClick={() => {
                setCurrentTable(item);
              }}
            >
              <span>{item}</span>
              <span>123</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
