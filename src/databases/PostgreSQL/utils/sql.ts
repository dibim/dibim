import { invoker } from "@/invoker";
import {
  ColumnIndex,
  DbConnectionParam,
  DbCountRes,
  FieldWithValue,
  GetTableDataParam,
  IndexQueryResult,
  TableStructure,
} from "../../types";
import "../types";
import { formatToSqlValuePg } from "./format";

/**
 * 连接到 postgre_sql
 *
 * "postgres://user:password@localhost:5432/mydb?sslmode=require";
 *
 */
export async function connectPg(connName: string, p: DbConnectionParam) {
  return await invoker.connectSql(connName, `postgres://${p.user}:${p.password}@${p.host}:${p.port}/${p.dbName}`);
}

// 获取所有表格名
export async function getAllTableNamePg(connName: string) {
  const sql = `
    SELECT 
        tablename 
    FROM 
        pg_catalog.pg_tables 
    WHERE 
        schemaname NOT IN ('pg_catalog', 'information_schema')
    ;`;

  const dbRes = await invoker.querySql(connName, sql);

  // 把表名整理成一维数组
  const dataArr = dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [];

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dataArr.map((item) => item.tablename),
  };
}

// 获取所有表格的大小
type getAllTableSizeRes = {
  table_name: string;
  total_size: string;
};
export async function getAllTableSizePg(connName: string) {
  const sql = `
    SELECT
        schemaname AS schema_name,
        tablename AS table_name,
        pg_size_pretty(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS total_size,
        pg_size_pretty(pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS table_size,
        pg_size_pretty(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) - 
                      pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS index_size
    FROM
        pg_tables
    WHERE
        schemaname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY
        pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) DESC;
    `;

  const dbRes = await invoker.querySql(connName, sql);

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as getAllTableSizeRes[]) : [],
  };
}

// 获取表结构
export async function getTableStructurePg(connName: string, tbName: string) {
  // 基础列信息
  const columnSql = `
    SELECT
        a.attname AS column_name,
        t.typname AS data_type,
        CASE 
            WHEN t.typname = 'varchar' THEN a.atttypmod - 4
            WHEN t.typname = 'char' THEN a.atttypmod - 4
            WHEN t.typname = 'numeric' THEN ((a.atttypmod - 4) >> 16) & 65535
            ELSE NULL
        END AS size,
        EXISTS(
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = a.attrelid 
            AND a.attnum = ANY(conkey) 
            AND contype = 'p'
        ) AS is_primary_key,
        EXISTS(
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = a.attrelid 
            AND a.attnum = ANY(conkey) 
            AND contype = 'u'
        ) AS is_unique_key,
        EXISTS(
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = a.attrelid 
            AND a.attnum = ANY(conkey) 
            AND contype = 'f'
        ) AS is_foreign_key,
        pg_get_expr(ad.adbin, ad.adrelid) AS column_default,
        a.attnotnull AS is_not_null,
        d.description AS comment
    FROM
        pg_attribute a
    JOIN
        pg_type t ON a.atttypid = t.oid
    LEFT JOIN
        pg_attrdef ad ON (a.attrelid = ad.adrelid AND a.attnum = ad.adnum)
    LEFT JOIN
        pg_description d ON (a.attrelid = d.objoid AND a.attnum = d.objsubid)
    JOIN
        pg_class c ON a.attrelid = c.oid
    JOIN
        pg_namespace n ON c.relnamespace = n.oid
    WHERE
        c.relname = '${tbName}'
        AND n.nspname = 'public' -- TODO: 假设表在 public模式
        AND a.attnum > 0
        AND NOT a.attisdropped
    ORDER BY
        a.attnum;
    `;

  // 索引信息查询
  const indexSql = `
    SELECT
        i.relname AS index_name,
        a.attname AS column_name,
        am.amname AS index_type,
        idx.indisunique AS is_unique,
        idx.indisprimary AS is_primary
    FROM
        pg_index idx
    JOIN
        pg_class i ON i.oid = idx.indexrelid
    JOIN
        pg_class t ON t.oid = idx.indrelid
    JOIN
        pg_namespace n ON n.oid = t.relnamespace
    JOIN
        pg_am am ON i.relam = am.oid
    JOIN
        pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
    WHERE
        t.relname = '${tbName}'
        AND n.nspname = 'public'
    ORDER BY
        i.relname, array_position(idx.indkey, a.attnum);
    `;

  // 执行查询
  const [columnRes, indexRes] = await Promise.all([
    invoker.querySql(connName, columnSql),
    invoker.querySql(connName, indexSql),
  ]);

  // 处理列信息
  const columns = columnRes.data ? (JSON.parse(columnRes.data) as TableStructure[]) : [];
  // 处理索引信息
  const indexes = indexRes.data ? (JSON.parse(indexRes.data) as IndexQueryResult[]) : [];

  // 将索引信息合并到列信息中
  const columnIndexMap: Record<string, ColumnIndex[]> = {};
  indexes.forEach((index) => {
    if (!columnIndexMap[index.column_name]) {
      columnIndexMap[index.column_name] = [];
    }
    columnIndexMap[index.column_name].push({
      name: index.index_name,
      type: index.index_type,
      isUnique: index.is_unique,
      isPrimary: index.is_primary,
    });
  });

  // 合并结果
  const result = columns.map((column) => ({
    ...column,
    size: column.size ? column.size : 0,
    indexes: columnIndexMap[column.column_name] || [],
  }));

  return {
    columnName: columnRes.columnName ? (JSON.parse(columnRes.columnName) as string[]) : [],
    data: result,
  };
}

