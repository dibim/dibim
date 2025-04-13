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
  AllAlterAction,
  DbConnectionParam,
  DbCountRes,
  FieldIndex,
  FieldStructure,
  FieldWithValue,
  GetTableDataParam,
  getAllTableSizeRes,
} from "../types";
import { genAlterCmdPg } from "./builder_alter_table";
import { formatToSqlValuePg } from "./format";
import "./types";

export class BuilderPg {
  /**
   * 连接到 PostgreSQL
   *
   * "postgres://user:password@localhost:5432/mydb?sslmode=require";
   *
   */
  static async connect(connName: string, p: DbConnectionParam) {
    return await invoker.connectSql(connName, `postgres://${p.user}:${p.password}@${p.host}:${p.port}/${p.dbName}`);
  }

  // 获取所有表格名
  static async getAllTableName(connName: string) {
    const sql = `
      SELECT 
          tablename as "tableName"
      FROM 
          pg_catalog.pg_tables 
      WHERE 
          schemaname NOT IN ('pg_catalog', 'information_schema')
      ;`;

    const dbRes = await invoker.querySql(connName, sql);

    // 把表名整理成一维数组
    const dataArr = dbRes.data ? (JSON.parse(dbRes.data) as { tableName: string }[]) : [];

    return {
      columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
      data: dataArr.map((item) => item.tableName),
    };
  }

