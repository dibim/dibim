import { DbConnectionParams, GetTableDataParam } from "../types";
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
  // 非空约束
  // const notNullRes = await invoker.query(
  //   testConnName,
  //   `
  //   SELECT
  //     column_name,
  //     is_nullable
  //   FROM
  //     information_schema.columns
  //   WHERE
  //     table_name = '${tbName}';
  //   `,
  // );

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
  // const notNullResArr = notNullRes.data ? (JSON.parse(notNullRes.data) as NotNullRes[]) : [];
  const primaryKeysResArr = primaryKeysRes.data ? (JSON.parse(primaryKeysRes.data) as PrimaryKeysRes[]) : [];
  const uniqueKeysResArr = UniqueKeysRes.data ? (JSON.parse(UniqueKeysRes.data) as UniqueKeysResRes[]) : [];

  console.log("primaryKeysResArr:::", primaryKeysResArr);

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

// 获取表格数据
export async function getTableDataPg(p: GetTableDataParam) {
  // TODO: 添加分页
  const sql = `
    SELECT * 
    FROM ${p.tableName}
    ${p.orderBy ? "ORDER BY " + p.orderBy : ""}
    LIMIT ${p.pageSize}
    ;`;

  const dbRes = await invoker.query(testConnName, sql);

  return {
    columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
    data: dbRes.data ? (JSON.parse(dbRes.data) as { tablename: string }[]) : [],
  };
}
