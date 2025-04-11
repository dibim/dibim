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
import { addNotification, coreState } from "@/store/core";
import { DbConnections } from "@/types/conf_file";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyList } from "../EmptyList";
import { ListItem, ListWithAction } from "../ListWithAction";

export function DatabaseList() {
  const { t } = useTranslation();
  const coreSnap = useSnapshot(coreState);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [itemIndex, setItemIndex] = useState<number>(-1);

  function handleDelConn() {
    const newConfig = {
      ...coreState.config,
      dbConnections: [
        ...coreState.config.dbConnections.slice(0, itemIndex),
        ...coreState.config.dbConnections.slice(itemIndex + 1),
      ],
    };
    coreState.setConfig(newConfig);

    setShowDialog(false);
  }

  async function handleClickConn(conn: DbConnections) {
    const tab = getTab();
    if (tab === null) return;
    const tbState = tab.state;

    coreState.setCurrentConnType(conn.dbType);
    coreState.setCurrentConnName(conn.name);
    coreState.setCurrentConnColor(conn.color);
    tbState.setColor(conn.color);

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
      tbState.setCurrentDbName(conn.dbName);
      tbState.setMainAreaType(MAIN_AREA_TABLE_EDITOR);
      tbState.setColor(conn.color);

      coreState.setListBarType(LIST_BAR_TABLE);
    }
  }

  const [listData, setListData] = useState<ListItem[]>([]);
  function getData() {
    const arr: ListItem[] = [];
    coreState.config.dbConnections.map((item, index) => {
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
              const tbState = tab.state;

              tbState.setEditDbConnIndex(index);
              tbState.setMainAreaType(MAIN_AREA_EDIT_CONNECTION);
            },
            icon: <Edit className="h-4 w-4" />,
          },

          {
            label: t("Disconnect"),
            onClick: () => {
              invoker.disconnectSql(coreState.currentConnName);
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
    const unsubscribe = subscribeKey(coreState, "config", (_value: any) => {
      getData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-2">
      {!coreSnap.config.dbConnections ? <EmptyList /> : <ListWithAction items={listData} itemClassName="py-2" />}

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
