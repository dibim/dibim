// 基础列信息
export type TableStructureCol = {
  character_maximum_length: number | null; // 字符类型最大长度
  character_octet_length: number | null; // 字符类型的字节长度
  character_set_catalog: string | null; // 字符集所属数据库
  character_set_name: string | null; // 字符集名称
  character_set_schema: string | null; // 字符集所属模式
  collation_catalog: string | null; // 排序规则所属数据库
  collation_name: string | null; // 排序规则名称
  collation_schema: string | null; // 排序规则所属模式
  column_default: string | null; // 默认值（如 "nextval(...)"）
  column_name: string; // 列名（如 "id"）
  data_type: string; // 数据类型（如 "bigint"）
  datetime_precision: number | null; // 时间类型的精度
  domain_catalog: string | null; // 域所属数据库
  domain_name: string | null; // 域名
  domain_schema: string | null; // 域所属模式
  dtd_identifier: string; // 数据类型的唯一标识符（如 "1"）
  generation_expression: string | null; // 生成表达式
  identity_cycle: "YES" | "NO"; // 标识列是否循环
  identity_generation: "ALWAYS" | "BY DEFAULT" | null; // 标识列生成方式
  identity_increment: string | null; // 标识列增量
  identity_maximum: string | null; // 标识列最大值
  identity_minimum: string | null; // 标识列最小值
  identity_start: string | null; // 标识列起始值
  interval_precision: number | null; // 间隔类型的精度
  interval_type: string | null; // 间隔类型（如年月日）
  is_generated: "NEVER" | "ALWAYS" | "BY DEFAULT"; // 列值是否生成
  is_identity: "YES" | "NO"; // 是否是标识列
  is_nullable: "YES" | "NO"; // 是否允许 NULL
  is_self_referencing: "YES" | "NO"; // 是否自引用
  is_updatable: "YES" | "NO"; // 列是否可更新
  maximum_cardinality: number | null; // 数组类型的最大基数
  numeric_precision: number | null; // 数值类型的精度
  numeric_precision_radix: number | null; // 数值类型的基数（通常是 2 或 10）
  numeric_scale: number | null; // 数值类型的小数位数
  ordinal_position: number; // 列的位置（从 1 开始）
  scope_catalog: string | null; // 范围所属数据库
  scope_name: string | null; // 范围名称
  scope_schema: string | null; // 范围所属模式
  table_catalog: string; // 数据库名（如 "given_0315"）
  table_name: string; // 表名（如 "x_word_en_basic"）
  table_schema: string; // 模式名（如 "public"）
  udt_catalog: string; // 用户定义类型所属数据库（如 "given_0315"）
  udt_name: string; // 用户定义类型名（如 "int8"）
  udt_schema: string; // 用户定义类型所属模式（如 "pg_catalog"）
};

export type PrimaryKeysRes = {
  column_name: string;
};

export type ForeignKeysRes = {
  constraint_name: string;
  referenced_table: string;
  referencing_column: string;
  referenced_column: string;
};

export type UniqueKeysResRes = {
  column_name: string;
  constraint_name: string;
};

export type NotNullRes = {
  column_name: string;
  is_nullable: boolean;
};

export type CheckConstraintsRes = {
  constraint_name: string;
  check_condition: boolean;
};

export type CommentRes = {
  column_name: string;
  comment: string;
};

export type TableStructurePostgresql = TableStructureCol & {
  is_primary_key: boolean; // 是否主键
  is_unique: boolean; // 是否唯一约束
  has_foreign_key: boolean; // 戳否有外键
  has_check_conditions: boolean; // 是否有检查约束条件
  comment: string; // 列备注
};
