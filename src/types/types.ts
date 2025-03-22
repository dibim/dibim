export type DbResult = {
  columnName: string; // 列表数组 json, 仅查询的时候有数据
  data: string; // 查询结果, 实际是 json 字符串
  errorMessage: string; // 错误消息
};

export type QueryResult = {
  columnName: string; // 列表数组 json
  data: string; // 查询结果, 实际是 json 字符串
};

export type ExecResult = {
  affectedRows: number;
  lastInsertId: number;
};

// 表格列表
export type TableListData = {
  tableNameArray: string[];
};

// 主要区域
export type MainContentData = {
  //
};
