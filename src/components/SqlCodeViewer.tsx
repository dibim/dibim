import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import hljs from "highlight.js/lib/core";
import pgsql from "highlight.js/lib/languages/pgsql";
import sql from "highlight.js/lib/languages/sql";
import "highlight.js/styles/tokyo-night-dark.css";
import { Copy } from "lucide-react";
import { DB_POSTGRESQL } from "@/databases/constants";
import { coreState } from "@/store/core";
import { TextNotificationData } from "@/types/types";
import { formatSql } from "@/utils/format_sql";
import { TextNotification } from "./TextNotification";

hljs.registerLanguage("sql", sql);
hljs.registerLanguage("postgresql", pgsql);

export function SqlCodeViewer({ ddl }: { ddl: string }) {
  const { t } = useTranslation();

  const codeRef = useRef<HTMLElement>(null);
  const [sql, setSql] = useState<string>("");
  const [messageData, setMessageData] = useState<TextNotificationData | null>(null);

  // TODO: add support for SQLite, MySQ, Oracle
  function getLang() {
    if (coreState.currentConnType === DB_POSTGRESQL) return "postgresql";

    return "sql";
  }

  async function handleClick() {
    try {
      if (codeRef.current) {
        await navigator.clipboard.writeText(codeRef.current.innerText);
        setMessageData({
          message: t("Copied"),
          type: "success",
        });
      }
    } catch (err) {
      console.log("Copy failed, error: ", err);
      setMessageData({ message: t("Copy failed"), type: "error" });
    }
  }

  useEffect(() => {
    if (codeRef.current) {
      delete codeRef.current.dataset.highlighted;
      hljs.highlightElement(codeRef.current);
    }
  }, [sql]);

  useEffect(() => {
    const res = formatSql(coreState.currentConnType, ddl);
    if (res.errorMessage === "") {
      setSql(res.result);
    } else {
      setSql(res.errorMessage);
    }
  }, [ddl]);

  return (
    <>
      <div className="flex">
        <div className="flex text-muted-foreground cursor-pointer pb-2" onClick={handleClick}>
          <Copy />
          <span className="ps-4">{t("Copy")}</span>
        </div>
        <div>
          {messageData && (
            <TextNotification
              message={`${messageData.time ? messageData.time.toLocaleString() + " " : ""}${messageData.message}`}
              type={messageData?.type}
            ></TextNotification>
          )}
        </div>
      </div>
      <pre>
        <code ref={codeRef} className={`language-${getLang()}`}>
          {sql}
        </code>
      </pre>
    </>
  );
}
