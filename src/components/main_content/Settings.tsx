import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { DIR_H, MAIN_PASSWORD_MIN_LEN } from "@/constants";
import { getTableDdl } from "@/databases/adapter,";
import { invoker } from "@/invoker";
import { useCoreStore } from "@/store";
import { LabeledDiv } from "../LabeledDiv";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

export function Settings() {
  const { currentTableName, setMainPasswordSha, config, setConfig } = useCoreStore();

  const [mainPassword, setMainPassword] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [lang, setLang] = useState<string>("");
  const [timeFormat, setTimeFormat] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>(""); // 错误消息
  const [okMessage, setOkMessage] = useState<string>(""); // 成功消息

  async function onInputMainPassword(event: React.ChangeEvent<HTMLInputElement>) {
    setMainPassword(event.target.value || "");
  }

  function onInpuTheme(event: React.ChangeEvent<HTMLInputElement>) {
    setTheme(event.target.value || "");
  }

  async function onSubmit() {
    // 检查密码
    if (mainPassword.length < MAIN_PASSWORD_MIN_LEN) {
      setErrorMessage(`主密码的长度不低于 ${MAIN_PASSWORD_MIN_LEN}`);
      return;
    }

    // 把数据写入配置文件, 先设置 sha256, 后 执行 setConfig
    const sha256 = await invoker.sha256(mainPassword);
    setMainPasswordSha(sha256);

    config.settings.lang = lang;
    config.settings.theme = theme;
    config.settings.timeFormat = timeFormat;
    await setConfig(config);

    setOkMessage("保存成功");
  }

  async function getData() {
    const res = await getTableDdl(currentTableName);
    if (res && res.data) {
      // setTableData(res.data);
    }
  }

  useEffect(() => {
    getData();
  }, [currentTableName]);

  useEffect(() => {
    getData();

    // TODO: 这几行视为了编译不报错
    setLang("");
    setTimeFormat("");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-200">
        <CardHeader>
          <CardTitle>设置</CardTitle>
        </CardHeader>
        <CardContent>
          <LabeledDiv direction={DIR_H} label={"主密码"} className="py-2">
            <Input value={mainPassword} onInput={onInputMainPassword} />

            <div className="pt-2">
              <CardDescription>为了您的数据安全, 强烈建议您设置一个健壮的主密码. </CardDescription>
              <CardDescription>主密码将会用于使用 AES_GCM 算法加密您的所有配置文件.</CardDescription>
            </div>
          </LabeledDiv>

          <LabeledDiv direction={DIR_H} label={"主题"} className="py-2">
            <Input value={theme} onInput={onInpuTheme} />
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
