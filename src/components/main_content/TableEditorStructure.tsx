/**
 * 表格结构
 */
import { useEffect, useState } from "react";
import { DB_TYPE_MY_SQL, DB_TYPE_POSTGRES_SQL, DB_TYPE_SQLITE } from "@/constants";
import { TableStructureMysql } from "@/databases/MySQL/types";
import { TableStructurePostgresql } from "@/databases/PostgreSQL/types";
import { TableStructureSqlite } from "@/databases/SQLite/types";
import { getTableStructure } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { MainContentData } from "@/types/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export function TableEditorStructure(props: MainContentData) {
  const { currentDbType, currentTableName } = useCoreStore();

  const [tableData, setTableData] = useState<any[]>([]); // 表结构

  const getData = async () => {
    const res = await getTableStructure(currentDbType, currentTableName);
    if (res && res.data) {
      setTableData(res.data);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const renderBody = () => {
    if (currentDbType === DB_TYPE_MY_SQL) {
      const tableDataPg = tableData as unknown as TableStructureMysql[];
      // TODO: 实现逻辑
    }

    if (currentDbType === DB_TYPE_POSTGRES_SQL) {
      const tableDataPg = tableData as unknown as TableStructurePostgresql[];
      return tableDataPg.map((row, index) => (
        <>
          <TableRow>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{row.column_name}</TableCell>
            <TableCell>{row.data_type}</TableCell>
            <TableCell>{row.is_primary_key ? "YES" : ""}</TableCell>
            <TableCell>{row.has_foreign_key ? "YES" : ""}</TableCell>
            <TableCell>{row.is_unique ? "YES" : ""}</TableCell>
            <TableCell>{row.has_check_conditions ? "YES" : ""}</TableCell>
            <TableCell>{row.is_nullable === "YES" ? "YES" : ""}</TableCell>
            <TableCell>{row.column_default}</TableCell>
            <TableCell>{row.comment}</TableCell>
          </TableRow>
        </>
      ));
    }

    if (currentDbType === DB_TYPE_SQLITE) {
      const tableDataPg = tableData as unknown as TableStructureSqlite[];
      // TODO: 实现逻辑
    }

    return <></>;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>列名</TableHead>
            <TableHead>数据类型</TableHead>
            <TableHead>主键</TableHead>
            <TableHead>外键</TableHead>
            <TableHead>唯一</TableHead>
            <TableHead>条件</TableHead>
            <TableHead>非空</TableHead>
            <TableHead>默认值</TableHead>
            <TableHead>备注</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderBody()}</TableBody>
      </Table>
    </>
  );
}
