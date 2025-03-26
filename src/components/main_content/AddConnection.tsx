import { useState } from "react";
import { AlertCircle } from "lucide-react";
import MysqlLogo from "@/assets/db_logo/mysql.svg?react";
import PostgresqlLogo from "@/assets/db_logo/postgresql.svg?react";
import SqliteLogo from "@/assets/db_logo/sqlite.svg?react";
import { LabeledDiv } from "@/components/LabeledDiv";
import { Input } from "@/components/ui/input";
import { DB_TYPE_MYSQL, DB_TYPE_POSTGRESQL, DB_TYPE_SQLITE, DIR_H } from "@/constants";
import { useCoreStore } from "@/store";
import { DbType, SvgComponentType } from "@/types/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export function AddConnection() {
  const { config, setConfig } = useCoreStore();

  const [name, setName] = useState<string>(""); // 连接名称
  const [dbType, setDbType] = useState<DbType>(DB_TYPE_POSTGRESQL); // 默认类型是 PostgreSQL
  const [host, setHost] = useState<string>("");
  const [port, setPort] = useState<number>(5432); // 默认类型是 PostgreSQL
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [dbname, setDbName] = useState<string>("");
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
    if (dbType === DB_TYPE_MYSQL || dbType === DB_TYPE_POSTGRESQL) {
      if (valueIsError(host === "", "主机地址")) return;
      if (valueIsError(port === 0, "端口")) return;
      if (valueIsError(user === "", "用户名")) return;
      if (valueIsError(password === "", "密码")) return;
      if (valueIsError(dbname === "", "数据库名")) return;
    }

    if (dbType === DB_TYPE_SQLITE) {
      if (filePath === "") {
        setErrorMessage("请输入文件路径");
        return;
      }
    }

    const dbConf = {
      user,
      host,
      dbname,
      password,
      port,
      name,
      color,
    };

    config.dbConnections.push(dbConf);
    await setConfig(config);

    setOkMessage("添加成功");
  }

  const handleClickDbLogo = (dbType: DbType) => {
    if (dbType === DB_TYPE_MYSQL) setPort(3306);
    if (dbType === DB_TYPE_POSTGRESQL) setPort(5432);

    setDbType(dbType);
  };

  // TODO: sqlite 的文件拾取使用 rust 的 rfd, 先不管 hos

  function renderDbType(type: DbType, LogoComponent: SvgComponentType) {
    return (
      <div
        className={`p-1 rounded-md transition-all ${dbType === type ? "ring-2 ring-[var(--fvm-primary-clr)]" : ""}`}
        onClick={() => handleClickDbLogo(type)}
      >
        <LogoComponent className="h-full w-auto cursor-pointer" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-150">
        <CardHeader>
          <CardTitle>添加数据库</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <LabeledDiv direction={DIR_H} label={"数据库类型"} className="py-2">
            <div className="flex gap-4 h-20 max-h-20">
              {renderDbType(DB_TYPE_MYSQL, MysqlLogo)}
              {renderDbType(DB_TYPE_POSTGRESQL, PostgresqlLogo)}
              {renderDbType(DB_TYPE_SQLITE, SqliteLogo)}
            </div>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"连接名称"} className="py-2">
            <Input value={name} onInput={onInputName} />
          </LabeledDiv>

          {(dbType === DB_TYPE_MYSQL || dbType === DB_TYPE_POSTGRESQL) && (
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
                <Input value={dbname} onInput={onInputDbName} />
              </LabeledDiv>
            </>
          )}

          {dbType === DB_TYPE_SQLITE && (
            <LabeledDiv direction={DIR_H} label={"文件路径"} className="py-2">
              <Input value={filePath} onInput={onInputFilePath} />
            </LabeledDiv>
          )}

          <LabeledDiv direction={DIR_H} label={"颜色"} className="py-2">
            <Input type="color" value={color} onInput={onInputColor} />
          </LabeledDiv>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>错误提示</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {okMessage && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>提示</AlertTitle>
              <AlertDescription>{okMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Button variant="outline">取消</Button> */}
          <Button onClick={onSubmit}>确认</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