// 获取表格的 DDL
export async function getTableDdlPg(connName: string, tbName: string) {
  const sql = `
    WITH 
    table_info AS (
        SELECT 
            c.oid,
            n.nspname AS schema_name,
            c.relname AS table_name
        FROM 
            pg_class c
        JOIN 
            pg_namespace n ON n.oid = c.relnamespace
        WHERE 
            c.relname = '${tbName}' AND 
            n.nspname = 'public' AND
            c.relkind = 'r'
    ),
    column_defs AS (
        SELECT 
            ti.oid,
            string_agg(
                '    ' || a.attname || ' ' || 
                pg_catalog.format_type(a.atttypid, a.atttypmod) ||
                CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END ||
                CASE 
                    WHEN a.attidentity = 'd' THEN ' GENERATED BY DEFAULT AS IDENTITY'
                    WHEN a.attidentity = 'a' THEN ' GENERATED ALWAYS AS IDENTITY'
                    ELSE ''
                END ||
                CASE 
                    WHEN pg_catalog.pg_get_expr(ad.adbin, ad.adrelid) IS NOT NULL 
                    THEN ' DEFAULT ' || pg_catalog.pg_get_expr(ad.adbin, ad.adrelid)
                    ELSE ''
                END,
                E',\n'
            ) AS columns
        FROM 
            table_info ti
        JOIN 
            pg_catalog.pg_attribute a ON a.attrelid = ti.oid
        LEFT JOIN 
            pg_catalog.pg_attrdef ad ON (a.attrelid = ad.adrelid AND a.attnum = ad.adnum)
        WHERE 
            a.attnum > 0 AND 
            NOT a.attisdropped
        GROUP BY 
            ti.oid
    ),
    constraint_defs AS (
        SELECT 
            ti.oid,
            string_agg(
                '    CONSTRAINT ' || con.conname || ' ' || 
                pg_catalog.pg_get_constraintdef(con.oid),
                E',\n'
            ) AS constraints
        FROM 
            table_info ti
        JOIN 
            pg_catalog.pg_constraint con ON con.conrelid = ti.oid
        WHERE 
            con.contype IN ('p','u','f','c')
        GROUP BY 
            ti.oid
    )
    SELECT 
        'CREATE TABLE ' || ti.schema_name || '.' || ti.table_name || ' (\n' ||
        cd.columns ||
        CASE WHEN cts.constraints IS NOT NULL THEN E',\n' || cts.constraints ELSE '' END ||
        E'\n);'
    FROM 
        table_info ti
    JOIN 
        column_defs cd ON cd.oid = ti.oid
    LEFT JOIN 
        constraint_defs cts ON cts.oid = ti.oid;`;

  const dbRes = await invoker.querySql(connName, sql);

  const keyStr = "?column?";
  const jjj = dbRes.data ? (JSON.parse(dbRes.data) as { [key: string]: string }[]) : [];

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: jjj.length > 0 && keyStr in jjj[0] ? jjj[0][keyStr] : "",
  };
}

