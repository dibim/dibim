import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit, Trash, Unlink } from "lucide-react";
import { useSnapshot } from "valtio";
import { subscribeKey } from "valtio/utils";
import MysqlLogo from "@/assets/db_logo/mysql.svg?react";
import PostgresqlLogo from "@/assets/db_logo/postgresql.svg?react";
import SqliteLogo from "@/assets/db_logo/sqlite.svg?react";
import { LIST_BAR_TABLE, MAIN_AREA_EDIT_CONNECTION, MAIN_AREA_TABLE_EDITOR } from "@/constants";
import { getTab } from "@/context";
import { connect } from "@/databases/adapter,";
import { DB_MYSQL, DB_POSTGRESQL, DB_SQLITE } from "@/databases/constants";
import { invoker } from "@/invoker";
import { addNotification, appState } from "@/store/valtio";
import { DbConnections } from "@/types/conf_file";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyList } from "../EmptyList";
import { ListItem, ListWithAction } from "../ListWithAction";

export function DatabaseList() {
  const { t } = useTranslation();

  const snap = useSnapshot(appState);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [itemIndex, setItemIndex] = useState<number>(-1);

  function handleDelConn() {
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

  async function handleClickConn(conn: DbConnections) {
    const tab = getTab();
    if (tab === null) return;
    const store = tab.store;

    // 先设置这两项, 否则 connect 里获取不到
    // Set these two items first, otherwise they won't be available in the connect.
    appState.setCurrentConnType(conn.dbType);
    appState.setCurrentConnName(conn.name);
    appState.setCurrentConnColor(conn.color);

    const res = await connect({
      dbName: conn.dbName,
      host: conn.host,
      password: conn.password,
      port: conn.port,
      user: conn.user,
      filePath: conn.filePath,
    });

    if (!res) {
      addNotification("The result of connect is null", "error");
    } else if (res.errorMessage !== "" && !res.errorMessage.includes("Duplicate connection name")) {
      addNotification(res.errorMessage, "error");
    } else {
      store.setCurrentDbName(conn.dbName);
      store.setMainAreaType(MAIN_AREA_TABLE_EDITOR);

      appState.setListBarType(LIST_BAR_TABLE);
    }
  }

  const [listData, setListData] = useState<ListItem[]>([]);
  function getData() {
    const arr: ListItem[] = [];
    appState.config.dbConnections.map((item, index) => {
      arr.push({
        id: item.name,
        content: (
          <div className="flex cursor-pointer p-1" style={{ borderBottom: `2px  solid ${item.color}` }}>
            <div className="pe-2">
              {item.dbType === DB_MYSQL && <MysqlLogo className="w-6 h-6" />}
              {item.dbType === DB_POSTGRESQL && <PostgresqlLogo className="w-6 h-6" />}
              {item.dbType === DB_SQLITE && <SqliteLogo className="w-6 h-6" />}
            </div>

            <div>{item.name}</div>
          </div>
        ),
        contentOnClick: async () => {
          handleClickConn(item);
        },
        menuItems: [
          {
            label: t("Edit"),
            onClick: () => {
              const tab = getTab();
              if (tab === null) return;
              const store = tab.store;

              store.setEditDbConnIndex(index);
              store.setMainAreaType(MAIN_AREA_EDIT_CONNECTION);
            },
            icon: <Edit className="h-4 w-4" />,
          },

          {
            label: t("Disconnect"),
            onClick: () => {
              invoker.disconnectSql(appState.currentConnName);
            },
            icon: <Unlink className="h-4 w-4" color="var(--fvm-warning-clr)" />,
          },

          {
            label: t("Delete"),
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

    // 监听 store 的变化 | Monitor changes in the store
    const unsubscribe = subscribeKey(appState, "config", (_value: any) => {
      getData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-2">
      {!snap.config.dbConnections ? <EmptyList /> : <ListWithAction items={listData} itemClassName="py-2" />}

      <ConfirmDialog
        open={showDialog}
        title={t("&confirmDelete")}
        content={""}
        cancelText={t("Cancel")}
        cancelCb={() => {
          setShowDialog(false);
        }}
        okText={t("Confirm")}
        okCb={handleDelConn}
      />
    </div>
  );
}
