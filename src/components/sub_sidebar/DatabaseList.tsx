import { useEffect, useState } from "react";
import { Edit, Trash, Unlink } from "lucide-react";
import {
  MAIN_CONTEN_TYPE_EDIT_CONNECTION,
  MAIN_CONTEN_TYPE_TABLE_EDITOR,
  SUB_SIDEBAR_TYPE_TABLE_LIST,
} from "@/constants";
import { connect } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { DbConnections } from "@/types/conf_file";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyList } from "../EmptyList";
import { ListItem, ListWithAction } from "../ListWithAction";

export function DatabaseList() {
  const { config, setConfig, setMainContenType, setSubSidebarType } = useCoreStore();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [itemIndex, setItemIndex] = useState<number>(-1);

  // 删除
  const delItem = () => {
    config.dbConnections.splice(itemIndex, 1);
    setConfig(config);

    setShowDialog(false);
  };

  // 点击连接
  const clickConn = async (conn: DbConnections) => {
    const res = await connect({
      dbName: conn.dbName,
      host: conn.host,
      password: conn.password,
      port: conn.port,
      user: conn.user,
    });

    if (res && res.errorMessage === "") {
      setSubSidebarType(SUB_SIDEBAR_TYPE_TABLE_LIST);
      setMainContenType(MAIN_CONTEN_TYPE_TABLE_EDITOR);
    } else {
      // TODO: 优化一下报错
      console.log("打开数据库连接出错: ", res && res.errorMessage);
    }
  };

  // 列表数据
  const [listData, setListData] = useState<ListItem[]>([]);
  const getData = () => {
    const arr: ListItem[] = [];
    config.dbConnections.map((item, index) => {
      arr.push({
        id: item.name,
        content: <div className="cursor-pointer">{item.name}</div>,
        contentOnClick: async () => {
          clickConn(item);
        },
        menuItems: [
          {
            label: "编辑",
            onClick: () => {
              setMainContenType(MAIN_CONTEN_TYPE_EDIT_CONNECTION);
            },
            icon: <Edit className="h-4 w-4" />,
          },

          {
            label: "断开链接",
            onClick: () => {
              //  TODO:
            },
            icon: <Unlink className="h-4 w-4" color="var(--fvm-warning-clr)" />,
          },

          {
            label: "删除",
            onClick: () => {
              setItemIndex(index);
              setShowDialog(true);
            },
            icon: <Trash className="h-4 w-4" color="var(--fvm-danger-clr)" />,
          },
        ],
      });
    });

    setListData(arr);
  };

  useEffect(() => {
    getData();

    // 监听 store 的变化
    useCoreStore.subscribe(() => {
      getData();
    });
  }, []);

  return (
    <>
      <div>
        {!config.dbConnections && <EmptyList />}

        {config.dbConnections && <ListWithAction items={listData} itemClassName="py-2 cursor-pointer" />}
      </div>

      <ConfirmDialog
        open={showDialog}
        title={`确认要删除吗`}
        content={""}
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialog(false);
        }}
        okText={"确定"}
        okCb={delItem}
      />
    </>
  );
}
