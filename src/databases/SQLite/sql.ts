/**
 *
 * 注意:
 * 查询 SQL 的返回值为了和 Javascript 的命名方式统一, 使用了 lowerCamelCase 命名方式, 因此也要修改 SQL 语句要输出的字段名,
 * 但是:
 * MySQL / MariaDB /  PostgreSQL / SQL Server / Oracle 需要使用引号把字段名套起来才能返回预期的字段名, 否则会变成全部小写.
 * SQLite 可以保留大小写, 但为了统一, 字段名也都套上引号.
 *
 * 数据库	    引用符号	示例
 * PostgreSQL	"	        SELECT "columnName"
 * SQLite	    "       	SELECT "columnName"
 * Oracle	    "	        SELECT "columnName"
 * MySQL	    `       	SELECT `columnName`
 * SQL Server	[]	      SELECT [columnName]
 *
 */
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
import { formatToSqlValueSqlite } from "./format";
import "./types";

/**
 * 连接到 SQLite
 *
 * "sqlite:文件路径";
 *
 */
export async function connectSqlite(connName: string, p: DbConnectionParam) {
  return await invoker.connectSql(connName, `sqlite:${p.filePath}`);
}

// 获取所有表格名
export async function getAllTableNameSqlite(connName: string) {
  const sql = `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`;
  const dbRes = await invoker.querySql(connName, sql);

  // 把表名整理成一维数组
  const dataArr = dbRes.data ? (JSON.parse(dbRes.data) as { name: string }[]) : [];

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dataArr.map((item) => item.name),
  };
}

export async function getAllTableSizeSqlite(connName: string) {
  const sql = `
    WITH storage_info AS (
      SELECT
        COALESCE(i.tbl_name, t.name) AS table_name,  -- 修正字段名
        SUM(CASE WHEN t.type = 'table' THEN s.pgsize ELSE 0 END) AS table_bytes,
        SUM(CASE WHEN i.type = 'index' THEN s.pgsize ELSE 0 END) AS index_bytes
      FROM dbstat s
      LEFT JOIN sqlite_schema t 
        ON s.name = t.name 
        AND t.type = 'table' 
        AND t.name NOT LIKE 'sqlite_%'  -- 过滤系统表
      LEFT JOIN sqlite_schema i 
        ON s.name = i.name 
        AND i.type = 'index' 
        AND i.tbl_name NOT LIKE 'sqlite_%'  -- 修正字段名
      GROUP BY COALESCE(i.tbl_name, t.name)
      )
    SELECT
      'main' AS schema_name,
      table_name as "tableName",
      ROUND((table_bytes + index_bytes) / 1048576.0, 2) || ' MB' AS "totalSize",
      ROUND(table_bytes / 1048576.0, 2) || ' MB' AS "tableSize",
      ROUND(index_bytes / 1048576.0, 2) || ' MB' AS "indexSize"
    FROM storage_info
    ORDER BY (table_bytes + index_bytes) DESC;
  `;

  const dbRes = await invoker.querySql(connName, sql);

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as getAllTableSizeRes[]) : [],
  };
}

type TableStructureSqlite = {
  checkConstraint: number;
  columnId: number;
  name: string;
  type: string;
  defaultValue: string;
  fkColumn: number;
  fkTable: number;
  fullDdl: string;
  isNotNull: number;
  isPrimaryKey: number;
  isUnique: number;
  typeSize: number;
};

