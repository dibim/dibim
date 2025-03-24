export type TableStructureSqlite = {
  cid: number; // 列 ID（从 0 开始）
  name: string; // 列名
  type: string | null; // 数据类型（如 "INTEGER", "TEXT"）
  notnull: 0 | 1; // 是否允许 NULL（0=允许，1=不允许）
  dflt_value: string | null; // 默认值
  pk: 0 | 1; // 是否为主键（0=否，1=是）
};
