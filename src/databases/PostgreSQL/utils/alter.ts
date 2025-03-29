/**
 * 修改字段的功能
 */
import { STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY } from "@/constants";
import { INDEX_PRIMARY_KEY, INDEX_UNIQUE } from "../../constants";
import { FieldAlterAction, TableAlterAction } from "../../types";
import { formatToSqlValuePg } from "./format";

// 编辑字段
export const genAlterFieldEdit = (ca: FieldAlterAction) => {
  let res: string[] = [`\n-- 将要对字段${ca.fieldName}执行以下语句:\n`];

  // 修改数据类型
  if (ca.fieldType !== "") {
    const size = ca.fieldSize ? `(${ca.fieldSize})` : "";
    res.push(
      `ALTER TABLE "${ca.tableName}" ALTER COLUMN "${ca.fieldNameExt}" TYPE ${ca.fieldType}${size} USING "${ca.fieldNameExt}"::${ca.fieldType}${size};`,
    );
  }

  // 修改主键
  if (ca.fieldIndexType === INDEX_PRIMARY_KEY) {
    // 编辑主键的, 先都删除原先的, 如果有索引名再新建一个
    res.push(`
      DO $$
      DECLARE
          constraint_name text;
      BEGIN
          -- 查找关联到指定字段的主键约束名称
          SELECT pg_constraint.conname INTO constraint_name
          FROM pg_constraint
          JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
          JOIN pg_attribute ON pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = ANY(pg_constraint.conkey)
          JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
          WHERE pg_namespace.nspname = current_schema()
          AND pg_class.relname = '${ca.tableName}'
          AND pg_attribute.attname = '${ca.fieldName}'
          AND pg_constraint.contype = 'p';
          
          -- 如果找到主键约束，则删除它
          IF constraint_name IS NOT NULL THEN
              EXECUTE 'ALTER TABLE "${ca.tableName}" DROP CONSTRAINT "' || constraint_name || '"';
              RAISE NOTICE '主键约束 % 已从表"${ca.tableName}"的字段"${ca.fieldName}"上删除', constraint_name;
          ELSE
              RAISE NOTICE '字段"${ca.fieldName}"不是表"${ca.tableName}"的主键';
          END IF;
      END $$; 
    `);

    if (ca.fieldIndexName) {
      // 处理自增
      if (ca.fieldIndexPkAutoIncrement) {
        res.push(`
          ALTER TABLE "${ca.tableName}" 
            ALTER COLUMN "${ca.fieldName}" ADD GENERATED ALWAYS AS IDENTITY,
            ADD PRIMARY KEY ("${ca.fieldName}");
        `);
      } else {
        res.push(`ALTER TABLE "${ca.tableName}" ADD PRIMARY KEY ("${ca.fieldName}");`);
      }
    }
  }

  // 修改唯一索引
  else if (ca.fieldIndexType === INDEX_UNIQUE) {
    // 编辑唯一索引的, 先都删除原先的, 如果有索引名再新建一个
    res.push(`
      DO $$
      DECLARE
          index_name text;
      BEGIN
          -- 查找关联到指定字段的唯一索引（不包括主键）
          SELECT pgc.relname INTO index_name
          FROM pg_class pgc
          JOIN pg_index pgi ON pgi.indexrelid = pgc.oid
          JOIN pg_class pgct ON pgi.indrelid = pgct.oid
          JOIN pg_attribute pga ON pga.attrelid = pgct.oid AND pga.attnum = ANY(pgi.indkey)
          JOIN pg_namespace pgn ON pgc.relnamespace = pgn.oid
          WHERE pgn.nspname = current_schema()
          AND pgct.relname = '${ca.tableName}'
          AND pga.attname = '${ca.fieldName}'
          AND pgi.indisunique = true
          AND pgi.indisprimary = false;  -- 明确排除主键
          
          -- 如果找到唯一索引，则删除它
          IF index_name IS NOT NULL THEN
              EXECUTE 'DROP INDEX "' || index_name || '"';
              RAISE NOTICE '唯一索引 % 已从表"${ca.tableName}"的字段"${ca.fieldName}"上删除', index_name;
          ELSE
              RAISE NOTICE '字段"${ca.fieldName}"在表"${ca.tableName}"上没有唯一索引（非主键）';
          END IF;
      END $$;
    `);

    if (ca.fieldIndexName) {
      res.push(`CREATE UNIQUE INDEX "${ca.fieldIndexName}" ON "${ca.tableName}" ("${ca.fieldNameExt}");`);
    }
  } else if (ca.fieldIndexType === STR_EMPTY) {
    // 没有设置主键和唯一索引的, 删除这一字段的主键和唯一索引
    res.push(`    
      DO $$
      DECLARE
          constraint_rec record;
      BEGIN
          -- 查找关联到指定字段的唯一约束（包括主键）
          FOR constraint_rec IN 
              SELECT pg_constraint.conname as constraint_name, pg_constraint.contype as constraint_type
              FROM pg_constraint
              JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
              JOIN pg_attribute ON pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = ANY(pg_constraint.conkey)
              JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
              WHERE pg_namespace.nspname = current_schema()
              AND pg_class.relname = '${ca.tableName}'
              AND pg_attribute.attname = '${ca.fieldName}'
              AND pg_constraint.contype IN ('p', 'u')  -- 'p'是主键，'u'是唯一约束
          LOOP
              -- 删除找到的约束
              EXECUTE 'ALTER TABLE "${ca.tableName}" DROP CONSTRAINT "' || constraint_rec.constraint_name || '"';
              
              IF constraint_rec.constraint_type = 'p' THEN
                  RAISE NOTICE '已删除主键约束 % 从表"${ca.tableName}"的字段"${ca.fieldName}"', constraint_rec.constraint_name;
              ELSE
                  RAISE NOTICE '已删除唯一约束 % 从表"${ca.tableName}"的字段"${ca.fieldName}"', constraint_rec.constraint_name;
              END IF;
          END LOOP;
          
          -- 检查是否处理了任何约束
          IF NOT FOUND THEN
              RAISE NOTICE '字段"${ca.fieldName}"在表"${ca.tableName}"上没有唯一索引或主键约束';
          END IF;
      END $$;
    `);
  }

  // 设置字段为 NOT NULL
  if (ca.fieldNotNull) {
    res.push(`ALTER TABLE "${ca.tableName}" ALTER COLUMN "${ca.fieldNameExt}" SET NOT NULL;`);
  } else {
    res.push(`ALTER TABLE "${ca.tableName}" ALTER COLUMN "${ca.fieldNameExt}" DROP NOT NULL;`);
  }

  // 设置字段默认值
  if (ca.fieldDefalut !== null) {
    const fv = formatToSqlValuePg(ca.fieldDefalut, true);
    res.push(`ALTER TABLE "${ca.tableName}" ALTER COLUMN "${ca.fieldNameExt}" SET DEFAULT ${fv};`);
  } else {
    res.push(`ALTER TABLE "${ca.tableName}" ALTER COLUMN "${ca.fieldNameExt}" DROP DEFAULT;`);
  }

  // 修改列备注
  if (ca.fieldComment) {
    const fv = formatToSqlValuePg(ca.fieldComment, true);
    res.push(`COMMENT ON COLUMN "${ca.tableName}"."${ca.fieldNameExt}" IS ${fv};`);
  } else {
    res.push(`COMMENT ON COLUMN "${ca.tableName}"."${ca.fieldNameExt}" IS NULL;`);
  }

  // 修改列名要放在最后处理, 避免其它修改找不到表名
  if (ca.fieldName !== ca.fieldNameExt) {
    res.push(`ALTER TABLE "${ca.tableName}" RENAME COLUMN "${ca.fieldName}" TO "${ca.fieldNameExt}";`);
  }

  return res;
};

