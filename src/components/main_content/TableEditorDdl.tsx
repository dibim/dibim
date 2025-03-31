import { useEffect, useState } from "react";
import { getTableDdl } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { formatSql } from "@/utils/format_sql";
import { SqlCodeViewer } from "../SqlCodeViewer";

export function TableEditorDdl() {
  const { currentTableName, currentDbType } = useCoreStore();

  const [ddl, setDdl] = useState<string>("");

  const getData = async () => {
    const res = await getTableDdl(currentTableName);
    if (res && res.data) {
      let sql = res.data;
      if (sql.length > 0) {
        sql = formatSql(currentDbType, sql);
      } else {
        sql = "未查询到 DDL";
      }

      setDdl(sql);

      // setDdl(res.data);
    }
  };

  useEffect(() => {
    getData();
  }, [currentTableName]);

  useEffect(() => {
    getData();
  }, []);

  return <SqlCodeViewer ddl={ddl} />;
}
