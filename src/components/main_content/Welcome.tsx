import { useEffect, useState } from "react";
import { CirclePlus, Settings, Smile } from "lucide-react";
import {
  APP_NAME,
  MAIN_CONTEN_TYPE_ADD_CONNECTION,
  MAIN_CONTEN_TYPE_SETTINGS,
  MAIN_PASSWORD_DEFAULT,
} from "@/constants";
import { invoker } from "@/invoke";
import { useCoreStore } from "@/store";
import { Card, CardContent, CardDescription, CardFooter } from "../ui/card";

export function Welcome() {
  const { setMainContenType, mainPasswordSha } = useCoreStore();

  const [showMainPasswordDiv, setShowMainPasswordDiv] = useState<boolean>(false);

  async function checkMainPassword() {
    const sha256 = await invoker.sha256(MAIN_PASSWORD_DEFAULT);

    setShowMainPasswordDiv(mainPasswordSha === sha256);
  }

  useEffect(() => {
    checkMainPassword();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-150">
        <CardContent>
          <div className="flex items-center pb-4">
            <div className="pe-8">
              <Smile size={40} />
            </div>
            <div> 欢迎使用 {APP_NAME}</div>
          </div>
          {showMainPasswordDiv && (
            <div
              className="flex py-4 cursor-pointer"
              onClick={() => {
                setMainContenType(MAIN_CONTEN_TYPE_SETTINGS);
              }}
            >
              <div className="pe-4">
                <Settings />
              </div>
              <div>
                <p className="pb-4 font-bold ">设置主密码</p>
                <CardDescription className="pb-2">为了您的数据安全, 强烈建议您设置一个健壮的主密码. </CardDescription>
                <CardDescription>主密码将会用于使用 AES_GCM 算法加密您的所有配置文件.</CardDescription>
              </div>
            </div>
          )}
          <div
            className="flex py-4 cursor-pointer"
            onClick={() => {
              setMainContenType(MAIN_CONTEN_TYPE_ADD_CONNECTION);
            }}
          >
            <div className="pe-4">
              <CirclePlus />
            </div>
            <div>添加数据库</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Button variant="outline">取消</Button> */}
          {/* <Button onClick={onSubmit}>确认</Button> */}
        </CardFooter>
      </Card>
    </div>
  );
}