// 获取表格数据
export async function getTableDataPg(connName: string, p: GetTableDataParam) {
  const dbResTotal = await invoker.querySql(connName, `SELECT COUNT(*) AS total FROM "${p.tableName}";`);
  console.log("getTableDataPg dbResTotal>>>>   ", dbResTotal);

  let itemsTotal = 0; // 总条数
  if (dbResTotal && dbResTotal.data) {
    const bbCountRes = JSON.parse(dbResTotal.data) as DbCountRes[];

    if (bbCountRes.length > 0) itemsTotal = bbCountRes[0].total;
  }

  const pageTotal = Math.ceil(itemsTotal / p.pageSize); // 页数

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
  const sqlHasPkey = `
    SELECT 
      * 
    FROM 
      "${p.tableName}"
    ${where}
    ORDER BY 
      ${p.sortField} ${p.sortOrder}    
    LIMIT 
      ${p.pageSize}
    ;`;

  const dbRes = await invoker.querySql(connName, sqlHasPkey);

  return {
    itemsTotal,
    pageTotal,
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as object[]) : [],
  };
}

/**
 * 查询表格数据的时候, 必须使用一个排序字段
 *
 * 优先级: 主键 > 唯一索引 > 索引 > 普通字段
 * 普通字段的优先级: 数值、日期/时间类型 > 字符串类型(按字符的编码排序, 比如 UTF-8)
 * BOOLEAN 不能用, JSON 或复杂类型 行为可能未定义或不符合预期
 *
 * @param tsa 表结构数据
 */
export function getDefultOrderField(tsa: TableStructure[]) {
  // 优先使用索引字段
  for (const f of tsa) {
    // 主键
    if (f.is_primary_key) {
      return f.column_name;
    }

    // 唯一索引
    if (f.is_unique_key) {
      return f.column_name;
    }
  }

  // 找不到索引字段的, 找数字或时间字段
  // 找数字字段
  for (const f of tsa) {
    if (
      f.data_type.includes("int") ||
      f.data_type.includes("float") ||
      f.data_type.includes("serial") ||
      f.data_type.includes("numeric") ||
      f.data_type.includes("decimal") ||
      f.data_type.includes("real") ||
      f.data_type.includes("double") ||
      f.data_type.includes("money")
    ) {
      return f.column_name;
    }
  }
  // 找时间字段
  for (const f of tsa) {
    if (f.data_type.includes("time") || f.data_type.includes("date")) {
      return f.column_name;
    }
  }

  // 找字符串字段
  // 找不到索引字段的, 也找数字或时间字段, 找字符串字段
  for (const f of tsa) {
    if (f.data_type.includes("text") || f.data_type.includes("char")) {
      return f.column_name;
    }
  }

  return "";
}

// 执行事务语句
export async function execTransactionPg(connName: string, sqls: string[]) {
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
export function genRenameTableCmdPg(oldName: string, newName: string) {
  return `ALTER TABLE "${oldName}" RENAME TO "${newName}";`;
}

// 生成截断表格的语句
export function genTruncateTableCmdPg(tbName: string) {
  return `TRUNCATE TABLE "${tbName}";`;
}

// 生成删除表格的语句
export function genDeleteTableCmdPg(tbName: string) {
  return `DROP TABLE "${tbName}";`;
}

// 生成重命名字段的语句
export function genRenameFieldCmdPg(tbName: string, oldName: string, newName: string) {
  return `ALTER TABLE "${tbName}" RENAME COLUMN "${oldName}" TO "${newName}";`;
}

// 生成删除字段的语句
export function genDeleteFieldCmdPg(tbName: string, fieldName: string) {
  return `ALTER TABLE IF EXISTS "${tbName}" DROP COLUMN IF EXISTS "${fieldName}" CASCADE;`;
}

// 生成变更一行的字段
export function genUpdateFieldCmdPg(tbName: string, uniqueField: FieldWithValue, fieldArr: FieldWithValue[]) {
  const fda: string[] = [];
  fieldArr.map((item) => {
    fda.push(`"${item.field}" = ${formatToSqlValuePg(item.vaue)}`);
  });

  return `
    UPDATE "${tbName}"
    SET 
        ${fda.join(",\n")}
    WHERE "${uniqueField.field}" = ${uniqueField.vaue};
  `;
}
