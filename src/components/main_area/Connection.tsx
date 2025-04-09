import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import { open } from "@tauri-apps/plugin-dialog";
import MysqlLogo from "@/assets/db_logo/mysql.svg?react";
import PostgresqlLogo from "@/assets/db_logo/postgresql.svg?react";
import SqliteLogo from "@/assets/db_logo/sqlite.svg?react";
import { LabeledDiv } from "@/components/LabeledDiv";
import { Input } from "@/components/ui/input";
import { DB_MYSQL, DB_POSTGRESQL, DB_SQLITE, DIR_H, STR_ADD, STR_EDIT } from "@/constants";
import { appState } from "@/store/valtio";
import { DbType, SvgComponentType } from "@/types/types";
import { generateHexString } from "@/utils/util";
import { TextNotification } from "../TextNotification";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type ConnectionProps = {
  action: typeof STR_ADD | typeof STR_EDIT;
};

export function Connection(props: ConnectionProps) {
  const { t } = useTranslation();
  const snap = useSnapshot(appState);
  const [name, setName] = useState<string>(""); // 连接名称 | Name of the connection
  const [dbType, setDbType] = useState<DbType>(DB_POSTGRESQL);
  const [host, setHost] = useState<string>("");
  const [port, setPort] = useState<number>(5432);
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [dbName, setDbName] = useState<string>("");
  const [filePath, setFilePath] = useState<string>("");
  const [color, setColor] = useState<string>("#33d17a");

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [okMessage, setOkMessage] = useState<string>("");

  function onInputName(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value || "");
  }
  function onInputHost(event: React.ChangeEvent<HTMLInputElement>) {
    setHost(event.target.value || "");
  }
  function onInputPort(event: React.ChangeEvent<HTMLInputElement>) {
    setPort(parseInt(event.target.value) || 0);
  }
  function onInputUser(event: React.ChangeEvent<HTMLInputElement>) {
    setUser(event.target.value || "");
  }
  function onInputPassword(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value || "");
  }
  function onInputDbName(event: React.ChangeEvent<HTMLInputElement>) {
    setDbName(event.target.value || "");
  }
  function onInputFilePath(event: React.ChangeEvent<HTMLInputElement>) {
    setFilePath(event.target.value || "");
  }
  function onInputColor(event: React.ChangeEvent<HTMLInputElement>) {
    setColor(event.target.value || "");
  }

  function valueIsError(condition: boolean, msg: string) {
    if (condition) {
      const message = t("&Please enter", { name: msg });
      setErrorMessage(message);
      appState.addTextNotification({
        message: message,
        type: "error",
      });
      return true;
    }
    return false;
  }

  async function onSubmit() {
    setErrorMessage("");
    setOkMessage("");

    if (name === "") {
      setErrorMessage(t("The connection name cannot be empty"));
      return;
    }

    if (props.action === STR_ADD && appState.config.dbConnections.some((item) => item.name === name)) {
      setErrorMessage(t("&connectionNameExists", { name: name }));
      return;
    }

    if (dbType === DB_MYSQL || dbType === DB_POSTGRESQL) {
      if (valueIsError(host === "", t("Host"))) return;
      if (valueIsError(port === 0, t("Port"))) return;
      if (valueIsError(user === "", t("User"))) return;
      if (valueIsError(password === "", t("Password"))) return;
      if (valueIsError(dbName === "", t("Database Name"))) return;
    }

    if (dbType === DB_SQLITE) {
      if (filePath === "") {
        setErrorMessage(t("&Please enter", { name: t("File path").toLowerCase() }));
        return;
      }
    }

    const dbConf = {
      color,
      dbName,
      dbType,
      filePath,
      host,
      name,
      password,
      port,
      user,
    };

    if (props.action === STR_ADD) {
      await appState.setConfig({
        ...appState.config,
        dbConnections: [...appState.config.dbConnections, ...(Array.isArray(dbConf) ? dbConf : [dbConf])],
      });
      setOkMessage(t("Added"));
    }

    if (props.action === STR_EDIT) {
      await appState.setConfig({
        ...appState.config,
        dbConnections: appState.config.dbConnections.map((item, index) =>
          index === appState.editDbConnIndex ? dbConf : item,
        ),
      });
      setOkMessage(t("Edited"));
    }
  }

  function handleClickDbLogo(dbType: DbType) {
    if (dbType === DB_MYSQL) setPort(3306);
    if (dbType === DB_POSTGRESQL) setPort(5432);

    setDbType(dbType);
  }

  function renderDbType(type: DbType, LogoComponent: SvgComponentType) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`p-1 rounded-md transition-all ${dbType === type ? "ring-2 ring-[var(--fvm-primary-clr)]" : ""}`}
            onClick={() => handleClickDbLogo(type)}
          >
            <LogoComponent className="h-full w-auto cursor-pointer" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{type}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  function setEditingData() {
    // 如果是添加连接, 随机生成颜色 | If adding connections, randomly generate colors
    if (props.action === STR_ADD) {
      const color = `#${generateHexString(6)}`;
      setColor(color);
    }

    // 编辑连接的要获取数据 | Load data when editing connection
    if (props.action === STR_EDIT) {
      const conn = appState.config.dbConnections[appState.editDbConnIndex];
      setColor(conn.color);
      setDbName(conn.dbName);
      setDbType(conn.dbType);
      setFilePath(conn.filePath);
      setHost(conn.host);
      setName(conn.name);
      setPassword(conn.password);
      setPort(conn.port);
      setUser(conn.user);
    }
  }

  useEffect(() => {
    setEditingData();
  }, [snap.editDbConnIndex]);

  useEffect(() => {
    setEditingData();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-150">
        <CardHeader>
          <CardTitle>{props.action === STR_ADD ? t("Add connection") : t("Edit connection")}</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <LabeledDiv direction={DIR_H} label={t("Database type")} className="py-2">
            <div className="flex gap-4 h-20 max-h-20">
              {renderDbType(DB_MYSQL, MysqlLogo)}
              {renderDbType(DB_POSTGRESQL, PostgresqlLogo)}
              {renderDbType(DB_SQLITE, SqliteLogo)}
            </div>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={t("Name")} className="py-2">
            <Input value={name} onInput={onInputName} />
          </LabeledDiv>

          {(dbType === DB_MYSQL || dbType === DB_POSTGRESQL) && (
            <>
              <LabeledDiv direction={DIR_H} label={t("Host")} className="py-2">
                <Input value={host} onInput={onInputHost} />
              </LabeledDiv>
              <LabeledDiv direction={DIR_H} label={t("Port")} className="py-2">
                <Input value={port} onInput={onInputPort} />
              </LabeledDiv>
              <LabeledDiv direction={DIR_H} label={t("User")} className="py-2">
                <Input value={user} onInput={onInputUser} />
              </LabeledDiv>
              <LabeledDiv direction={DIR_H} label={t("Password")} className="py-2">
                <Input value={password} onInput={onInputPassword} />
              </LabeledDiv>
              <LabeledDiv direction={DIR_H} label={t("Database Name")} className="py-2">
                <Input value={dbName} onInput={onInputDbName} />
              </LabeledDiv>
            </>
          )}

          {dbType === DB_SQLITE && (
            <LabeledDiv direction={DIR_H} label={t("File path")} className="py-2">
              <Input value={filePath} onInput={onInputFilePath} />
              <div className="py-1"></div>
              <Button
                variant={"outline"}
                onClick={async () => {
                  const file = await open({
                    multiple: false,
                    directory: false,
                  });
                  console.log(file);
                  if (file) setFilePath(file);
                }}
              >
                {t("Select")}
              </Button>
            </LabeledDiv>
          )}

          <LabeledDiv direction={DIR_H} label={t("Color")} className="py-2">
            <Input type="color" value={color} onInput={onInputColor} />
          </LabeledDiv>

          {errorMessage && <TextNotification type="error" message={errorMessage}></TextNotification>}
          {okMessage && <TextNotification type="success" message={okMessage}></TextNotification>}
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Button variant="outline">{t("Cancel")}</Button> */}
          <Button onClick={onSubmit}>{t("Confirm")}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