  static async getAllTableSize(connName: string) {
    const sql = `
      SELECT
        schemaname AS "schemaName",
        tablename AS "tableName",
        pg_size_pretty(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS "totalSize",
        pg_size_pretty(pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS "tableSize",
        pg_size_pretty(
          pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) - 
          pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))
        ) AS "indexSize"
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
  static async getTableStructure(connName: string, tbName: string) {
    // 基础字段信息
    const columnSql = `
      SELECT
        a.attname AS "name",
        t.typname AS "type",
        CASE 
          WHEN t.typname = 'varchar' THEN a.atttypmod - 4
          WHEN t.typname = 'char' THEN a.atttypmod - 4
          WHEN t.typname = 'numeric' THEN ((a.atttypmod - 4) >> 16) & 65535
          ELSE NULL
        END AS "size",
        EXISTS(
          SELECT 1 
          FROM pg_constraint 
          WHERE conrelid = a.attrelid 
            AND a.attnum = ANY(conkey) 
            AND contype = 'p'
        ) AS "isPrimaryKey",
        EXISTS(
          SELECT 1 
          FROM pg_constraint 
          WHERE conrelid = a.attrelid 
            AND a.attnum = ANY(conkey) 
            AND contype = 'u'
        ) AS "isUniqueKey",
        EXISTS(
          SELECT 1 
          FROM pg_constraint 
          WHERE conrelid = a.attrelid 
            AND a.attnum = ANY(conkey) 
            AND contype = 'f'
        ) AS "isForeignKey",
        pg_get_expr(ad.adbin, ad.adrelid) AS "defaultValue",
        a.attnotnull AS "isNotNull",
        d.description AS "comment"
      FROM
        pg_attribute a
        JOIN pg_type t ON a.atttypid = t.oid
        LEFT JOIN pg_attrdef ad ON (a.attrelid = ad.adrelid AND a.attnum = ad.adnum)
        LEFT JOIN pg_description d ON (a.attrelid = d.objoid AND a.attnum = d.objsubid)
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE
        c.relname = '${tbName}'
        AND n.nspname = 'public' -- TODO: 假设表在 public 模式
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY
        a.attnum;
      `;

    // 索引信息查询
    const indexSql = `
      SELECT
        i.relname AS "indexName",
        a.attname AS "columnName",
        am.amname AS "indexType",
        idx.indisunique AS "isUniqueKey",
        idx.indisprimary AS "isPrimaryKey"
      FROM
        pg_index idx
        JOIN pg_class i ON i.oid = idx.indexrelid
        JOIN pg_class t ON t.oid = idx.indrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_am am ON i.relam = am.oid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
      WHERE
        t.relname = '${tbName}'
        AND n.nspname = 'public'  -- TODO: 假设表在 public 模式
      ORDER BY
        i.relname, array_position(idx.indkey, a.attnum);
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
  static async getTableDdl(connName: string, tbName: string) {
    const sql = `
      WITH 
      table_info AS (
        SELECT 
          c.oid,
          n.nspname AS schema_name,
          c.relname AS table_name
        FROM 
          pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE 
          c.relname = '${tbName}' AND n.nspname = 'public' AND c.relkind = 'r'
      ),
      column_defs AS (
        SELECT 
          ti.oid,
          string_agg(
            '    "' || a.attname || '" ' || 
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
          JOIN pg_catalog.pg_attribute a ON a.attrelid = ti.oid
          LEFT JOIN pg_catalog.pg_attrdef ad ON (a.attrelid = ad.adrelid AND a.attnum = ad.adnum)
        WHERE 
          a.attnum > 0 AND NOT a.attisdropped
        GROUP BY 
          ti.oid
      ),

      constraint_defs AS (
        SELECT 
          ti.oid,
          string_agg(
            '    CONSTRAINT "' || con.conname || '" ' ||
            CASE 
              -- 主键约束
              WHEN con.contype = 'p' THEN
                  'PRIMARY KEY (' || 
                  (SELECT string_agg('"' || a.attname || '"', ', ')
                  FROM pg_attribute a
                  WHERE a.attrelid = con.conrelid
                  AND a.attnum = ANY(con.conkey)) || 
                  ')'
              -- 外键约束
              WHEN con.contype = 'f' THEN
                  'FOREIGN KEY (' || 
                  (SELECT string_agg('"' || a.attname || '"', ', ')
                  FROM pg_attribute a
                  WHERE a.attrelid = con.conrelid
                  AND a.attnum = ANY(con.conkey)) || 
                  ') REFERENCES ' ||
                  (SELECT n.nspname || '."' || c.relname || '"'
                  FROM pg_class c
                  JOIN pg_namespace n ON n.oid = c.relnamespace
                  WHERE c.oid = con.confrelid) || 
                  ' (' ||
                  (SELECT string_agg('"' || a.attname || '"', ', ')
                  FROM pg_attribute a
                  WHERE a.attrelid = con.confrelid
                  AND a.attnum = ANY(con.confkey)) ||
                  ')'
                -- 其他约束原样输出
                ELSE pg_catalog.pg_get_constraintdef(con.oid)
            END,
            E',\n'
          ) AS constraints
        FROM 
          table_info ti
        JOIN pg_catalog.pg_constraint con ON con.conrelid = ti.oid
        WHERE 
          con.contype IN ('p','u','f','c')
        GROUP BY 
          ti.oid
      )

      SELECT 
        'CREATE TABLE "' || ti.schema_name || '"."' || ti.table_name || '" (\n' ||
        cd.columns ||
        CASE WHEN cts.constraints IS NOT NULL THEN E',\n' || cts.constraints ELSE '' END ||
        E'\n);'
      FROM 
        table_info ti
      JOIN column_defs cd ON cd.oid = ti.oid
      LEFT JOIN constraint_defs cts ON cts.oid = ti.oid;
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
  static async getPageCount(connName: string, tableName: string, pageSize: number, condition: string) {
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
  static async getTableData(connName: string, p: GetTableDataParam) {
    const { itemsTotal, pageTotal } = await this.getPageCount(connName, p.tableName, p.pageSize, "");

    let offset = p.pageSize * (p.currentPage - 1);
    if (offset < 0) offset = 0;
    let fieldStr = p.fields.length === 1 && p.fields[0] === "*" ? "*" : `"${p.fields.join('","')}"`;
    let sortStr =
      p.sortField.length > 0
        ? `ORDER BY ${p.sortField.map((item) => `"${item.fieldName}" ${item.direction}`).join(",")}`
        : "";
    const sql = `SELECT ${fieldStr} FROM "${p.tableName}" ${p.where} ${sortStr} LIMIT ${p.pageSize} OFFSET ${offset};`;
    const dbRes = await invoker.querySql(connName, sql);

    return {
      itemsTotal,
      pageTotal,
      columnName: dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : [],
      data: dbRes.data ? (JSON.parse(dbRes.data) as object[]) : [],
    };
  }

  // 生成重命名表格的语句
  static genRenameTableCmd(oldName: string, newName: string) {
    return `ALTER TABLE "${oldName}" RENAME TO "${newName}";`;
  }

  // 生成截断表格的语句
  static genTruncateTableCmd(tbName: string) {
    return `TRUNCATE TABLE "${tbName}";`;
  }

  // 生成删除表格的语句
  static genDeleteTableCmd(tbName: string) {
    return `DROP TABLE "${tbName}";`;
  }

  // 生成重命名字段的语句
  static genRenameFieldCmd(tbName: string, oldName: string, newName: string) {
    return `ALTER TABLE "${tbName}" RENAME COLUMN "${oldName}" TO "${newName}";`;
  }

  // 生成删除字段的语句
  static genDeleteFieldCmd(tbName: string, fieldName: string) {
    return `ALTER TABLE IF EXISTS "${tbName}" DROP COLUMN IF EXISTS "${fieldName}" CASCADE;`;
  }

  // 生成变更一行的字段
  static genUpdateFieldCmd(tbName: string, uniqueField: FieldWithValue, fieldArr: FieldWithValue[]) {
    const fda = fieldArr.map((item) => `"${item.field}" = ${formatToSqlValuePg(item.value)}`);

    return `
      UPDATE "${tbName}"
      SET 
          ${fda.join(",\n")}
      WHERE "${uniqueField.field}" = ${uniqueField.value};
    `;
  }

  // 生成删除多行的字段
  static genDeleteRowsCmd(tbName: string, fieldName: string, fieldValues: any[]) {
    const values = fieldValues.map((item) => formatToSqlValuePg(item)).join(",");
    return `DELETE FROM "${tbName}" WHERE "${fieldName}" IN (${values});`;
  }

  // 生成插入多行数据
  static genInsertRowsCmd(tbName: string, fieldNames: string[], fieldValues: any[][]) {
    const fields = fieldNames.join(`","`);
    const valArr: any[] = [];
    fieldValues.map((itemRow) => {
      const valRow = itemRow.map((item) => formatToSqlValuePg(item, true));
      valArr.push(valRow);
    });

    return `INSERT INTO "${tbName}" ("${fields}") VALUES (${valArr.join("),(")});`;
  }

  // 生成复制表格的语句
  static genCopyTableCmd(tbName: string, tbNameNew: string) {
    // 此语句不能复制索引, 要使用后面的语句才行
    // return `CREATE TABLE "${tbNameNew}" AS SELECT * FROM "${tbName}";`;
    return `
      CREATE TABLE "${tbNameNew}" (LIKE ${tbName} INCLUDING ALL);
      INSERT INTO "${tbNameNew}" SELECT * FROM "${tbName}";
    `;
  }

  // 生成变更表格的语句
  static genAlterCmd(val: AllAlterAction[]) {
    return genAlterCmdPg(val);
  }
}
