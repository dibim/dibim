import { CONFIG_FILE_MAIN } from "@/constants";
import { invoker } from "@/invoker";

// 读取配置文件
// Read configuration file
export async function readConfigFile(key: string) {
  const res = await invoker.readFileBase64(CONFIG_FILE_MAIN);

  if (res.errorMessage === "") {
    const dec = await invoker.aesGcmDecryptBase64(res.result, key);

    if (dec.errorMessage === "") {
      return dec.result;
    } else {
      console.log("aesGcmDecryptBase64 error: ", dec.errorMessage);
    }
  } else {
    console.log("readFileBase64 error: ", res.errorMessage);
  }

  return "";
}

// 保存配置文件
// Save configuration file
export async function saveConfigFile(val: string, key: string) {
  const enc = await invoker.aesGcmEncryptString(val, key);

  if (enc.errorMessage === "") {
    const res = await invoker.writeFileBase64(CONFIG_FILE_MAIN, enc.result);

    if (res.errorMessage === "") {
      return res.result;
    } else {
      console.log("writeFileBase64 error: ", res.errorMessage);
    }
  } else {
    console.log("aesGcmEncryptString error: ", enc.errorMessage);
  }

  return false;
}
