/**
 * 修改字段的功能
 */
import { STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY, STR_FIELD, STR_TABLE, reNumStr } from "@/constants";
import { INDEX_PRIMARY_KEY, INDEX_UNIQUE } from "../../constants";
import { AllAlterAction, FieldAlterAction, TableAlterAction } from "../../types";
import { formatToSqlValuePg } from "./format";

function genSizeStr(sizeStr: string) {
  if (sizeStr === "") return "";

  if (reNumStr.test(sizeStr)) {
    const size = parseInt(sizeStr) | 0;
    return size && size > 0 ? `(${size})` : "";
  }

  return `(${sizeStr})`;
}

function genFieldDefault(fieldDefalut: string | null) {
  if (fieldDefalut === null) return "";

  // TODO: 支持以下类型:
  // 多维数组: 使用 ARRAY[[1,2],[3,4]]
  let defalutValue = reNumStr.test(fieldDefalut) ? `${fieldDefalut}` : formatToSqlValuePg(fieldDefalut, true);
  return fieldDefalut ? "DEFAULT " + defalutValue : "";
}

function genNotNull(fieldNotNull: boolean) {
  return fieldNotNull ? "NOT NULL" : "";
}

// TODO: 支持符合主键
function genIndxConstraint(faa: FieldAlterAction) {
  if (faa.fieldIndexType === INDEX_PRIMARY_KEY) {
    return `CONSTRAINT "${faa.fieldIndexName}" PRIMARY KEY ("${faa.fieldName}")`;
  } else if (faa.fieldIndexType === INDEX_UNIQUE) {
    return `CONSTRAINT "${faa.fieldIndexName}" UNIQUE ("${faa.fieldName}")`;
  } else return "";
}

// 生成每个字段的sql
// 用于 CREATE TABLE 和ALTER TABLE 语句里每个字段名及其后面的属性
function genFieldSql(faa: FieldAlterAction) {
  const sizeStr = genSizeStr(faa.fieldSize);
  const defaultValue = genFieldDefault(faa.fieldDefalut);
  const notNull = genNotNull(faa.fieldNotNull);

  return `"${faa.fieldName}" ${faa.fieldType}${sizeStr} ${notNull} ${defaultValue}`;
}

// 编辑字段
export const genAlterFieldEdit = (faa: FieldAlterAction) => {
  let res: string[] = [`-- 将要对字段${faa.fieldName}执行以下语句:`];

  // 修改数据类型
  if (faa.fieldType !== "") {
    const sizeStr = genSizeStr(faa.fieldSize);
    res.push(
      `ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.fieldNameExt}" TYPE ${faa.fieldType}${sizeStr} USING "${faa.fieldNameExt}"::${faa.fieldType}${sizeStr};`,
    );
  }

  // 修改主键
  if (faa.fieldIndexType === INDEX_PRIMARY_KEY) {
    // 编辑主键的, 先都删除原先的, 如果有索引名再新建一个
    res.push(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        -- 查找关联到${faa.fieldName}字段的主键约束名称
        SELECT pg_constraint.conname INTO constraint_name
        FROM pg_constraint
        JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
        JOIN pg_attribute ON pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = ANY(pg_constraint.conkey)
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE pg_namespace.nspname = current_schema()
        AND pg_class.relname = '${faa.tableName}'
        AND pg_attribute.attname = '${faa.fieldName}'
        AND pg_constraint.contype = 'p';
        
        -- 如果找到${faa.fieldName}的主键约束，则删除它
        IF constraint_name IS NOT NULL THEN
            EXECUTE 'ALTER TABLE "${faa.tableName}" DROP CONSTRAINT "' || constraint_name || '"';
            RAISE NOTICE '主键约束 % 已从表"${faa.tableName}"的字段"${faa.fieldName}"上删除', constraint_name;
        ELSE
            RAISE NOTICE '字段"${faa.fieldName}"不是表"${faa.tableName}"的主键';
        END IF;
      END $$; 
    `);

    if (faa.fieldIndexName) {
      // 处理自增
      if (faa.fieldIndexPkAutoIncrement) {
        res.push(`
          ALTER TABLE "${faa.tableName}" 
            ALTER COLUMN "${faa.fieldName}" ADD GENERATED ALWAYS AS IDENTITY,
            ADD PRIMARY KEY ("${faa.fieldName}");
        `);
      } else {
        res.push(`ALTER TABLE "${faa.tableName}" ADD PRIMARY KEY ("${faa.fieldName}");`);
      }
    }
  }

  // 修改唯一索引
  else if (faa.fieldIndexType === INDEX_UNIQUE) {
    // 编辑唯一索引的, 先都删除原先的, 如果有索引名再新建一个
    res.push(`
      DO $$
      DECLARE
        index_name text;
      BEGIN
        -- 查找关联到${faa.fieldName}字段的唯一索引（不包括主键）
        SELECT pgc.relname INTO index_name
        FROM pg_class pgc
        JOIN pg_index pgi ON pgi.indexrelid = pgc.oid
        JOIN pg_class pgct ON pgi.indrelid = pgct.oid
        JOIN pg_attribute pga ON pga.attrelid = pgct.oid AND pga.attnum = ANY(pgi.indkey)
        JOIN pg_namespace pgn ON pgc.relnamespace = pgn.oid
        WHERE pgn.nspname = current_schema()
        AND pgct.relname = '${faa.tableName}'
        AND pga.attname = '${faa.fieldName}'
        AND pgi.indisunique = true
        AND pgi.indisprimary = false;  -- 明确排除主键
        
        -- 如果找到唯一索引，则删除它
        IF index_name IS NOT NULL THEN
            EXECUTE 'DROP INDEX "' || index_name || '"';
            RAISE NOTICE '唯一索引 % 已从表"${faa.tableName}"的字段"${faa.fieldName}"上删除', index_name;
        ELSE
            RAISE NOTICE '字段"${faa.fieldName}"在表"${faa.tableName}"上没有唯一索引（非主键）';
        END IF;
      END $$;
    `);

    if (faa.fieldIndexName) {
      res.push(`CREATE UNIQUE INDEX "${faa.fieldIndexName}" ON "${faa.tableName}" ("${faa.fieldNameExt}");`);
    }
  } else if (faa.fieldIndexType === STR_EMPTY) {
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
          AND pg_class.relname = '${faa.tableName}'
          AND pg_attribute.attname = '${faa.fieldName}'
          AND pg_constraint.contype IN ('p', 'u')  -- 'p'是主键，'u'是唯一约束
        LOOP
          -- 删除找到的约束
          EXECUTE 'ALTER TABLE "${faa.tableName}" DROP CONSTRAINT "' || constraint_rec.constraint_name || '"';
          
          IF constraint_rec.constraint_type = 'p' THEN
              RAISE NOTICE '已删除主键约束 % 从表"${faa.tableName}"的字段"${faa.fieldName}"', constraint_rec.constraint_name;
          ELSE
              RAISE NOTICE '已删除唯一约束 % 从表"${faa.tableName}"的字段"${faa.fieldName}"', constraint_rec.constraint_name;
          END IF;
        END LOOP;
        
        -- 检查是否处理了任何约束
        IF NOT FOUND THEN
            RAISE NOTICE '字段"${faa.fieldName}"在表"${faa.tableName}"上没有唯一索引或主键约束';
        END IF;
      END $$;
    `);
  }

  // 设置字段为 NOT NULL
  if (faa.fieldNotNull) {
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.fieldNameExt}" SET NOT NULL;`);
  } else {
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.fieldNameExt}" DROP NOT NULL;`);
  }

  // 设置字段默认值
  if (faa.fieldDefalut !== null) {
    const fv = formatToSqlValuePg(faa.fieldDefalut, true);
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.fieldNameExt}" SET DEFAULT ${fv};`);
  } else {
    res.push(`ALTER TABLE "${faa.tableName}" ALTER COLUMN "${faa.fieldNameExt}" DROP DEFAULT;`);
  }

  // 修改列备注
  if (faa.fieldComment) {
    const fv = formatToSqlValuePg(faa.fieldComment, true);
    res.push(`COMMENT ON COLUMN "${faa.tableName}"."${faa.fieldNameExt}" IS ${fv};`);
  } else {
    res.push(`COMMENT ON COLUMN "${faa.tableName}"."${faa.fieldNameExt}" IS NULL;`);
  }

  // 修改列名要放在最后处理, 避免其它修改找不到表名
  if (faa.fieldName !== faa.fieldNameExt) {
    res.push(`ALTER TABLE "${faa.tableName}" RENAME COLUMN "${faa.fieldName}" TO "${faa.fieldNameExt}";`);
  }

  return res;
};

