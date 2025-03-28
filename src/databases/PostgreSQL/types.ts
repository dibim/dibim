// 成员的属性名为字段名
export type PrimaryKeysRes = {
  column_name: string;
};

// 成员的属性名为字段名
export type ForeignKeysRes = {
  constraint_name: string;
  referenced_table: string;
  referencing_column: string;
  referenced_column: string;
};

// 成员的属性名为字段名
export type UniqueKeysResRes = {
  column_name: string;
  constraint_name: string;
};

// 成员的属性名为字段名
export type NotNullRes = {
  column_name: string;
  is_nullable: boolean;
};

// 成员的属性名为字段名
export type CheckConstraintsRes = {
  constraint_name: string;
  check_condition: boolean;
};

// 成员的属性名为字段名
export type CommentRes = {
  column_name: string;
  comment: string;
};
