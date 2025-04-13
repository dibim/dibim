/**
 * 修改字段的功能
 */
import { RE_NUM_STR, STR_ADD, STR_DELETE, STR_EDIT, STR_FIELD, STR_TABLE } from "@/constants";
import { AllAlterAction, FieldAlterAction, TableAlterAction } from "../types";
import { formatToSqlValuePg } from "./format";

function genSizeStr(faa: FieldAlterAction) {
  if (faa.size === "") return "";

  if (RE_NUM_STR.test(faa.size)) {
    const size = parseInt(faa.size) | 0;
    return size && size > 0 ? `(${size})` : "";
  }

  return `(${faa.size})`;
}

function genFieldDefault(faa: FieldAlterAction) {
  if (faa.defaultValue === null) return "";
  if (faa.isPrimaryKey) return "";

  if (faa.defaultValue === `''` || faa.defaultValue === `""`) return `DEFAULT ''`;

  // TODO: 支持以下类型:
  // 多维数组: 使用 ARRAY[[1,2],[3,4]]
  let defalutValue = RE_NUM_STR.test(faa.defaultValue)
    ? `${faa.defaultValue}`
    : formatToSqlValuePg(faa.defaultValue, true);
  return faa.defaultValue ? `DEFAULT ${defalutValue}` : "";
}

function genNotNull(faa: FieldAlterAction) {
  return faa.isNullable ? "NOT NULL" : "";
}

// TODO: 支持符合主键
function genIndxConstraint(faa: FieldAlterAction) {
  if (faa.isPrimaryKey) {
    return `CONSTRAINT "${faa.indexName}" PRIMARY KEY ("${faa.name}")`;
  } else if (faa.isUniqueKey) {
    return `CONSTRAINT "${faa.indexName}" UNIQUE ("${faa.name}")`;
  } else return "";
}

// 生成每个字段的sql
// 用于 CREATE TABLE 和ALTER TABLE 语句里每个字段名及其后面的属性
function genFieldSql(faa: FieldAlterAction) {
  return `"${faa.name}" ${faa.type}${genSizeStr(faa)} ${genNotNull(faa)} ${genFieldDefault(faa)}`;
}

