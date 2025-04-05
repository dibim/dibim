import { invoker } from "@/invoker";
import { DbConnectionParam, DbCountRes, FieldWithValue, GetTableDataParam, TableStructure } from "../types";
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

// 获取所有表格的大小
type getAllTableSizeRes = {
  table_name: string;
  total_size: string;
};
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
      table_name,
      ROUND((table_bytes + index_bytes) / 1048576.0, 2) || ' MB' AS total_size,
      ROUND(table_bytes / 1048576.0, 2) || ' MB' AS table_size,
      ROUND(index_bytes / 1048576.0, 2) || ' MB' AS index_size
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
  check_constraint: number;
  column_id: number;
  column_name: string;
  data_type: string;
  default_value: string;
  fk_column: number;
  fk_table: number;
  full_ddl: string;
  is_not_null: number;
  is_primary_key: number;
  is_unique: number;
  type_size: number;
};

// 获取表结构
export async function getTableStructureSqlite(connName: string, tbName: string) {
  const sql = `
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
            END AS dflt_value,
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
        ti.cid AS column_id,
        ti.name AS column_name,
        ti.type AS data_type,
        ti.type_size,
        ti.[notnull] AS is_not_null,
        ti.dflt_value AS default_value,
        ti.pk AS is_primary_key,
        fk.fk_table,
        fk.fk_column,
        COALESCE(ui.is_unique, 0) AS is_unique,
        cc.sql AS check_constraint,
        (SELECT sql FROM sqlite_master 
        WHERE type = 'table' AND name = '${tbName}') AS full_ddl
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
  const dbRes = await invoker.querySql(connName, sql);
  const structureArr = JSON.parse(dbRes.data) as TableStructureSqlite[];

  return {
    columnName: [],
    data: structureArr.map((item) => {
      return {
        column_default: item.default_value,
        column_name: item.column_name,
        comment: "", // SQLite不原生支持字段注释
        data_type: item.data_type,
        has_check_conditions: item.check_constraint,
        indexes: [],
        is_foreign_key: item.fk_column > 0,
        is_not_null: item.is_not_null > 0,
        is_primary_key: item.is_primary_key === 1,
        is_unique_key: item.is_unique === 1,
        size: `${item.type_size}`,
      } as TableStructure;
    }),
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

  console.log("ddl  res::: ", res);

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
    return await invoker.execSql(connName, transactionSQL);
  } catch (err) {
    await invoker.execSql(connName, "ROLLBACK;").catch(() => {});
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
