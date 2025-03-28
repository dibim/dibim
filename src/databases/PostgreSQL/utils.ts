import { invoker } from "@/invoke";
import {
  ColumnIndex,
  CommonSQLValue,
  DbConnectionParam,
  DbCountRes,
  GetTableDataParam,
  IndexQueryResult,
  TableStructure,
} from "../types";
import { formatToSqlValueCommon } from "../utils";
import "./types";
import { PGValue } from "./types";

/**
 * 判断是否是PostgreSQL函数调用的形式
 * 函数名：PostgreSQL 必须 带括号（如 now() 合法，但 now 不合法）
 * 字符串引号：PostgreSQL 支持单引号 'str'（字符串值）和双引号 "str"（标识符引用）
 * 特殊函数：PostgreSQL 包含特有函数（如 jsonb_set()、regexp_match()）
 * @param str
 * @returns
 */
export function isPostgresFunctionCall(str: string): boolean {
  return /^[a-z_][a-z0-9_]*\(.*\)$/i.test(str);
}

/**
 * 格式化 PostgreSQL 的数据类型
 * @param value
 * @param allowFuncAcll 是否允许函数调用的形式
 * @returns
 */
export function formatToSqlValuePg(value: PGValue, allowFuncAcll?: boolean): string {
  // 首先检查是否是调用 PostgreSQL 函数
  if (allowFuncAcll && typeof value === "string" && isPostgresFunctionCall(value)) {
    return value;
  }

  // 尝试通用格式化
  try {
    return formatToSqlValueCommon(value as CommonSQLValue);
  } catch (e) {
    // 如果通用格式化失败，继续处理 PG 特有类型
  }

  // 处理 PostgreSQL 特有类型
  if (value instanceof Uint8Array) {
    return `'\\x${Buffer.from(value).toString("hex")}'`; // bytea 格式
  }

  if (value instanceof RegExp) {
    return `'${value.source}'`; // 将正则转换为其字符串形式
  }

  if (value instanceof Map) {
    return formatToSqlValuePg(Object.fromEntries(value)); // 转换为 JSON 对象
  }

  if (value instanceof Set) {
    return formatToSqlValuePg([...value]); // 转换为数组
  }

  // 处理 JSON/JSONB 类型
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return `'${JSON.stringify(value)}'::jsonb`;
  }

  // 处理 PostgreSQL 数组类型（多维数组）
  if (Array.isArray(value)) {
    const formattedArray = value
      .map((v) => {
        // 特殊处理数组中的 null 值
        if (v === null) return "NULL";

        // 递归格式化每个元素
        const element = formatToSqlValuePg(v);

        // 处理元素中的引号和转义
        return typeof v === "string" ? `"${element.replace(/"/g, '""')}"` : element;
      })
      .join(", ");

    return `ARRAY[${formattedArray}]`;
  }

  // 默认处理（不应执行到这里）
  throw new Error(`Unsupported PostgreSQL type: ${typeof value}`);
}

/**
 * 连接到 postgre_sql
 *
 * "postgres://user:password@localhost:5432/mydb?sslmode=require";
 *
 *
 */
export async function connectPg(connName: string, p: DbConnectionParam) {
  return await invoker.connectSql(
    connName,
    // `host=${p.host} port=${p.port} user=${p.user} password=${p.password} dbname=${p.dbname}`,
    `postgres://${p.user}:${p.password}@${p.host}:${p.port}/${p.dbName}`,
  );
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
// FIXME: 实现比较复杂, 推迟
export async function getTableDdlPg(connName: string, tbName: string) {
  const sql = `SELECT pg_get_tabledef('${tbName}');`;
  const dbRes = await invoker.querySql(connName, sql);

  console.log(" getTableDdlPg::::dbRes  ", dbRes);

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [],
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
    data: dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [],
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

// 执行语句
export async function execPg(connName: string, sql: string) {
  return await invoker.execSql(connName, sql);
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

// 生成建表语句
// FIXME: 实现功能
export function genCreateTableCmdPg(tbName: string) {
  return `
    -- 尽可能兼容三者的语法
    CREATE TABLE cross_db_example (
        id SERIAL PRIMARY KEY,          -- PostgreSQL 自增主键
        id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL 自增主键
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- SQLite 自增主键

        name VARCHAR(100) NOT NULL DEFAULT '',
        price NUMERIC(10,2) NOT NULL DEFAULT 0.00,

        code VARCHAR(50) UNIQUE,      -- 唯一约束
        
        PRIMARY KEY (order_id, product_id) -- 复合主键
        UNIQUE (department_id, employee_code) -- 复合唯一约束

  
    );
`;
}