// 添加字段
// 为了最终的代码比较美观, 要注意这里的字符串格式.
export const genAlterFieldAdd = (ca: FieldAlterAction) => {
  let res: string[] = [];

  const size = ca.fieldSize ? `(${ca.fieldSize})` : "";
  // TODO: 支持以下类型:
  // bytea: 使用  decode('DEADBEEF', 'hex')
  // 多维数组: 使用 ARRAY[[1,2],[3,4]]
  // 几何类型 / 网络地址类型: 需用类型构造函数
  // 复合类型: 使用 ROW() 构造函数
  const defaultValue = ca.fieldDefalut ? "DEFAULT " + formatToSqlValuePg(ca.fieldDefalut, true) + " " : "";
  const genIndx = () => {
    if (ca.fieldIndexType === INDEX_PRIMARY_KEY) {
      return `,\n  ADD CONSTRAINT "${ca.fieldIndexName}" PRIMARY KEY  ("${ca.fieldName}")`;
    } else if (ca.fieldIndexType === INDEX_UNIQUE) {
      return `,\n  ADD CONSTRAINT "${ca.fieldIndexName}" UNIQUE `;
    } else return "";
  };

  res.push(`BEGIN; 
  ALTER TABLE "${ca.tableName}" ADD COLUMN "${ca.fieldName}" ${ca.fieldType}${size} ${ca.fieldNotNull ? "NOT NULL" : ""} ${defaultValue}${genIndx()};

EXCEPTION WHEN OTHERS THEN
  ROLLBACK;
  RAISE EXCEPTION '修改表结构失败: %', SQLERRM;
COMMIT;`);

  return res;
};

// 删除字段
export const genAlterFieldDel = (ca: FieldAlterAction) => {
  let res: string[] = [];
  res.push(`ALTER TABLE "${ca.tableName}" DROP COLUMN "${ca.fieldName}";`);
  return res;
};

// 编辑表
export const genAlterTableEdit = (ca: TableAlterAction) => {
  let res: string[] = [`\n-- 将要对字段${ca.tableName}执行以下语句:\n`];
  if (ca.comment) {
    res.push(`COMMENT ON TABLE "${ca.tableName}" IS ${ca.comment};`);
  } else {
    res.push(`COMMENT ON TABLE "${ca.tableName}" IS NULL`);
  }

  return res;
};
// 生成修改语句
export const genAlterCmdPg = (val: FieldAlterAction[] | TableAlterAction[]) => {
  let res: string[] = [];

  for (const item of val) {
    if (item.target === "field") {
      // 对列的修改
      const faa = item as FieldAlterAction;
      if (faa.action === STR_EDIT) {
        res = res.concat(genAlterFieldEdit(faa));
      }
      if (faa.action === STR_ADD) {
        res = res.concat(genAlterFieldAdd(faa));
      }
      if (faa.action === STR_DELETE) {
        res = res.concat(genAlterFieldDel(faa));
      }
    } else if (item.target === "table") {
      // 对表格的修改
      const faa = item as TableAlterAction;
      if (faa.action === STR_EDIT) {
        res = res.concat(genAlterTableEdit(faa));
      }
    }
  }

  return res.join("\n");
};
