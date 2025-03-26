import { CONFIG_FILE_MAIN } from "@/constants";
import { invoker } from "@/invoke";

// 读取配置文件
export const readConfigFile = async (key: string) => {
  const res = await invoker.readFileBase64(CONFIG_FILE_MAIN);

  if (res.errorMessage === "") {
    const dec = await invoker.aesGcmDecryptBase64(res.result, key);

    if (dec.errorMessage === "") {
      return dec.result;
    } else {
      console.log("aesGcmDecryptBase64", dec.errorMessage);
    }
  } else {
    console.log("readFileBase64 出错", res.errorMessage);
  }

  return "";
};

// 保存配置文件
export const saveConfigFile = async (val: string, key: string) => {
  const enc = await invoker.aesGcmEncryptString(JSON.stringify(val), key);

  if (enc.errorMessage === "") {
    const res = await invoker.writeFileBase64(CONFIG_FILE_MAIN, enc.result);

    if (res.errorMessage === "") {
      return res.result;
    } else {
      console.log("writeFileBase64 出错", res.errorMessage);
    }
  } else {
    console.log("aesGcmEncryptString 出错", enc.errorMessage);
  }

  return false;
};
