import { DbConnectionParams, DbCountRes, GetTableDataParam } from "../types";
import { invoker } from "./invoke";
import {
  CheckConstraintsRes,
  CommentRes,
  ForeignKeysRes,
  PrimaryKeysRes,
  TableStructureCol,
  TableStructurePostgresql,
  UniqueKeysResRes,
} from "./types";

const testConnName = "testPg";

/**
 * 连接到 postgre_sql
 *
 * "postgres://user:password@localhost:5432/mydb?sslmode=require";
 *
 *
 */
export async function connectPg(p: DbConnectionParams) {
  return await invoker.connect(
    testConnName,
    // `host=${p.host} port=${p.port} user=${p.user} password=${p.password} dbname=${p.dbname}`,
    `postgres://${p.user}:${p.password}@${p.host}:${p.port}/${p.dbname}`,
  );
}

// 获取所有表格名
export async function getAllTablesPg() {
  const sql = `
    SELECT 
        tablename 
    FROM 
        pg_catalog.pg_tables 
    WHERE 
        schemaname NOT IN ('pg_catalog', 'information_schema')
    ;`;

  const dbRes = await invoker.query(testConnName, sql);

  // 把表名整理成一维数组
  const dataArr = dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [];

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dataArr.map((item) => item.tablename),
  };
}

// 获取表结构
export async function getTableStructurePg(tbName: string) {
  // 基础列信息
  const sql = `
    SELECT *
    FROM information_schema.columns
    WHERE table_name = '${tbName}';
    ;`;

  const dbRes = await invoker.query(testConnName, sql);

  // 主键信息
  const primaryKeysRes = await invoker.query(
    testConnName,
    `
    SELECT column_name 
    FROM information_schema.key_column_usage
    WHERE table_name = '${tbName}' AND constraint_name IN (
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = '${tbName}' AND constraint_type = 'PRIMARY KEY'
    )
  `,
  );

  // 外键信息
  const foreignKeysRes = await invoker.query(
    testConnName,
    `
    SELECT 
      conname AS constraint_name,
      confrelid::regclass AS referenced_table,
      af.attname AS referencing_column,
      af_ref.attname AS referenced_column
    FROM pg_constraint AS c
    JOIN pg_attribute AS af ON af.attnum = ANY(c.conkey) AND af.attrelid = c.conrelid
    JOIN pg_attribute AS af_ref ON af_ref.attnum = ANY(c.confkey) AND af_ref.attrelid = c.confrelid
    WHERE c.conrelid = '${tbName}'::regclass AND c.contype = 'f'
  `,
  );

  // 唯一约束
  const UniqueKeysRes = await invoker.query(
    testConnName,
    `
    SELECT 
      kcu.column_name,
      tc.constraint_name
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE 
      tc.table_name = '${tbName}'
      AND tc.constraint_type = 'UNIQUE';
  `,
  );

  //  检查约束
  const constraintsRes = await invoker.query(
    testConnName,
    `
    SELECT 
      conname AS constraint_name,
      pg_get_constraintdef(c.oid) AS check_condition
    FROM 
      pg_constraint AS c
    WHERE 
      c.conrelid = '${tbName}'::regclass
      AND c.contype = 'c';
  `,
  );

  // 备注
  const commentRes = await invoker.query(
    testConnName,
    `
    SELECT 
      cols.column_name,
      pg_catalog.col_description(c.oid, cols.ordinal_position::int) AS comment
    FROM 
      information_schema.columns AS cols
      JOIN pg_catalog.pg_class AS c ON c.relname = cols.table_name
    WHERE 
      cols.table_name = '${tbName}';
    `,
  );

  const colArr = dbRes.data ? (JSON.parse(dbRes.data) as TableStructureCol[]) : [];

  // 逮捕虫的数据
  const checkConstraintsResArr = constraintsRes.data ? (JSON.parse(constraintsRes.data) as CheckConstraintsRes[]) : [];
  const commentResArr = commentRes.data ? (JSON.parse(commentRes.data) as CommentRes[]) : [];
  const foreignKeysResArr = foreignKeysRes.data ? (JSON.parse(foreignKeysRes.data) as ForeignKeysRes[]) : [];
  const primaryKeysResArr = primaryKeysRes.data ? (JSON.parse(primaryKeysRes.data) as PrimaryKeysRes[]) : [];
  const uniqueKeysResArr = UniqueKeysRes.data ? (JSON.parse(UniqueKeysRes.data) as UniqueKeysResRes[]) : [];

  function getcomment(column_name: string) {
    const res = commentResArr.find((fk) => fk.column_name === column_name);
    return res ? res.comment : "";
  }

  const columns: TableStructurePostgresql[] = colArr.map((col) => ({
    ...col,

    comment: getcomment(col.column_name),
    has_check_conditions: checkConstraintsResArr.some((cc) => cc.constraint_name === col.column_name),
    has_foreign_key: foreignKeysResArr.some((fk) => fk.referencing_column === col.column_name),
    // is_nullable: notNullResArr.some((nn) => nn.column_name === col.column_name),
    is_primary_key: primaryKeysResArr.some((pk) => pk.column_name === col.column_name),
    is_unique: uniqueKeysResArr.some((uk) => uk.column_name === col.column_name),
  }));

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: columns,
  };
}

