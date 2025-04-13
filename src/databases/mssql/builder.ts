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
import { formatToSqlValueMssql } from "./format";
import "./types";

export class GeneratorMssql {
  /**
   * 连接到 SQL Server
   *
   * "mssql://user:password@localhost:1433/mydb";
   *
   */
  static async connect(connName: string, p: DbConnectionParam) {
    return await invoker.connectSql(connName, `mssql://${p.user}:${p.password}@${p.host}:${p.port}/${p.dbName}`);
  }

  // 获取所有表格名
  static async getAllTableName(connName: string) {
    const sql = `
      SELECT 
          TABLE_NAME AS [tableName]
      FROM 
          INFORMATION_SCHEMA.TABLES 
      WHERE 
          TABLE_TYPE = 'BASE TABLE'
          AND TABLE_CATALOG = DB_NAME()
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
        s.name AS [schemaName],
        t.name AS [tableName],
        CAST(SUM(a.total_pages) * 8.0 / 1024 AS VARCHAR) + ' MB' AS [totalSize],
        CAST(SUM(a.used_pages) * 8.0 / 1024 AS VARCHAR) + ' MB' AS [tableSize],
        CAST(SUM(a.total_pages - a.used_pages) * 8.0 / 1024 AS VARCHAR) + ' MB' AS [indexSize]
      FROM
        sys.tables t
        JOIN sys.indexes i ON t.object_id = i.object_id
        JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
        JOIN sys.allocation_units a ON p.partition_id = a.container_id
        JOIN sys.schemas s ON t.schema_id = s.schema_id
      GROUP BY
        s.name, t.name
      ORDER BY
        SUM(a.total_pages) DESC;
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
        c.name AS [name],
        t.name AS [type],
        CASE 
          WHEN t.name IN ('varchar', 'char', 'nvarchar', 'nchar') THEN c.max_length
          WHEN t.name IN ('decimal', 'numeric') THEN c.precision
          ELSE NULL
        END AS [size],
        CASE WHEN ic.index_column_id IS NOT NULL AND ic.is_primary_key = 1 THEN 1 ELSE 0 END AS [isPrimaryKey],
        CASE WHEN ic.index_column_id IS NOT NULL AND ic.is_unique = 1 THEN 1 ELSE 0 END AS [isUniqueKey],
        CASE WHEN ic.index_column_id IS NOT NULL AND ic.is_foreign_key = 1 THEN 1 ELSE 0 END AS [isForeignKey],
        CAST(c.default_value AS NVARCHAR(MAX)) AS [defaultValue],
        c.is_nullable = 0 AS [isNotNull],
        CAST(ep.value AS NVARCHAR(MAX)) AS [comment]
      FROM
        sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        LEFT JOIN sys.extended_properties ep ON c.object_id = ep.major_id AND c.column_id = ep.minor_id AND ep.class = 1
        LEFT JOIN (
          SELECT 
            ic.object_id,
            ic.column_id,
            ic.index_id,
            i.is_primary_key,
            i.is_unique,
            i.is_foreign_key
          FROM 
            sys.index_columns ic
            JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
        ) ic ON c.object_id = ic.object_id AND c.column_id = ic.column_id
      WHERE
        c.object_id = OBJECT_ID('${tbName}')
      ORDER BY
        c.column_id;
      `;

    // 索引信息查询
    const indexSql = `
      SELECT
        i.name AS [indexName],
        c.name AS [columnName],
        i.type_desc AS [indexType],
        i.is_unique AS [isUniqueKey],
        i.is_primary_key AS [isPrimaryKey]
      FROM
        sys.indexes i
        JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
      WHERE
        i.object_id = OBJECT_ID('${tbName}')
      ORDER BY
        i.name, ic.key_ordinal;
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
      SELECT 
        OBJECT_DEFINITION(OBJECT_ID('${tbName}')) AS [ddl]
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
  static async getPageCount(connName: string, tableName: string, pageSize: number, condition: string) {
    const dbResTotal = await invoker.querySql(
      connName,
      `SELECT COUNT(*) AS total FROM [${tableName}] ${condition ? condition : ""};`,
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
    let fields = p.fields.length === 1 && p.fields[0] === "*" ? "*" : `[${p.fields.join("],[")}]`;
    const sql = `SELECT ${fields} FROM [${p.tableName}] ${p.where} ORDER BY (SELECT NULL) OFFSET ${offset} ROWS FETCH NEXT ${p.pageSize} ROWS ONLY;`;
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
    return `EXEC sp_rename '[${oldName}]', '${newName}';`;
  }

  // 生成截断表格的语句
  static genTruncateTableCmd(tbName: string) {
    return `TRUNCATE TABLE [${tbName}];`;
  }

  // 生成删除表格的语句
  static genDeleteTableCmd(tbName: string) {
    return `DROP TABLE [${tbName}];`;
  }

  // 生成重命名字段的语句
  static genRenameFieldCmd(tbName: string, oldName: string, newName: string) {
    return `EXEC sp_rename '[${tbName}].[${oldName}]', '${newName}', 'COLUMN';`;
  }

  // 生成删除字段的语句
  static genDeleteFieldCmd(tbName: string, fieldName: string) {
    return `ALTER TABLE [${tbName}] DROP COLUMN [${fieldName}];`;
  }

  // 生成变更一行的字段
  static genUpdateFieldCmd(tbName: string, uniqueField: FieldWithValue, fieldArr: FieldWithValue[]) {
    const fda = fieldArr.map((item) => `[${item.field}] = ${formatToSqlValueMssql(item.value)}`);

    return `
      UPDATE [${tbName}]
      SET 
          ${fda.join(",\n")}
      WHERE [${uniqueField.field}] = ${uniqueField.value};
    `;
  }

  // 生成删除多行的字段
  static genDeleteRowsCmd(tbName: string, fieldName: string, fieldValues: any[]) {
    const values = fieldValues.map((item) => formatToSqlValueMssql(item)).join(",");
    return `DELETE FROM [${tbName}] WHERE [${fieldName}] IN (${values});`;
  }

  // 生成插入多行数据
  static genInsertRowsCmd(tbName: string, fieldNames: string[], fieldValues: any[][]) {
    const fields = fieldNames.join(`],[`);
    const valArr: any[] = [];
    fieldValues.map((itemRow) => {
      const valRow = itemRow.map((item) => formatToSqlValueMssql(item, true));
      valArr.push(valRow);
    });

    return `INSERT INTO [${tbName}] ([${fields}]) VALUES (${valArr.join("),(")});`;
  }

  // 生成复制表格的语句
  static genCopyTableCmd(tbName: string, tbNameNew: string) {
    return `CREATE TABLE [${tbNameNew}] AS SELECT * FROM [${tbName}];`;
  }
}
