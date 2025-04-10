import { invoker } from "@/invoker";
import {
  DbConnectionParam,
  DbCountRes,
  FieldIndex,
  FieldStructure,
  FieldWithValue,
  GetTableDataParam,
  getAllTableSizeRes,
} from "../types";
import { formatToSqlValueOracle } from "./format";
import "./types";

/**
 * 连接到 Oracle
 *
 * "oracle://user:password@localhost:1521/mydb";
 *
 */
export async function connectOracle(connName: string, p: DbConnectionParam) {
  return await invoker.connectSql(connName, `oracle://${p.user}:${p.password}@${p.host}:${p.port}/${p.dbName}`);
}

// 获取所有表格名
export async function getAllTableNameOracle(connName: string) {
  const sql = `
    SELECT 
        TABLE_NAME AS "tableName"
    FROM 
        ALL_TABLES 
    WHERE 
        OWNER = USER
    ;`;

  const dbRes = await invoker.querySql(connName, sql);

  // 把表名整理成一维数组
  const dataArr = dbRes.data ? (JSON.parse(dbRes.data) as { tableName: string }[]) : [];

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dataArr.map((item) => item.tableName),
  };
}

export async function getAllTableSizeOracle(connName: string) {
  const sql = `
    SELECT
      SEGMENT_NAME AS "tableName",
      SEGMENT_TYPE AS "segmentType",
      ROUND(SUM(BYTES) / 1024 / 1024, 2) AS "totalSizeMB"
    FROM
      USER_SEGMENTS
    WHERE
      SEGMENT_TYPE IN ('TABLE', 'INDEX')
    GROUP BY
      SEGMENT_NAME, SEGMENT_TYPE
    ORDER BY
      SEGMENT_NAME;
    `;

  const dbRes = await invoker.querySql(connName, sql);
  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as getAllTableSizeRes[]) : [],
  };
}

// 获取表结构
export async function getTableStructureOracle(connName: string, tbName: string) {
  // 基础字段信息
  const columnSql = `
    SELECT
      COLUMN_NAME AS "name",
      DATA_TYPE AS "type",
      CASE 
        WHEN DATA_TYPE IN ('VARCHAR2', 'CHAR') THEN DATA_LENGTH
        WHEN DATA_TYPE IN ('NUMBER') THEN DATA_PRECISION
        ELSE NULL
      END AS "size",
      EXISTS(
        SELECT 1 
        FROM ALL_CONSTRAINTS c
        JOIN ALL_CONS_COLUMNS cc ON c.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
        WHERE c.TABLE_NAME = '${tbName.toUpperCase()}'
          AND cc.COLUMN_NAME = COLUMN_NAME
          AND c.CONSTRAINT_TYPE = 'P'
      ) AS "isPrimaryKey",
      EXISTS(
        SELECT 1 
        FROM ALL_CONSTRAINTS c
        JOIN ALL_CONS_COLUMNS cc ON c.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
        WHERE c.TABLE_NAME = '${tbName.toUpperCase()}'
          AND cc.COLUMN_NAME = COLUMN_NAME
          AND c.CONSTRAINT_TYPE = 'U'
      ) AS "isUniqueKey",
      EXISTS(
        SELECT 1 
        FROM ALL_CONSTRAINTS c
        JOIN ALL_CONS_COLUMNS cc ON c.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
        WHERE c.TABLE_NAME = '${tbName.toUpperCase()}'
          AND cc.COLUMN_NAME = COLUMN_NAME
          AND c.CONSTRAINT_TYPE = 'R'
      ) AS "isForeignKey",
      DATA_DEFAULT AS "defaultValue",
      NULLABLE = 'N' AS "isNotNull",
      COMMENTS AS "comment"
    FROM
      ALL_TAB_COLUMNS
      LEFT JOIN ALL_COL_COMMENTS ON ALL_TAB_COLUMNS.TABLE_NAME = ALL_COL_COMMENTS.TABLE_NAME AND ALL_TAB_COLUMNS.COLUMN_NAME = ALL_COL_COMMENTS.COLUMN_NAME
    WHERE
      ALL_TAB_COLUMNS.TABLE_NAME = '${tbName.toUpperCase()}'
    ORDER BY
      COLUMN_ID;
    `;

  // 索引信息查询
  const indexSql = `
    SELECT
      INDEX_NAME AS "indexName",
      COLUMN_NAME AS "columnName",
      INDEX_TYPE AS "indexType",
      UNIQUENESS = 'UNIQUE' AS "isUniqueKey",
      EXISTS(
        SELECT 1 
        FROM ALL_CONSTRAINTS c
        WHERE c.TABLE_NAME = '${tbName.toUpperCase()}'
          AND c.INDEX_NAME = INDEX_NAME
          AND c.CONSTRAINT_TYPE = 'P'
      ) AS "isPrimaryKey"
    FROM
      ALL_IND_COLUMNS
      JOIN ALL_INDEXES ON ALL_IND_COLUMNS.INDEX_NAME = ALL_INDEXES.INDEX_NAME
    WHERE
      ALL_IND_COLUMNS.TABLE_NAME = '${tbName.toUpperCase()}'
    ORDER BY
      INDEX_NAME, COLUMN_POSITION;
    `;

  // 执行查询
  const [columnRes, indexRes] = await Promise.all([
    invoker.querySql(connName, columnSql),
    invoker.querySql(connName, indexSql),
  ]);

  // 处理字段信息
  const columns = columnRes.data ? (JSON.parse(columnRes.data) as FieldStructure[]) : [];
  // 处理索引信息
  const indexes = indexRes.data ? (JSON.parse(indexRes.data) as FieldIndex[]) : [];

  // 将索引信息合并到字段信息中
  const columnIndexMap: Record<string, FieldIndex[]> = {};
  indexes.forEach((item) => {
    if (!columnIndexMap[item.columnName]) {
      columnIndexMap[item.columnName] = [];
    }
    columnIndexMap[item.columnName].push(item);
  });

  // 合并结果
  const result = columns.map((column) => ({
    ...column,
    size: column.size ? column.size : "",
    indexes: columnIndexMap[column.name] || [],
  }));

  return {
    columnName: columnRes.columnName ? (JSON.parse(columnRes.columnName) as string[]) : [],
    data: result,
  };
}

