import { DB_TYPE_MYSQL, DB_TYPE_POSTGRESQL, DB_TYPE_SQLITE } from "@/constants";
import {
  deleteTablePg,
  getAllTableNamePg,
  getAllTableSizePg,
  getTableDataPg,
  getTableDdlPg,
  getTableStructurePg,
  renameTablePg,
  truncateTablePg,
} from "@/databases/PostgreSQL/utils";
import { DbType } from "@/types/types";
import { GetTableDataParam } from "./types";

// 连接数据库的参数不同, 直接调用各自目录里的

/**
 * postgres://user:pass@host:port/db  # PostgreSQL
 * mysql://user:pass@host:port/db     # MySQL
 * sqlite:///path/to/database.db      # SQLite
 */

/**
 *
 * @param dbType
 * @returns
 */

// 获取所有表名
export async function getAllTableName(dbType: DbType) {
  if (dbType === DB_TYPE_MYSQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRESQL) {
    return getAllTableNamePg();
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}

// 获取所有表格的大小
export async function getAllTableSize(dbType: DbType) {
  if (dbType === DB_TYPE_MYSQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRESQL) {
    return getAllTableSizePg();
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}

// 重命名表格
export async function renameTable(dbType: DbType, oldName: string, newName: string) {
  if (dbType === DB_TYPE_MYSQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRESQL) {
    return renameTablePg(oldName, newName);
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}

// 截断表格
export async function truncateTable(dbType: DbType, tbName: string) {
  if (dbType === DB_TYPE_MYSQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRESQL) {
    return truncateTablePg(tbName);
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}

// 删除表格
export async function deleteTable(dbType: DbType, tbName: string) {
  if (dbType === DB_TYPE_MYSQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRESQL) {
    return deleteTablePg(tbName);
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}

// 获取表格数据
export async function getTableStructure(dbType: DbType, tbName: string) {
  if (dbType === DB_TYPE_MYSQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRESQL) {
    return getTableStructurePg(tbName);
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}

// 获取表格的 DDL
export async function getTableDdl(dbType: DbType, tbName: string) {
  if (dbType === DB_TYPE_MYSQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRESQL) {
    return getTableDdlPg(tbName);
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}

// 获取表格数据
export async function getTableData(dbType: DbType, params: GetTableDataParam) {
  if (dbType === DB_TYPE_MYSQL) {
    // TODO:
  }
  if (dbType === DB_TYPE_POSTGRESQL) {
    return getTableDataPg(params);
  }
  if (dbType === DB_TYPE_SQLITE) {
    // TODO:
  }
}
