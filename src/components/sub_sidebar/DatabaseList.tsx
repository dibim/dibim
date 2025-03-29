import { useEffect, useState } from "react";
import { Edit, Trash, Unlink } from "lucide-react";
import MysqlLogo from "@/assets/db_logo/mysql.svg?react";
import PostgresqlLogo from "@/assets/db_logo/postgresql.svg?react";
import SqliteLogo from "@/assets/db_logo/sqlite.svg?react";
import {
  DB_TYPE_MYSQL,
  DB_TYPE_POSTGRESQL,
  DB_TYPE_SQLITE,
  LIST_BAR_TYPE_TABLE_LIST,
  MAIN_CONTEN_TYPE_EDIT_CONNECTION,
  MAIN_CONTEN_TYPE_TABLE_EDITOR,
} from "@/constants";
import { connect } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { DbConnections } from "@/types/conf_file";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyList } from "../EmptyList";
import { ListItem, ListWithAction } from "../ListWithAction";

export function DatabaseList() {
  const { config, setConfig, setMainContenType, setListBarType } = useCoreStore();

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
      setListBarType(LIST_BAR_TYPE_TABLE_LIST);
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
        content: (
          <div className="flex cursor-pointer">
            <div className="pe-2">
              {item.dbType === DB_TYPE_MYSQL && <MysqlLogo className="w-6 h-6" />}
              {item.dbType === DB_TYPE_POSTGRESQL && <PostgresqlLogo className="w-6 h-6" />}
              {item.dbType === DB_TYPE_SQLITE && <SqliteLogo className="w-6 h-6" />}
            </div>

            <div className={`border-b-2 border-b-[${item.color}]`}>{item.name}</div>
          </div>
        ),
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
    useCoreStore.subscribe((_state, _prevState) => {
      getData();
    });
  }, []);

  return (
    <>
      {!config.dbConnections ? <EmptyList /> : <ListWithAction items={listData} itemClassName="py-2 cursor-pointer" />}

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
