import { useCoreStore } from "@/store";
import { DbConnections } from "@/types/conf_file";

export function DatabaseList() {
  const { configFile } = useCoreStore();

  const clickItem = (conn: DbConnections) => {
    //  TODO: 实现逻辑
  };

  return (
    <div>
      <div>DatabaseList</div>
      {configFile.dbConnections.length}
      {configFile.dbConnections.map((item, index) => (
        <p
          className="py-1 cursor-pointer flex justify-between"
          key={index}
          onClick={() => {
            clickItem(item);
          }}
        >
          <span>{item.name || "未命名"}</span>
          <span></span>
        </p>
      ))}
    </div>
  );
}
