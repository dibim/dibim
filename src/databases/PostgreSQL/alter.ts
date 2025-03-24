/**
 * 修改变革的功能
 */

// TODO: 实现表结构的编辑, 逻辑很复杂
export const ACTION_C_COLNAME = "cColName"; // 修改列名
export const ACTION_C_DATATYPE = "cDataType"; // 修改数据类型
export const ACTION_C_IS_PRIMARY_KEY = "cIsPrimaryKey"; // 修改是主键
export const ACTION_C_IS_UNIQUE = "cIsUnique"; // 修改是唯一索引
export const ACTION_C_NULLABLE = "cNullable"; // 修改非空
export const ACTION_C_DEFAULT = "cDefault"; // 修改默认值
export const ACTION_C_COL_COMMENT = "cColComment"; // 修改列备注
export const ACTION_C_TBL_COMMENT = "cTblComment"; // 修改表备注
export const ACTION_D_COL = "dCol"; // 删除列
export type AlterAction =
  | typeof ACTION_C_COLNAME
  | typeof ACTION_C_DATATYPE
  | typeof ACTION_C_IS_PRIMARY_KEY
  | typeof ACTION_C_IS_UNIQUE
  | typeof ACTION_C_NULLABLE
  | typeof ACTION_C_DEFAULT
  | typeof ACTION_C_COL_COMMENT
  | typeof ACTION_C_TBL_COMMENT
  | typeof ACTION_D_COL;

export type AlterActionData = {
  column_name: string;
  action: AlterAction;
  actionValue: any; // 类型根据 action 变化
};

// TODO: 生成修改语句, 逻辑很复杂
export const genAlterSql = (pa: AlterActionData[]) => {
  let res: string[] = [];

  for (const p of pa) {
    // 修改列名
    if (p.action === ACTION_C_COLNAME) {
      // TODO: 重命名字段的可能导致别的修改还在操作原先的字段名, 要处理
      res.push(`
        ALTER TABLE table_name RENAME COLUMN old_column_name TO new_column_name;
      `);
    }

    // 修改数据类型
    if (p.action === ACTION_C_DATATYPE) {
      res.push(`
        ALTER TABLE table_name ALTER COLUMN column_name TYPE new_data_type;
      `);
    }

    // 修改主键
    if (p.action === ACTION_C_IS_PRIMARY_KEY) {
      res.push(`
        ALTER TABLE employees
            DROP CONSTRAINT employees_pkey;

        ALTER TABLE employees
            ADD PRIMARY KEY (employee_id);
      `);
    }

    // 修改唯一索引
    if (p.action === ACTION_C_IS_UNIQUE) {
      res.push(`
        DROP INDEX IF EXISTS employees_email_idx;

        CREATE UNIQUE INDEX employees_work_email_idx ON employees (work_email);
      `);
    }

    // 设置字段为 NOT NULL
    if (p.action === ACTION_C_NULLABLE) {
      res.push(`
        ALTER TABLE table_name ALTER COLUMN column_name SET NOT NULL;
      `);
      // 移除字段的 NOT NULL 约束: ALTER TABLE table_name ALTER COLUMN column_name DROP NOT NULL;
    }

    // 设置字段默认值
    if (p.action === ACTION_C_DEFAULT) {
      res.push(`
        ALTER TABLE table_name ALTER COLUMN column_name SET DEFAULT default_value;
      `);
      // 删除默认值: ALTER TABLE table_name ALTER COLUMN column_name DROP DEFAULT;
    }

    // 修改列备注
    if (p.action === ACTION_C_COL_COMMENT) {
      res.push(`
        COMMENT ON COLUMN employees.emp_name IS '员工的全名';
      `);
    }

    // 修改表备注
    if (p.action === ACTION_C_TBL_COMMENT) {
      res.push(`
        COMMENT ON TABLE employees IS '员工信息表';
      `);
    }

    // 删除列
    if (p.action === ACTION_D_COL) {
      res.push(`
        ALTER TABLE employees DROP COLUMN age;
      `);
    }

    /**
    添加 CHECK 约束:  ALTER TABLE table_name ADD CONSTRAINT constraint_name CHECK (condition);
    删除 CHECK 约束:   ALTER TABLE table_name DROP CONSTRAINT constraint_name;

    对一个表格进行多个修改的 :
    ALTER TABLE employees
      ALTER COLUMN salary TYPE numeric(10, 2),
      ALTER COLUMN salary SET DEFAULT 0;

    
    如果字段中已有数据，修改字段类型时可能会失败（例如将 text 改为 integer）。
    可以使用 USING 子句指定类型转换规则。例如：   
    ALTER TABLE employees ALTER COLUMN salary TYPE numeric(10, 2) USING salary::numeric(10, 2);

    ALTER TABLE 是 DDL 语句，默认情况下 PostgreSQL 中的 DDL 语句是自动提交的。如果需要回滚，可以将 ALTER TABLE 放在事务块中：
    BEGIN;  修改语句; COMMIT;
     */
  }
};
