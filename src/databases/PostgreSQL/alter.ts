/**
 * 修改字段的功能
 */
import { STR_ADD, STR_DELETE, STR_EDIT, STR_EMPTY } from "@/constants";
import {
  FIELD,
  FIELD_COMMENT,
  FIELD_DEFAULT,
  FIELD_INDEX_TYPE,
  FIELD_NAME,
  FIELD_NOT_NULL,
  FIELD_TYPE,
  INDEX_PRIMARY_KEY,
  INDEX_UNIQUE,
  TABLE_COMMENT,
} from "../constants";
import { ColumnAlterAction } from "../types";
import { formatToSqlValuePg } from "./utils";

// 编辑字段
export const genAlterFieldEdit = (ca: ColumnAlterAction) => {
  let res: string[] = [];

  for (const cav of ca.actionValues) {
    // 修改数据类型
    if (cav.target === FIELD_TYPE) {
      const size = cav.fieldSize ? `(${cav.fieldSize})` : "";
      res.push(
        `ALTER TABLE "${ca.tableName}" ALTER COLUMN "${cav.fieldName}" TYPE ${cav.fieldType}${size} USING "${cav.fieldName}"::${cav.fieldType}${size};`,
      );
    }

    if (cav.target === FIELD_INDEX_TYPE) {
      // 修改主键
      if (cav.fieldIndexType === INDEX_PRIMARY_KEY) {
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

        if (cav.fieldIndexName) {
          // 处理自增
          if (cav.fieldIndexPkAutoIncrement) {
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
      else if (cav.fieldIndexType === INDEX_UNIQUE) {
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

        if (cav.fieldIndexName) {
          res.push(`CREATE UNIQUE INDEX "${cav.fieldIndexName}" ON "${ca.tableName}" ("${cav.fieldName}");`);
        }
      } else if (cav.fieldIndexType === STR_EMPTY) {
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
    }

    // 设置字段为 NOT NULL
    if (cav.target === FIELD_NOT_NULL) {
      if (cav.fieldNotNull) {
        res.push(`ALTER TABLE "${ca.tableName}" ALTER COLUMN "${cav.fieldName}" SET NOT NULL;`);
      } else {
        res.push(`ALTER TABLE "${ca.tableName}" ALTER COLUMN "${cav.fieldName}" DROP NOT NULL;`);
      }
    }

    // 设置字段默认值
    if (cav.target === FIELD_DEFAULT) {
      if (cav.fieldDefalut !== null) {
        res.push(`ALTER TABLE "${ca.tableName}" ALTER COLUMN "${cav.fieldName}" SET DEFAULT '${cav.fieldDefalut}';`);
      } else {
        res.push(`ALTER TABLE "${ca.tableName}" ALTER COLUMN "${cav.fieldName}" DROP DEFAULT;`);
      }
    }

    // 修改列备注
    if (cav.target === FIELD_COMMENT) {
      if (cav.fieldDefalut) {
        res.push(`COMMENT ON COLUMN "${ca.tableName}"."${cav.fieldName}" IS '${cav.fieldComment}';`);
      } else {
        res.push(`COMMENT ON COLUMN "${ca.tableName}"."${cav.fieldName}" IS NULL;`);
      }
    }

    // 修改表备注
    if (cav.target === TABLE_COMMENT) {
      if (cav.fieldDefalut) {
        res.push(`COMMENT ON TABLE "${ca.tableName}" IS '${cav.tableComment}';`);
      } else {
        res.push(`COMMENT ON TABLE "${ca.tableName}" IS NULL`);
      }
    }
  }

  // 修改列名要放在最后处理, 避免其它修改找不到表名
  for (const cav of ca.actionValues) {
    if (cav.target === FIELD_NAME) {
      res.push(`ALTER TABLE "${ca.tableName}" RENAME COLUMN "${ca.fieldName}" TO "${cav.fieldName}";`);
    }
  }

  return res;
};

// 添加字段
export const genAlterFieldAdd = (ca: ColumnAlterAction) => {
  let res: string[] = [];

  for (const cav of ca.actionValues) {
    if (cav.target === FIELD) {
      const size = cav.fieldSize ? `(${cav.fieldSize})` : "";
      // TODO: 支持以下类型:
      // bytea: 使用  decode('DEADBEEF', 'hex')
      // 多维数组: 使用 ARRAY[[1,2],[3,4]]
      // 几何类型 / 网络地址类型: 需用类型构造函数
      // 复合类型: 使用 ROW() 构造函数
      const defaultValeu = cav.fieldDefalut ? "DEFAULT " + formatToSqlValuePg(cav.fieldDefalut) + " " : "";
      const genIndx = () => {
        if (cav.fieldIndexType === INDEX_PRIMARY_KEY) {
          return `CONSTRAINT "${ca.fieldName}" PRIMARY KEY  -- 主键（隐含唯一和非空）`;
        } else if (cav.fieldIndexType === INDEX_UNIQUE) {
          return `CONSTRAINT "${cav.fieldIndexName}" UNIQUE `;
        } else return "";
      };

      res.push(`        
        ALTER TABLE "${ca.tableName}" 
        ADD COLUMN "${ca.fieldName}" ${cav.fieldType}${size} ${cav.fieldNotNull ? "NOT NULL" : ""} 
        ${defaultValeu}
        ${genIndx()} 
`);
    }
  }

  return res;
};

// 删除字段
export const genAlterFieldDel = (ca: ColumnAlterAction) => {
  let res: string[] = [];

  for (const cav of ca.actionValues) {
    if (cav.target === FIELD) {
      res.push(`ALTER TABLE "${ca.tableName}" DROP COLUMN "${ca.fieldName}";`);
    }
  }

  return res;
};

// 生成修改语句
export const genAlter = (caa: ColumnAlterAction[]) => {
  let res: string[] = [];

  for (const ca of caa) {
    if (ca.action === STR_EDIT) {
      res.concat(genAlterFieldEdit(ca));
    }
    if (ca.action === STR_ADD) {
      res.concat(genAlterFieldAdd(ca));
    }
    if (ca.action === STR_DELETE) {
      res.concat(genAlterFieldDel(ca));
    }
  }
};
