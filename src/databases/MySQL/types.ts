export type TableStructureMysql = {
  table_catalog: string; // 数据库名（如 "your_db"）
  table_schema: string; // 模式名（通常是数据库名）
  table_name: string; // 表名
  column_name: string; // 字段名
  ordinal_position: number; // 字段的顺序位置
  column_default: string | null; // 默认值
  is_nullable: "YES" | "NO"; // 是否允许 NULL
  data_type: string; // 数据类型（如 "int", "varchar"）
  character_maximum_length: number | null; // 字符最大长度
  character_octet_length: number | null; // 字符字节长度
  numeric_precision: number | null; // 数值精度
  numeric_scale: number | null; // 数值小数位数
  datetime_precision: number | null; // 时间精度
  character_set_name: string | null; // 字符集名称
  collation_name: string | null; // 排序规则名称
  column_type: string; // 完整字段类型（如 "int(11)"）
  column_key: "PRI" | "UNI" | "MUL" | ""; // 键类型（主键、唯一键等）
  extra: string | null; // 额外信息（如 "auto_increment"）
  privileges: string; // 字段权限
  generation_expression: string | null; // 生成字段表达式
  srs_id: number | null; // 空间参考系统 ID（地理数据类型）
};