// 获取表结构
export async function getTableStructureSqlite(connName: string, tbName: string) {
  // 基础字段信息
  const columnSql = `
    WITH 
    -- 基础字段信息
    table_info AS (
      SELECT 
        cid,
        name,
        type,
        CASE 
          WHEN type LIKE '%(%)%' THEN
            substr(
              type,
              instr(type, '(') + 1,
              instr(type, ')') - instr(type, '(') - 1
            )
          ELSE NULL
        END AS type_size,
        [notnull],
        CASE 
            WHEN dflt_value IS NULL THEN 'NULL'
            WHEN dflt_value = '' THEN ''''''
            ELSE dflt_value 
        END AS default_value,
        pk
      FROM pragma_table_info('${tbName}')
    ),
    -- 外键信息
    fk_info AS (
      SELECT 
        [from] AS column_name,
        [table] AS fk_table,
        [to] AS fk_column
      FROM pragma_foreign_key_list('${tbName}')
    ),
    -- 唯一索引信息
    unique_indexes AS (
      SELECT 
        ix.name AS column_name,
        1 AS is_unique
      FROM 
        pragma_index_list('${tbName}') il
      JOIN 
        pragma_index_xinfo(il.name) ix
      WHERE 
        il.[unique] = 1
      GROUP BY 
        ix.name
    ),
    -- 检查约束信息
    check_constraints AS (
      SELECT 
        name AS constraint_name,
        sql
      FROM 
        sqlite_master
      WHERE 
        type = 'table'
        AND name = '${tbName}'
        AND sql LIKE '%CHECK%'
    )
    SELECT 
      ti.cid AS "columnId",
      ti.name AS "name",
      ti.type AS "type",
      ti.type_size AS "typeSize",
      ti.[notnull] AS "isNotNull",
      ti.default_value AS "defaultValue",
      ti.pk AS "isPrimaryKey",
      fk.fk_table AS "fkTable",
      fk.fk_column AS "fkColumn",
      COALESCE(ui.is_unique, 0) AS "isUnique",
      cc.sql AS "checkConstraint",
      (SELECT sql FROM sqlite_master 
      WHERE type = 'table' AND name = '${tbName}') AS "fullDdl"
    FROM 
      table_info ti
    LEFT JOIN 
      fk_info fk ON ti.name = fk.column_name
    LEFT JOIN 
      unique_indexes ui ON ti.name = ui.column_name
    LEFT JOIN
      check_constraints cc ON 1=1
    ORDER BY 
      ti.cid;
  ;`;

  // 索引信息查询
  const indexSql = `
    WITH 
    -- 获取所有普通索引
    regular_indexes AS (
      SELECT 
        il.name AS indexName,
        ii.name AS columnName,
        CASE WHEN il.sql LIKE '%UNIQUE%' THEN 1 ELSE 0 END AS isUniqueKey,
        0 AS isPrimaryKey
      FROM 
        sqlite_master il
        JOIN pragma_index_info(il.name) ii
      WHERE 
        il.type = 'index'
        AND il.tbl_name = '${tbName}'
        AND il.name NOT LIKE 'sqlite_autoindex_%'
    ),
    -- 获取主键列信息（修正点：移除错误的 tbl_name）
    primary_keys AS (
      SELECT 
        'sqlite_autoindex_' || '${tbName}' || '_' || pk AS indexName,
        name AS columnName,
        1 AS isUniqueKey,
        1 AS isPrimaryKey,
        pk AS seqno
      FROM 
        pragma_table_info('${tbName}')
      WHERE 
        pk > 0
    )
    -- 合并结果
    SELECT 
      indexName AS "indexName",
      columnName AS "columnName",
      isUniqueKey AS "isUniqueKey",
      isPrimaryKey AS "isPrimaryKey",
      'btree' AS "indexType"
    FROM regular_indexes
    UNION ALL
    SELECT 
      indexName,
      columnName,
      isUniqueKey,
      isPrimaryKey,
      'btree' AS "indexType"
    FROM primary_keys
    ORDER BY indexName, columnName;
    `;
  // 执行查询
  const [columnRes, indexRes] = await Promise.all([
    invoker.querySql(connName, columnSql),
    invoker.querySql(connName, indexSql),
  ]);

  // 处理字段信息
  const columns = columnRes.data ? (JSON.parse(columnRes.data) as TableStructureSqlite[]) : [];
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
  const result: FieldStructure[] = columns.map((column) => ({
    defaultValue: column.defaultValue,
    name: column.name,
    comment: "", // SQLite不原生支持字段注释
    type: column.type,
    hasCheckConditions: column.checkConstraint,
    isForeignKey: column.fkColumn > 0,
    isNullable: column.isNotNull == 0,
    isPrimaryKey: column.isPrimaryKey === 1,
    isUniqueKey: column.isUnique === 1,
    size: `${column.typeSize}`,
    indexes: columnIndexMap[column.name] || [],
  }));

  return {
    columnName: [],
    data: result,
  };
}