// 获取表格的 DDL
// FIXME: 实现比较复杂, 推迟
export async function getTableDdlPg(tbName: string) {
  const sql = `SELECT pg_get_tabledef('${tbName}');`;
  const dbRes = await invoker.query(testConnName, sql);

  console.log(" getTableDdlPg::::dbRes  ", dbRes);

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [],
  };
}
// 获取表格数据
export async function getTableDataPg(p: GetTableDataParam) {
  const dbResTotal = await invoker.query(testConnName, `SELECT COUNT(*) AS total FROM "${p.tableName}";`);
  console.log("dbResTotal>>>>   ", dbResTotal);

  let itemsTotal = 0; // 总条数
  if (dbResTotal && dbResTotal.data) {
    const bbCountRes = JSON.parse(dbResTotal.data) as DbCountRes;
    itemsTotal = bbCountRes.total;
  }

  const pageTotal = Math.ceil(itemsTotal / p.pageSize); // 页数

  // TODO: 必须找到一个排序字段, 优先级: 主键 > 唯一索引 > 索引 > 第一个字段
  //       数值、日期/时间类型 优先, 字符串类型 次之,
  //       BOOLEAN 不能用 , JSON 或复杂类型 行为可能未定义或不符合预期
  if (p.orderBy) {
    // TODO: 临时使用 id
    p.orderBy = "id ASC";
    // TODO: 查询表结构后使用 getRankField
  }

  // 如果没有主键, 且没有指定排序字段
  const sqlNoPkey = `  
    WITH numbered_rows AS (
        SELECT 
            *, 
            ROW_NUMBER() OVER (ORDER BY created_at) AS row_num
        FROM products
    )
    SELECT * 
    FROM numbered_rows
    WHERE row_num BETWEEN 11 AND 20; -- 第二页，每页 10 条数据
  `;

  //
  const sqlHasPkey = `
    SELECT 
      * 
    FROM 
      "${p.tableName}"
    ORDER BY 
      ${p.orderBy}
    LIMIT 
      ${p.pageSize}
    ;`;

  const dbRes = await invoker.query(testConnName, sqlHasPkey);

  return {
    itemsTotal,
    pageTotal,
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [],
  };
}

/**
 * 查询表格数据的时候, 必须找到一个排序字段
 *
 * 优先级: 主键 > 唯一索引 > 索引 > 普通字段
 * 普通字段的优先级: 数值、日期/时间类型 > 字符串类型(按字符的编码排序, 比如 UTF-8)
 * BOOLEAN 不能用, JSON 或复杂类型 行为可能未定义或不符合预期
 *
 * @param tsa 表结构数据
 */
export function getRankField(tsa: TableStructurePostgresql[]) {
  // 优先使用索引字段
  for (const f of tsa) {
    // 主键
    if (f.is_primary_key) {
      return f.column_name;
    }

    // 唯一索引
    if (f.is_unique) {
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
}
