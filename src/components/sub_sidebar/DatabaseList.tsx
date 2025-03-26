import { useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import { SUB_SIDEBAR_TYPE_TABLE_LIST } from "@/constants";
import { useCoreStore } from "@/store";
import { DbConnections } from "@/types/conf_file";
import { DropdownList } from "../DropdownList";
import { EmptyList } from "../EmptyList";

export function DatabaseList() {
  const { config, setCurrentDbName, setSubSidebarType } = useCoreStore();

  const clickTableName = (conn: DbConnections) => {
    //  TODO: 检查啊, 没有连接的要啊

    setCurrentDbName(conn.dbname);
    setSubSidebarType(SUB_SIDEBAR_TYPE_TABLE_LIST);
  };

  const listData = [
    {
      id: 1,
      content: <div>Document.pdf</div>,
      menuItems: [
        {
          label: "编辑",
          onClick: () => console.log("Edit file 1"),
          icon: <Edit className="h-4 w-4" />,
        },

        {
          label: "删除",
          onClick: () => console.log("Delete file 1"),
          icon: <Trash className="h-4 w-4" />,
          disabled: true,
        },
      ],
    },
  ];

  // TODO: 动态生成列表里的数据
  const getData = () => {
    //
  };

  useEffect(() => {
    getData();
  }, [config]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      {!config.dbConnections && <EmptyList />}

      {config.dbConnections &&
        config.dbConnections.map((item, index) => (
          <DropdownList items={listData} itemClassName="py-2 cursor-pointer" />
        ))}
    </div>
  );
}
