import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import pgsql from "highlight.js/lib/languages/pgsql";
import sql from "highlight.js/lib/languages/sql";
import "highlight.js/styles/tokyo-night-dark.css";
import { getTab } from "@/context";
import { DB_POSTGRESQL } from "@/databases/constants";
import { formatSql } from "@/utils/format_sql";

hljs.registerLanguage("sql", sql);
hljs.registerLanguage("postgresql", pgsql);

export function SqlCodeViewer({ ddl }: { ddl: string }) {
  const tab = getTab();
  if (tab === null) return <p>No tab found</p>;
  const store = tab.store;

  const codeRef = useRef<HTMLElement>(null);
  const [sql, setSql] = useState<string>("");

  // TODO: add support for SQLite, MySQ, Oracle
  function getLang() {
    if (store.currentDbType === DB_POSTGRESQL) return "postgresql";

    return "sql";
  }

  useEffect(() => {
    if (codeRef.current) {
      delete codeRef.current.dataset.highlighted;
      hljs.highlightElement(codeRef.current);
    }
  }, [sql]);

  useEffect(() => {
    const res = formatSql(store.currentDbType, ddl);
    if (res.errorMessage === "") {
      setSql(res.result);
    } else {
      setSql(res.errorMessage);
    }
  }, [ddl]);

  return (
    <pre>
      <code ref={codeRef} className={`language-${getLang()}`}>
        {sql}
      </code>
    </pre>
  );
}