// 获取表格的 DDL
export async function getTableDdlSqlite(connName: string, tbName: string) {
  const sql = `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = '${tbName}';`;

  // TODO: 语句改了, 后续逻辑要改
  const dbRes = await invoker.querySql(connName, sql);

  let res = "";

  if (dbRes.data && dbRes.data.length > 0) {
    const data = JSON.parse(dbRes.data) as { sql: string }[];
    res = data[0].sql;
  }

  return {
    columnName: [],
    data: res,
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
export async function getPageCountSqlite(connName: string, tableName: string, pageSize: number, condition: string) {
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
export async function getTableDataSqlite(connName: string, p: GetTableDataParam) {
  const { itemsTotal, pageTotal } = await getPageCountSqlite(connName, p.tableName, p.pageSize, "");

  // 如果没有主键, 且没有指定排序字段
  // TODO: 实现逻辑
  // const sqlNoPkey = `
  //   WITH numbered_rows AS (
  //       SELECT
  //           *,
  //           ROW_NUMBER() OVER (ORDER BY created_at) AS row_num
  //       FROM products
  //   )
  //   SELECT *
  //   FROM numbered_rows
  //   WHERE row_num BETWEEN 11 AND 20; -- 第二页，每页 10 条数据
  // `;

  // 有指定排序数据的
  const where = p.lastOrderByValue === null ? "" : `WHERE ${p.sortField} > ${p.lastOrderByValue}`;
  const sqlHasPkey = `SELECT * FROM "${p.tableName}" ${where} ORDER BY ${p.sortField} ${p.sortOrder} LIMIT ${p.pageSize};`;
  const dbRes = await invoker.querySql(connName, sqlHasPkey);

  return {
    itemsTotal,
    pageTotal,
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as object[]) : [],
  };
}

// 执行事务语句
export async function execTransactionSqlite(connName: string, sqls: string[]) {
  const transactionSQL = `
    BEGIN;
      ${sqls.join(";\n")};
    COMMIT;
  `;

  try {
    return await invoker.execManySql(connName, transactionSQL);
  } catch (err) {
    await invoker.execManySql(connName, "ROLLBACK;").catch(() => {});
    throw err;
  }
}

// 生成重命名表格的语句
export function genRenameTableCmdSqlite(oldName: string, newName: string) {
  return `ALTER TABLE "${oldName}" RENAME TO "${newName}";`;
}

// 生成截断表格的语句
export function genTruncateTableCmdSqlite(tbName: string) {
  return `TRUNCATE TABLE "${tbName}";`;
}

// 生成删除表格的语句
export function genDeleteTableCmdSqlite(tbName: string) {
  return `DROP TABLE "${tbName}";`;
}

// 生成重命名字段的语句
export function genRenameFieldCmdSqlite(tbName: string, oldName: string, newName: string) {
  return `ALTER TABLE "${tbName}" RENAME COLUMN "${oldName}" TO "${newName}";`;
}

// 生成删除字段的语句
export function genDeleteFieldCmdSqlite(tbName: string, fieldName: string) {
  return `ALTER TABLE IF EXISTS "${tbName}" DROP COLUMN IF EXISTS "${fieldName}" CASCADE;`;
}

// 生成变更一行的字段
export function genUpdateFieldCmdSqlite(tbName: string, uniqueField: FieldWithValue, fieldArr: FieldWithValue[]) {
  const fda = fieldArr.map((item) => `"${item.field}" = ${formatToSqlValueSqlite(item.value)}`);

  return `
    UPDATE "${tbName}"
    SET 
        ${fda.join(",\n")}
    WHERE "${uniqueField.field}" = ${uniqueField.value};
  `;
}

// 生成删除多行的字段
export function genDeleteRowsCmdSqlite(tbName: string, fieldName: string, fieldValues: any[]) {
  const values = fieldValues.map((item) => formatToSqlValueSqlite(item)).join(",");
  return `DELETE FROM "${tbName}" WHERE "${fieldName}" IN (${values});`;
}

// 生成插入多行数据
export function genInsertRowsCmdSqlite(tbName: string, fieldNames: string[], fieldValues: any[][]) {
  const fields = fieldNames.join(`","`);
  const valArr: any[] = [];
  fieldValues.map((itemRow) => {
    const valRow = itemRow.map((item) => formatToSqlValueSqlite(item, true));
    valArr.push(valRow);
  });

  return `INSERT INTO "${tbName}" ("${fields}") VALUES (${valArr.join("),(")});`;
}
