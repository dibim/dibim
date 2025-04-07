import { useEffect, useState } from "react";
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
import { TextNotification } from "../TextNotification";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type ConnectionProp = {
  action: typeof STR_ADD | typeof STR_EDIT;
};

export function Connection(props: ConnectionProp) {
  const snap = useSnapshot(appState);
  const [name, setName] = useState<string>(""); // 连接名称
  const [dbType, setDbType] = useState<DbType>(DB_POSTGRESQL); // 默认类型是 PostgreSQL
  const [host, setHost] = useState<string>("");
  const [port, setPort] = useState<number>(5432); // 默认类型是 PostgreSQL
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [dbName, setDbName] = useState<string>("");
  const [filePath, setFilePath] = useState<string>(""); // 文件路径, 用于 sqite
  const [color, setColor] = useState<string>("#33d17a");

  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息
  const [okMessage, setOkMessage] = useState<string>(""); // 成功消息

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
      setErrorMessage(`请输入${msg}`);
      return true;
    }
    return false;
  }

  async function onSubmit() {
    if (props.action === STR_ADD && appState.config.dbConnections.some((item) => item.name === name)) {
      setErrorMessage(`该连接名称"${name}"已存在`);
      return;
    }

    if (dbType === DB_MYSQL || dbType === DB_POSTGRESQL) {
      if (valueIsError(host === "", "主机地址")) return;
      if (valueIsError(port === 0, "端口")) return;
      if (valueIsError(user === "", "用户名")) return;
      if (valueIsError(password === "", "密码")) return;
      if (valueIsError(dbName === "", "数据库名")) return;
    }

    if (dbType === DB_SQLITE) {
      if (filePath === "") {
        setErrorMessage("请输入文件路径");
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
      setOkMessage("添加成功");
    }

    if (props.action === STR_EDIT) {
      await appState.setConfig({
        ...appState.config,
        dbConnections: appState.config.dbConnections.map((item, index) =>
          index === appState.editDbConnIndex ? dbConf : item,
        ),
      });
      setOkMessage("编辑成功");
    }
  }

  function handleClickDbLogo(dbType: DbType) {
    if (dbType === DB_MYSQL) setPort(3306);
    if (dbType === DB_POSTGRESQL) setPort(5432);

    setDbType(dbType);
  }

  // TODO: sqlite 的文件拾取使用 rust 的 rfd, 先不管 hos

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
    // 编辑连接的要获取数据
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
          <CardTitle>{props.action === STR_ADD ? "添加" : "编辑"}数据库</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <LabeledDiv direction={DIR_H} label={"数据库类型"} className="py-2">
            <div className="flex gap-4 h-20 max-h-20">
              {renderDbType(DB_MYSQL, MysqlLogo)}
              {renderDbType(DB_POSTGRESQL, PostgresqlLogo)}
              {renderDbType(DB_SQLITE, SqliteLogo)}
            </div>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"连接名称"} className="py-2">
            <Input value={name} onInput={onInputName} />
          </LabeledDiv>

          {(dbType === DB_MYSQL || dbType === DB_POSTGRESQL) && (
            <>
              <LabeledDiv direction={DIR_H} label={"主机地址"} className="py-2">
                <Input value={host} onInput={onInputHost} />
              </LabeledDiv>
              <LabeledDiv direction={DIR_H} label={"端口"} className="py-2">
                <Input value={port} onInput={onInputPort} />
              </LabeledDiv>
              <LabeledDiv direction={DIR_H} label={"用户名"} className="py-2">
                <Input value={user} onInput={onInputUser} />
              </LabeledDiv>
              <LabeledDiv direction={DIR_H} label={"密码"} className="py-2">
                <Input value={password} onInput={onInputPassword} />
              </LabeledDiv>
              <LabeledDiv direction={DIR_H} label={"数据库名"} className="py-2">
                <Input value={dbName} onInput={onInputDbName} />
              </LabeledDiv>
            </>
          )}

          {dbType === DB_SQLITE && (
            <LabeledDiv direction={DIR_H} label={"文件路径"} className="py-2">
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
                选择
              </Button>
            </LabeledDiv>
          )}

          <LabeledDiv direction={DIR_H} label={"颜色"} className="py-2">
            <Input type="color" value={color} onInput={onInputColor} />
          </LabeledDiv>

          {errorMessage && <TextNotification type="error" message={errorMessage}></TextNotification>}
          {okMessage && <TextNotification type="success" message={okMessage}></TextNotification>}
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Button variant="outline">取消</Button> */}
          <Button onClick={onSubmit}>确认</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
