import { useCoreStore } from "@/store";
import { DbConnections } from "@/types/conf_file";
import { EmptyList } from "./EmptyList";

export function DatabaseList() {
  const { config: configFile } = useCoreStore();

  const clickItem = (conn: DbConnections) => {
    //  TODO: 实现逻辑, 点击后打开这个数据库的表
    console.log("clickItem conn", conn);
  };

  return (
    <div>
      <div>DatabaseList</div>

      {!configFile.dbConnections && <EmptyList />}

      {configFile.dbConnections &&
        configFile.dbConnections.map((item, index) => (
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
