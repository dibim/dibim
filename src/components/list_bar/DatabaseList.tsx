import { useEffect, useState } from "react";
import { Edit, Trash, Unlink } from "lucide-react";
import { useSnapshot } from "valtio";
import { subscribeKey } from "valtio/utils";
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
import { invoker } from "@/invoker";
import { appState } from "@/store/valtio";
import { DbConnections } from "@/types/conf_file";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyList } from "../EmptyList";
import { ListItem, ListWithAction } from "../ListWithAction";

export function DatabaseList() {
  const snap = useSnapshot(appState);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [itemIndex, setItemIndex] = useState<number>(-1);

  // 删除
  function delItem() {
    const newConfig = {
      ...appState.config,
      dbConnections: [
        ...appState.config.dbConnections.slice(0, itemIndex),
        ...appState.config.dbConnections.slice(itemIndex + 1),
      ],
    };
    appState.setConfig(newConfig);

    setShowDialog(false);
  }

  // 点击连接
  async function clickConn(conn: DbConnections) {
    appState.setCurrentConnName(conn.name); // TODO: 先设置, 否则 connect 里获取不到

    const res = await connect({
      dbName: conn.dbName,
      host: conn.host,
      password: conn.password,
      port: conn.port,
      user: conn.user,
    });

    if (res) {
      if (res.errorMessage !== "" && !res.errorMessage.includes("Duplicate connection name")) {
        // TODO: 优化一下报错
        console.log("打开数据库连接出错: ", res && res.errorMessage);
      } else {
        appState.setCurrentDbName(conn.dbName);
        appState.setCurrentConnColor(conn.color);
        appState.setMainContenType(MAIN_CONTEN_TYPE_TABLE_EDITOR);
        appState.setListBarType(LIST_BAR_TYPE_TABLE_LIST);
      }
    }
  }

  // 列表数据
  const [listData, setListData] = useState<ListItem[]>([]);
  function getData() {
    const arr: ListItem[] = [];
    appState.config.dbConnections.map((item, index) => {
      arr.push({
        id: item.name,
        content: (
          <div className="flex cursor-pointer" style={{ borderBottom: `2px  solid ${item.color}` }}>
            <div className="pe-2">
              {item.dbType === DB_TYPE_MYSQL && <MysqlLogo className="w-6 h-6" />}
              {item.dbType === DB_TYPE_POSTGRESQL && <PostgresqlLogo className="w-6 h-6" />}
              {item.dbType === DB_TYPE_SQLITE && <SqliteLogo className="w-6 h-6" />}
            </div>

            <div>{item.name}</div>
          </div>
        ),
        contentOnClick: async () => {
          clickConn(item);
        },
        menuItems: [
          {
            label: "编辑",
            onClick: () => {
              appState.setMainContenType(MAIN_CONTEN_TYPE_EDIT_CONNECTION);
            },
            icon: <Edit className="h-4 w-4" />,
          },

          {
            label: "断开链接",
            onClick: () => {
              invoker.disconnectSql(appState.currentConnName);
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
  }

  useEffect(() => {
    getData();

    // 监听 store 的变化
    const unsubscribe = subscribeKey(appState, "currentTableName", (_value: any) => {
      getData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {!snap.config.dbConnections ? (
        <EmptyList />
      ) : (
        <ListWithAction items={listData} itemClassName="py-2 cursor-pointer" />
      )}

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
