import { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import sql from "highlight.js/lib/languages/sql";
import "highlight.js/styles/tokyo-night-dark.css";

hljs.registerLanguage("sql", sql);

export function SqlCodeViewer(props: { ddl: string }) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      delete codeRef.current.dataset.highlighted;
      hljs.highlightElement(codeRef.current);
    }
  }, [props]);

  return (
    <pre>
      <code ref={codeRef} className={`language-sql`}>
        {props.ddl}
      </code>
    </pre>
  );
}