// 获取表格的 DDL
export async function getTableDdlOracle(connName: string, tbName: string) {
  const sql = `
    SELECT 
      DBMS_METADATA.GET_DDL('TABLE', '${tbName.toUpperCase()}') AS "ddl"
    FROM 
      DUAL
    ;`;

  const dbRes = await invoker.querySql(connName, sql);

  const keyStr = "?column?";
  const jjj = dbRes.data ? (JSON.parse(dbRes.data) as { [key: string]: string }[]) : [];

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: jjj.length > 0 && keyStr in jjj[0] ? jjj[0][keyStr] : "",
  };
}

/**
 * 获取分页的统计
 * @param connName
 * @param tableName
 * @param pageSize
 * @param condition 条件与据, 包括 where 及之后的所有部分
 * @returns
 */
export async function getPageCountOracle(connName: string, tableName: string, pageSize: number, condition: string) {
  const dbResTotal = await invoker.querySql(
    connName,
    `SELECT COUNT(*) AS total FROM "${tableName}" ${condition ? condition : ""};`,
  );
  let itemsTotal = 0; // 总条数
  if (dbResTotal && dbResTotal.data) {
    const bbCountRes = JSON.parse(dbResTotal.data) as DbCountRes[];

    if (bbCountRes.length > 0) itemsTotal = bbCountRes[0].total;
  }

  const pageTotal = Math.ceil(itemsTotal / pageSize); // 页数

  return {
    itemsTotal,
    pageTotal,
  };
}

// 获取表格数据
export async function getTableDataOracle(connName: string, p: GetTableDataParam) {
  const { itemsTotal, pageTotal } = await getPageCountOracle(connName, p.tableName, p.pageSize, "");

  let offset = p.pageSize * (p.currentPage - 1);
  if (offset < 0) offset = 0;
  let fields = p.fields.length === 1 && p.fields[0] === "*" ? "*" : `"${p.fields.join('","')}"`;
  const sql = `SELECT ${fields} FROM "${p.tableName}" ${p.where} OFFSET ${offset} ROWS FETCH NEXT ${p.pageSize} ROWS ONLY;`;
  const dbRes = await invoker.querySql(connName, sql);

  return {
    itemsTotal,
    pageTotal,
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as object[]) : [],
  };
}

// 生成重命名表格的语句
export function genRenameTableCmdOracle(oldName: string, newName: string) {
  return `ALTER TABLE "${oldName}" RENAME TO "${newName}";`;
}

// 生成截断表格的语句
export function genTruncateTableCmdOracle(tbName: string) {
  return `TRUNCATE TABLE "${tbName}";`;
}

// 生成删除表格的语句
export function genDeleteTableCmdOracle(tbName: string) {
  return `DROP TABLE "${tbName}";`;
}

// 生成重命名字段的语句
export function genRenameFieldCmdOracle(tbName: string, oldName: string, newName: string) {
  return `ALTER TABLE "${tbName}" RENAME COLUMN "${oldName}" TO "${newName}";`;
}

// 生成删除字段的语句
export function genDeleteFieldCmdOracle(tbName: string, fieldName: string) {
  return `ALTER TABLE "${tbName}" DROP COLUMN "${fieldName}";`;
}

// 生成变更一行的字段
export function genUpdateFieldCmdOracle(tbName: string, uniqueField: FieldWithValue, fieldArr: FieldWithValue[]) {
  const fda = fieldArr.map((item) => `"${item.field}" = ${formatToSqlValueOracle(item.value)}`);

  return `
    UPDATE "${tbName}"
    SET 
        ${fda.join(",\n")}
    WHERE "${uniqueField.field}" = ${uniqueField.value};
  `;
}

// 生成删除多行的字段
export function genDeleteRowsCmdOracle(tbName: string, fieldName: string, fieldValues: any[]) {
  const values = fieldValues.map((item) => formatToSqlValueOracle(item)).join(",");
  return `DELETE FROM "${tbName}" WHERE "${fieldName}" IN (${values});`;
}

// 生成插入多行数据
export function genInsertRowsCmdOracle(tbName: string, fieldNames: string[], fieldValues: any[][]) {
  const fields = fieldNames.join(`","`);
  const valArr: any[] = [];
  fieldValues.map((itemRow) => {
    const valRow = itemRow.map((item) => formatToSqlValueOracle(item, true));
    valArr.push(valRow);
  });

  return `INSERT INTO "${tbName}" ("${fields}") VALUES (${valArr.join("),(")});`;
}
