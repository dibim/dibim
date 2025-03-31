import { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import pgsql from "highlight.js/lib/languages/pgsql";
import sql from "highlight.js/lib/languages/sql";
import "highlight.js/styles/tokyo-night-dark.css";
import { DB_TYPE_POSTGRESQL } from "@/constants";
import { useCoreStore } from "@/store";

hljs.registerLanguage("sql", sql);
hljs.registerLanguage("postgresql", pgsql);

export function SqlCodeViewer(props: { ddl: string }) {
  const { currentDbType } = useCoreStore();
  const codeRef = useRef<HTMLElement>(null);

  // TODO: add support for SQLite, MySQ, Oracle
  function getLang() {
    if (currentDbType === DB_TYPE_POSTGRESQL) return "postgresql";

    return "sql";
  }

  useEffect(() => {
    if (codeRef.current) {
      delete codeRef.current.dataset.highlighted;
      hljs.highlightElement(codeRef.current);
    }
  }, [props]);

  return (
    <pre>
      <code ref={codeRef} className={`language-${getLang()}`}>
        {props.ddl}
      </code>
    </pre>
  );
}
