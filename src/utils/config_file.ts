import { CONFIG_FILE_APPEARANCE, CONFIG_FILE_MAIN } from "@/constants";
import { invoker } from "@/invoker";
import { ConfigFileAppearance, ConfigFileMain } from "@/types/conf_file";

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
export async function saveConfigFile(val: ConfigFileMain, key: string) {
  // 记录主配置
  const enc = await invoker.aesGcmEncryptString(JSON.stringify(val), key);
  if (enc.errorMessage === "") {
    const res = await invoker.writeFileBase64(CONFIG_FILE_MAIN, enc.result);

    if (res.errorMessage !== "") {
      console.log("writeFileBase64 error: ", res.errorMessage);
    }
  } else {
    console.log("aesGcmEncryptString error: ", enc.errorMessage);
  }

  // 记录外观配置
  const configA: ConfigFileAppearance = {
    lang: val.settings.lang,
    colorScheme: val.settings.colorScheme,
  };

  await invoker.writeFileText(CONFIG_FILE_APPEARANCE, JSON.stringify(configA));

  return false;
}