// 添加字段
// 为了最终的代码比较美观, 要注意这里的字符串格式.
export const genAlterFieldAdd = (faa: FieldAlterAction) => {
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
};

// 删除字段
export const genAlterFieldDel = (faa: FieldAlterAction) => {
  let res: string[] = [];
  res.push(`ALTER TABLE "${faa.tableName}" DROP COLUMN "${faa.fieldName}";`);
  return res;
};

// 编辑表
export const genAlterTableEdit = (taa: TableAlterAction) => {
  let res: string[] = [`-- 将要对表格${taa.tableName}执行以下语句:`];
  if (taa.comment) {
    res.push(`COMMENT ON TABLE "${taa.tableName}" IS '${taa.comment}';`);
  } else {
    res.push(`COMMENT ON TABLE "${taa.tableName}" IS NULL`);
  }

  if (taa.tableName !== taa.tableNameOld) {
    res.push(`ALTER TABLE "${taa.tableNameOld}" RENAME TO "${taa.tableName}";`);
  }

  return res;
};

// 创建表
export const genAlterTableAdd = (taa: TableAlterAction, faas: FieldAlterAction[]) => {
  let res: string[] = [`-- 将要对表格${taa.tableName}执行以下语句:`];

  const fields: string[] = [];
  const indxConstraints: string[] = [];
  for (const faa of faas) {
    fields.push(genFieldSql(faa));
    const sss = genIndxConstraint(faa);
    if (sss.length > 0) indxConstraints.push(sss);
  }

  res.push(`
    CREATE TABLE "${taa.tableName}" (
      ${fields.length > 0 ? fields.join(",\n") : ""}
      ${indxConstraints.length > 0 ? "," + indxConstraints.join(",\n") : ""}      
    );
  `);

  return res;
};

// 生成修改语句
export const genAlterCmdPg = (val: AllAlterAction[]) => {
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
        return res.join("\n");
      }
    }
  }

  // 非建表的
  for (const item of val) {
    if (item.target === STR_TABLE) {
      const taa = item as TableAlterAction;
      // 修改表
      if (taa.action === STR_EDIT) {
        res = res.concat(genAlterTableEdit(taa));
      }
    }

    if (item.target === STR_FIELD) {
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
    }
  }

  return res.join("\n");
};