// 编辑字段
export function genAlterFieldEdit(faa: FieldAlterAction) {
  let res: string[] = [`-- 将要对字段${faa.name}执行以下语句:`];

  // 修改数据类型
  if (faa.type !== faa.typeOld) {
    const sizeStr = genSizeStr(faa);
    res.push(
      `ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.name}" TYPE ${faa.type}${sizeStr} USING "${faa.name}"::${faa.type}${sizeStr};`,
    );
  }

  // 修改主键
  if (faa.isPrimaryKey) {
    /*
    FIXME: There may be an error here
    // 编辑主键的, 先都删除原先的, 如果有索引名再新建一个
    res.push(`
      -- 删除关联到${faa.name}字段的主键约束名称
      DO $$
      DECLARE
        constraint_name text;
      BEGIN        
        SELECT pg_constraint.conname INTO constraint_name
        FROM pg_constraint
        JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
        JOIN pg_attribute ON pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = ANY(pg_constraint.conkey)
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE pg_namespace.nspname = current_schema()
        AND pg_class.relname = '${faa.tableName}'
        AND pg_attribute.attname = '${faa.name}'
        AND pg_constraint.contype = 'p';
        
        -- 如果找到${faa.name}的主键约束，则删除它
        IF constraint_name IS NOT NULL THEN
            EXECUTE 'ALTER TABLE "${faa.tableName}" DROP CONSTRAINT "' || constraint_name || '"';
            RAISE NOTICE '主键约束 % 已从表"${faa.tableName}"的字段"${faa.name}"上删除', constraint_name;
        ELSE
            RAISE NOTICE '字段"${faa.name}"不是表"${faa.tableName}"的主键';
        END IF;
      END $$; 
    `);
    */

    if (faa.indexName) {
      // 处理自增
      if (faa.autoIncrement) {
        res.push(`
          ALTER TABLE "${faa.tableName}" 
            ALTER COLUMN "${faa.name}" ADD GENERATED ALWAYS AS IDENTITY,
            ADD PRIMARY KEY ("${faa.name}");
        `);
      } else {
        res.push(`ALTER TABLE "${faa.tableName}" ADD PRIMARY KEY ("${faa.name}");`);
      }
    }
  }

  // 修改唯一索引
  if (faa.isUniqueKey) {
    /*
    FIXME: There may be an error here
    // 编辑唯一索引的, 先都删除原先的, 如果有索引名再新建一个
    res.push(`
      -- 删除关联到${faa.name}字段的唯一索引（不包括主键）
      DO $$
      DECLARE
        index_name text;
      BEGIN
        SELECT pgc.relname INTO index_name
        FROM pg_class pgc
        JOIN pg_index pgi ON pgi.indexrelid = pgc.oid
        JOIN pg_class pgct ON pgi.indrelid = pgct.oid
        JOIN pg_attribute pga ON pga.attrelid = pgct.oid AND pga.attnum = ANY(pgi.indkey)
        JOIN pg_namespace pgn ON pgc.relnamespace = pgn.oid
        WHERE pgn.nspname = current_schema()
        AND pgct.relname = '${faa.tableName}'
        AND pga.attname = '${faa.name}'
        AND pgi.indisunique = true
        AND pgi.indisprimary = false;  -- 明确排除主键
        
        -- 如果找到${faa.name}的唯一索引，则删除它
        IF index_name IS NOT NULL THEN
            EXECUTE 'DROP INDEX "' || index_name || '"';
            RAISE NOTICE '唯一索引 % 已从表"${faa.tableName}"的字段"${faa.name}"上删除', index_name;
        ELSE
            RAISE NOTICE '字段"${faa.name}"在表"${faa.tableName}"上没有唯一索引（非主键）';
        END IF;
      END $$;
    `);
    */

    if (faa.indexName) {
      res.push(`CREATE UNIQUE INDEX "${faa.indexName}" ON "${faa.tableName}" ("${faa.name}");`);
    }
  }
  if (!faa.isPrimaryKey && !faa.isUniqueKey) {
    /*
    FIXME: There may be an error here
    // 没有设置主键和唯一索引的, 删除这一字段的主键和唯一索引
    res.push(`    
      -- 删除关联到${faa.name}字段的唯一约束（包括主键）
      DO $$
      DECLARE
          constraint_rec record;
      BEGIN
        FOR constraint_rec IN 
          SELECT pg_constraint.conname as constraint_name, pg_constraint.contype as constraint_type
          FROM pg_constraint
          JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
          JOIN pg_attribute ON pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = ANY(pg_constraint.conkey)
          JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
          WHERE pg_namespace.nspname = current_schema()
          AND pg_class.relname = '${faa.tableName}'
          AND pg_attribute.attname = '${faa.name}'
          AND pg_constraint.contype IN ('p', 'u')  -- 'p'是主键，'u'是唯一约束
        LOOP
          -- 删除找到的约束
          EXECUTE 'ALTER TABLE "${faa.tableName}" DROP CONSTRAINT "' || constraint_rec.constraint_name || '"';
          
          IF constraint_rec.constraint_type = 'p' THEN
              RAISE NOTICE '已删除主键约束 % 从表"${faa.tableName}"的字段"${faa.name}"', constraint_rec.constraint_name;
          ELSE
              RAISE NOTICE '已删除唯一约束 % 从表"${faa.tableName}"的字段"${faa.name}"', constraint_rec.constraint_name;
          END IF;
        END LOOP;
        
        -- 检查是否处理了任何约束
        IF NOT FOUND THEN
            RAISE NOTICE '字段"${faa.name}"在表"${faa.tableName}"上没有唯一索引或主键约束';
        END IF;
      END $$;
    `);
    */
  }

  // 设置字段为 NOT NULL
  if (faa.isNullable) {
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.name}" DROP NOT NULL;`);
  } else {
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.name}" SET NOT NULL;`);
  }

  // 设置字段默认值
  if (faa.defaultValue !== null) {
    const fv = formatToSqlValuePg(faa.defaultValue, true);
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.name}" SET DEFAULT ${fv};`);
  } else {
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.name}" DROP DEFAULT;`);
  }

  // 修改字段备注
  if (faa.comment) {
    const fv = formatToSqlValuePg(faa.comment, true);
    res.push(`COMMENT ON COLUMN "${faa.tableName}"."${faa.name}" IS ${fv};`);
  } else {
    res.push(`COMMENT ON COLUMN "${faa.tableName}"."${faa.name}" IS NULL;`);
  }

  // 修改字段名要放在最后处理, 避免其它修改找不到表名
  if (faa.name !== faa.nameNew) {
    res.push(`ALTER TABLE "${faa.tableName}" RENAME COLUMN "${faa.name}" TO "${faa.nameNew}";`);
  }

  return res;
}

