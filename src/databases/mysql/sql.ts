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
import { formatToSqlValueMysql } from "./format";
import "./types";

/**
 * 连接到 MySQL
 *
 * "mysql://user:password@localhost:3306/mydb";
 *
 */
export async function connectMysql(connName: string, p: DbConnectionParam) {
  return await invoker.connectSql(connName, `mysql://${p.user}:${p.password}@${p.host}:${p.port}/${p.dbName}`);
}

// 获取所有表格名
export async function getAllTableNameMysql(connName: string) {
  const sql = `
    SELECT 
        table_name AS \`tableName\`
    FROM 
        information_schema.tables 
    WHERE 
        table_schema = DATABASE()
        AND table_type = 'BASE TABLE'
    ;`;

  const dbRes = await invoker.querySql(connName, sql);

  // 把表名整理成一维数组
  const dataArr = dbRes.data ? (JSON.parse(dbRes.data) as { tableName: string }[]) : [];

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dataArr.map((item) => item.tableName),
  };
}

export async function getAllTableSizeMysql(connName: string) {
  const sql = `
    SELECT
      table_schema AS \`schemaName\`,
      table_name AS \`tableName\`,
      CONCAT(
        ROUND(table_rows / 1000, 2), 
        'K rows (', 
        ROUND(data_length / 1024 / 1024, 2), 
        'MB)'
      ) AS \`totalSize\`,
      CONCAT(ROUND(data_length / 1024 / 1024, 2), 'MB') AS \`tableSize\`,
      CONCAT(ROUND(index_length / 1024 / 1024, 2), 'MB') AS \`indexSize\`
    FROM
      information_schema.tables
    WHERE
      table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
    ORDER BY
      data_length + index_length DESC;
    `;

  const dbRes = await invoker.querySql(connName, sql);
  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as getAllTableSizeRes[]) : [],
  };
}

// 获取表结构
export async function getTableStructureMysql(connName: string, tbName: string) {
  // 基础字段信息
  const columnSql = `
    SELECT
      column_name AS \`name\`,
      data_type AS \`type\`,
      character_maximum_length AS \`size\`,
      column_key = 'PRI' AS \`isPrimaryKey\`,
      column_key = 'UNI' AS \`isUniqueKey\`,
      column_key = 'MUL' AS \`isForeignKey\`,
      column_default AS \`defaultValue\`,
      NOT is_nullable = 'YES' AS \`isNotNull\`,
      column_comment AS \`comment\`
    FROM
      information_schema.columns
    WHERE
      table_name = '${tbName}'
      AND table_schema = DATABASE()
    ORDER BY
      ordinal_position;
    `;

  // 索引信息查询
  const indexSql = `
    SELECT
      index_name AS \`indexName\`,
      column_name AS \`columnName\`,
      index_type AS \`indexType\`,
      non_unique = 0 AS \`isUniqueKey\`,
      index_name = 'PRIMARY' AS \`isPrimaryKey\`
    FROM
      information_schema.statistics
    WHERE
      table_name = '${tbName}'
      AND table_schema = DATABASE()
    ORDER BY
      index_name, seq_in_index;
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
export async function getTableDdlMysql(connName: string, tbName: string) {
  const sql = `
    SELECT 
      CONCAT(
        'CREATE TABLE \`', table_name, '\` (',
        GROUP_CONCAT(
          CONCAT(
            '\n  \`', column_name, '\` ',
            CASE
              WHEN data_type = 'varchar' THEN CONCAT('varchar(', character_maximum_length, ')')
              WHEN data_type = 'int' THEN 'int'
              WHEN data_type = 'datetime' THEN 'datetime'
              ELSE data_type
            END,
            CASE WHEN column_default IS NOT NULL THEN CONCAT(' DEFAULT ', column_default) ELSE '' END,
            CASE WHEN column_key = 'PRI' THEN ' PRIMARY KEY' ELSE '' END,
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
          )
          ORDER BY ordinal_position
          SEPARATOR ','
        ),
        '\n);'
      ) AS \`ddl\`
    FROM 
      information_schema.columns
    WHERE 
      table_name = '${tbName}'
      AND table_schema = DATABASE()
    GROUP BY 
      table_name;
    `;

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
export async function getPageCountMysql(connName: string, tableName: string, pageSize: number, condition: string) {
  const dbResTotal = await invoker.querySql(
    connName,
    `SELECT COUNT(*) AS total FROM \`${tableName}\` ${condition ? condition : ""};`,
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
export async function getTableDataMysql(connName: string, p: GetTableDataParam) {
  const { itemsTotal, pageTotal } = await getPageCountMysql(connName, p.tableName, p.pageSize, "");

  let offset = p.pageSize * (p.currentPage - 1);
  if (offset < 0) offset = 0;
  const sqlHasPkey = `SELECT * FROM \`${p.tableName}\` ${p.where} LIMIT ${p.pageSize} OFFSET ${offset};`;
  const dbRes = await invoker.querySql(connName, sqlHasPkey);

  return {
    itemsTotal,
    pageTotal,
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as object[]) : [],
  };
}

// 生成重命名表格的语句
export function genRenameTableCmdMysql(oldName: string, newName: string) {
  return `RENAME TABLE \`${oldName}\` TO \`${newName}\`;`;
}

// 生成截断表格的语句
export function genTruncateTableCmdMysql(tbName: string) {
  return `TRUNCATE TABLE \`${tbName}\`;`;
}

// 生成删除表格的语句
export function genDeleteTableCmdMysql(tbName: string) {
  return `DROP TABLE \`${tbName}\`;`;
}

// 生成重命名字段的语句
export function genRenameFieldCmdMysql(tbName: string, oldName: string, newName: string) {
  return `ALTER TABLE \`${tbName}\` CHANGE \`${oldName}\` \`${newName}\`;`;
}

// 生成删除字段的语句
export function genDeleteFieldCmdMysql(tbName: string, fieldName: string) {
  return `ALTER TABLE \`${tbName}\` DROP COLUMN \`${fieldName}\`;`;
}

// 生成变更一行的字段
export function genUpdateFieldCmdMysql(tbName: string, uniqueField: FieldWithValue, fieldArr: FieldWithValue[]) {
  const fda = fieldArr.map((item) => `\`${item.field}\` = ${formatToSqlValueMysql(item.value)}`);

  return `
    UPDATE \`${tbName}\`
    SET 
        ${fda.join(",\n")}
    WHERE \`${uniqueField.field}\` = ${uniqueField.value};
  `;
}

// 生成删除多行的字段
export function genDeleteRowsCmdMysql(tbName: string, fieldName: string, fieldValues: any[]) {
  const values = fieldValues.map((item) => formatToSqlValueMysql(item)).join(",");
  return `DELETE FROM \`${tbName}\` WHERE \`${fieldName}\` IN (${values});`;
}

// 生成插入多行数据
export function genInsertRowsCmdMysql(tbName: string, fieldNames: string[], fieldValues: any[][]) {
  const fields = fieldNames.join(`\`,\``);
  const valArr: any[] = [];
  fieldValues.map((itemRow) => {
    const valRow = itemRow.map((item) => formatToSqlValueMysql(item, true));
    valArr.push(valRow);
  });

  return `INSERT INTO \`${tbName}\` (\`${fields}\`) VALUES (${valArr.join("),(")});`;
}
