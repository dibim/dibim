export type GetTableDataParam = {
  tableName: string;
  orderBy: string;
  currentPage: number; // 当前页码
  pageSize: number; // 每页的数据条数
};

export type GetTableDataRes = {
  total: number; // 数据总条数
  currentPage: number; // 当前页码
  pageSize: number; // 每页的数据条数
  data: string; // 当前页的数据, json 字符串
};