// 添加字段
export function genAlterFieldAdd(faa: FieldAlterAction) {
  let res: string[] = [];
  const indxConstraint = genIndxConstraint(faa);

  res.push(`
    BEGIN; 
      ALTER TABLE "${faa.tableName}" ADD COLUMN ${genFieldSql(faa)}
      ${indxConstraint ? ",\n ADD " + indxConstraint : ""}
      ;

      EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE EXCEPTION '修改表结构失败: %', SQLERRM;
    COMMIT;
  `);

  return res;
}

// 删除字段
export function genAlterFieldDel(faa: FieldAlterAction) {
  let res: string[] = [];
  res.push(`ALTER TABLE "${faa.tableName}" DROP COLUMN "${faa.name}";`);
  return res;
}

// 编辑表
export function genAlterTableEdit(taa: TableAlterAction) {
  let res: string[] = [`-- 将要对表格${taa.tableName}执行以下语句:`];
  if (taa.comment) {
    res.push(`COMMENT ON TABLE "${taa.tableName}" IS '${taa.comment}';`);
  } else {
    res.push(`COMMENT ON TABLE "${taa.tableName}" IS NULL;`);
  }

  if (taa.tableName !== taa.tableNameOld) {
    res.push(`ALTER TABLE "${taa.tableNameOld}" RENAME TO "${taa.tableName}";`);
  }

  return res;
}

// 创建表
export function genAlterTableAdd(taa: TableAlterAction, faas: FieldAlterAction[]) {
  let res: string[] = [];

  const fields: string[] = [];
  const indxConstraints: string[] = [];
  for (const faa of faas) {
    fields.push(genFieldSql(faa));
    const constraint = genIndxConstraint(faa);
    if (constraint.length > 0) indxConstraints.push(constraint);
  }

  res.push(`
    CREATE TABLE "${taa.tableName}" (
      ${fields.length > 0 ? fields.join(",\n") : ""}
      ${indxConstraints.length > 0 ? "," + indxConstraints.join(",\n") : ""}      
    );
  `);

  // 添加字段注释
  for (const faa of faas) {
    if (faa.comment) {
      const fv = formatToSqlValuePg(faa.comment, true);
      res.push(`COMMENT ON COLUMN "${taa.tableName}"."${faa.name}" IS ${fv};`);
    } else {
      res.push(`COMMENT ON COLUMN "${taa.tableName}"."${faa.name}" IS NULL;`);
    }
  }

  return res;
}

// 生成修改语句
export function genAlterCmdPg(val: AllAlterAction[]) {
  let res: string[] = [];

  // 注意: 如果是建表, 需要把字段的数据全部传过去, 并直接返回
  for (const item of val) {
    if (item.target === STR_TABLE) {
      const taa = item as TableAlterAction;

      if (taa.action === STR_ADD) {
        const faas: FieldAlterAction[] = [];
        val.map((item) => {
          if (item.target === STR_FIELD) {
            faas.push(item as FieldAlterAction);
          }
        });

        res = res.concat(genAlterTableAdd(taa, faas));
        return res.join("");
      }
    }
  }

  // 非建表的
  for (const item of val) {
    if (item.target === STR_TABLE) {
      const taa = item as TableAlterAction;
      // 对表的修改
      if (taa.action === STR_EDIT) {
        res = res.concat(genAlterTableEdit(taa));
      }
    }

    if (item.target === STR_FIELD) {
      // 对字段的修改
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
    }
  }

  return res.join("\n");
}
