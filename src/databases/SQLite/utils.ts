import { reOneWord, reTwoWords } from "@/constants";
import { formatToSqlValueSqlite } from "./format";
import { FieldDefinitionSqlite, SqlTableConstraintCommonSqlite } from "./types";

type ColumnDefinition = FieldDefinitionSqlite;

export interface TableStructure {
  tableName: string;
  columns: ColumnDefinition[];
  constraints: SqlTableConstraintCommonSqlite[];
  options: {
    withoutRowId: boolean;
    strict: boolean;
  };
}

function createDefaultColumn(): ColumnDefinition {
  return {
    autoIncrement: false,
    checkConstraint: null,
    collation: null,
    comment: "",
    defaultValue: null,
    generated: null,
    isNullable: false,
    isPrimaryKey: false,
    isUniqueKey: false,
    name: "",
    size: null,
    type: "TEXT",
  };
}

function createDefaultConstraint(): SqlTableConstraintCommonSqlite {
  return {
    type: "CHECK",
    name: null,
    columns: null,
    condition: null,
    referenceTable: null,
    referenceColumns: null,
    onDelete: null,
    onUpdate: null,
  };
}

/**
 * 解析建表语句为结构化数据
 * @param sql 建表语句
 * @returns
 */
export function parseCreateTableDdl(sql: string): TableStructure {
  // 标准化SQL输入
  const normalizedSql = sql
    .replace(/--[^\n]*\n/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();

  // 提取表名
  const tableNameMatch = normalizedSql.match(/CREATE TABLE (?:IF NOT EXISTS )?["']?([^"'\s(]+)["']?/i);
  if (!tableNameMatch) {
    throw new Error("Invalid CREATE TABLE statement");
  }

  const result: TableStructure = {
    tableName: tableNameMatch[1],
    columns: [],
    constraints: [],
    options: {
      withoutRowId: normalizedSql.toUpperCase().includes("WITHOUT ROWID"),
      strict: normalizedSql.toUpperCase().includes("STRICT"),
    },
  };

  // 提取列定义部分
  const columnSectionMatch = normalizedSql.match(/\(([\s\S]+?)\)(?:\s*WITHOUT ROWID)?(?:\s*STRICT)?$/i);
  if (!columnSectionMatch) {
    throw new Error("No column definitions found");
  }

  const columnDefinitions = splitSqlTokens(columnSectionMatch[1]);

  for (const colDef of columnDefinitions) {
    const trimmed = colDef.trim();
    if (!trimmed) continue;

    if (isTableConstraint(trimmed)) {
      const constraint = parseTableConstraint(trimmed);
      result.constraints.push(constraint);
    } else {
      const column = parseColumnDefinition(trimmed);
      result.columns.push(column);
    }
  }

  // 根据约束补充字段数据
  for (const item of result.constraints) {
    // 对于约束里的单字段主键, 记录到字段本身
    if (item.type === "PRIMARY_KEY") {
      if (item.columns === null) continue;

      for (const c of item.columns) {
        let firstWord = "";
        let secondWord = "";

        if (reOneWord.test(c)) {
          firstWord = c.trim();
        }

        const match = c.match(reTwoWords);
        if (match) {
          firstWord = match[1];
          if (match[2]) secondWord = match[2];
        }

        if (firstWord !== "") {
          for (let index = 0; index < result.columns.length; index++) {
            const col = result.columns[index];

            if (col.name === firstWord) {
              result.columns[index].isPrimaryKey = true;
              result.columns[index].autoIncrement = secondWord.toLowerCase() === "autoincrement";
            }
          }
        }
      }
    }
  }

  return result;
}

function isTableConstraint(definition: string): boolean {
  return /^(CONSTRAINT\s+[^\s]+\s+)?(PRIMARY KEY|UNIQUE|CHECK|FOREIGN KEY)/i.test(definition);
}

function parseColumnDefinition(colDef: string): ColumnDefinition {
  const column = createDefaultColumn();

  // 容错解析列名和类型部分（带括号参数）
  // const sanitizedDef = colDef.trim().replace(/["']/g, ""); // 去除所有引号简化处理
  const sanitizedDef = colDef.trim();
  const typeParts = sanitizedDef.split(/\s+/);
  let cursor = 0;

  // 提取列名（第一个有效token）
  if (typeParts.length > 0) {
    column.name = typeParts[cursor++];
  } else {
    console.warn(`无法解析列定义: ${colDef}`);
    return column; // 返回默认空列
  }

  // 解析类型和参数（处理类似 VARCHAR(255) 或 DECIMAL(10,2)）
  if (typeParts.length > cursor) {
    const typeWithParams = typeParts[cursor++];
    const paramMatch = typeWithParams.match(/(\w+)(?:\(([^)]*)\))?/);

    if (paramMatch) {
      column.type = paramMatch[1].toUpperCase();
      column.size = paramMatch[2] || null; // 保留原始参数
    } else {
      column.type = typeWithParams.toUpperCase(); // 无参数的类型
    }
  }

  // 解析其他约束（PRIMARY KEY, NOT NULL 等）
  const tokens = typeParts.slice(cursor);
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i].toUpperCase();

    if (token === "PRIMARY") {
      if (tokens[i + 1]?.toUpperCase() === "KEY") {
        column.isPrimaryKey = true;
        i++;
      }
    }

    if (token === "AUTOINCREMENT") {
      column.autoIncrement = true;
    }

    if (token === "NOT") {
      if (tokens[i + 1]?.toUpperCase() === "NULL") {
        column.isNullable = false;
        i++;
      }
    }

    if (token === "UNIQUE") {
      column.isUniqueKey = true;
    }

    if (token === "DEFAULT") {
      column.defaultValue = tokens[i + 1].replace("(", "").replace(")", "");
      i++;
    }

    if (token === "COLLATE") {
      column.collation = tokens[i + 1] as "BINARY" | "NOCASE" | "RTRIM" | null;
      i++;
    }

    // CHECK 和 GENERATED 在字段定义的末尾
    if (token === "CHECK") {
      const checkStart = colDef.indexOf("(", i);
      const checkEnd = colDef.lastIndexOf(")");
      if (checkStart !== -1 && checkEnd !== -1) {
        column.checkConstraint = colDef.slice(checkStart + 1, checkEnd);
        i = tokens.length;
      }
    }

    if (token === "GENERATED") {
      if (tokens[i + 1]?.toUpperCase() === "ALWAYS" && tokens[i + 2] === "AS") {
        const exprStart = colDef.indexOf("(", i + 2);
        const exprEnd = colDef.lastIndexOf(")");
        if (exprStart !== -1 && exprEnd !== -1) {
          let generationType = "";
          if (tokens.some((t) => t.toUpperCase() === "STORED")) {
            generationType = "STORED";
          } else if (tokens.some((t) => t.toUpperCase() === "VIRTUAL")) {
            generationType = "VIRTUAL";
          }

          column.generated = {
            expression: colDef.slice(exprStart + 1, exprEnd),
            type: generationType as "STORED" | "VIRTUAL",
          };

          i = tokens.length;
        }
      }
    }

    i++;
  }

  return column;
}

function parseTableConstraint(constraintDef: string): SqlTableConstraintCommonSqlite {
  const constraint = createDefaultConstraint();
  const upperDef = constraintDef.toUpperCase();

  // 提取约束名（如果有）
  const nameMatch = constraintDef.match(/^CONSTRAINT\s+(["']?[^"'\s]+["']?)\s+/i);
  if (nameMatch) {
    constraint.name = nameMatch[1].replace(/["']/g, "");
  }

  //  要首先检查外键
  if (upperDef.includes("FOREIGN KEY")) {
    constraint.type = "FOREIGN_KEY";
    const match = constraintDef.match(
      /FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+([^(\s]+)\s*\(([^)]+)\)(?:\s+ON DELETE\s+(NO ACTION|RESTRICT|SET NULL|SET DEFAULT|CASCADE))?(?:\s+ON UPDATE\s+(NO ACTION|RESTRICT|SET NULL|SET DEFAULT|CASCADE))?/i,
    );

    if (match) {
      constraint.columns = match[1].split(",").map((c) => c.trim().replace(/["']/g, ""));
      constraint.referenceTable = match[2].replace(/["']/g, "");
      constraint.referenceColumns = match[3].split(",").map((c) => c.trim().replace(/["']/g, ""));

      if (match[4]) {
        constraint.onDelete = match[4].toUpperCase() as any;
      }

      if (match[5]) {
        constraint.onUpdate = match[5].toUpperCase() as any;
      }
    }
  } else if (upperDef.includes("PRIMARY KEY")) {
    constraint.type = "PRIMARY_KEY";
    const match = constraintDef.match(/PRIMARY KEY\s*\(([^)]+)\)/i);
    if (match) {
      constraint.columns = match[1].split(",").map((c) => c.trim().replace(/["']/g, ""));
    }
  } else if (upperDef.includes("UNIQUE")) {
    constraint.type = "UNIQUE";
    const match = constraintDef.match(/UNIQUE\s*\(([^)]+)\)/i);
    if (match) {
      constraint.columns = match[1].split(",").map((c) => c.trim().replace(/["']/g, ""));
    }
  } else if (upperDef.includes("CHECK")) {
    constraint.type = "CHECK";
    const conditionStart = constraintDef.indexOf("(", upperDef.indexOf("CHECK"));
    const conditionEnd = constraintDef.lastIndexOf(")");
    if (conditionStart !== -1 && conditionEnd !== -1) {
      constraint.condition = constraintDef.slice(conditionStart + 1, conditionEnd);
    }
  }

  return constraint;
}

function splitSqlTokens(sqlPart: string): string[] {
  const tokens: string[] = [];
  let currentToken = "";
  let inParens = 0;
  let inQuotes = false;
  let quoteChar = "";

  for (let i = 0; i < sqlPart.length; i++) {
    const char = sqlPart[i];

    if (char === "'" || char === '"') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      }
    }

    if (!inQuotes) {
      if (char === "(") {
        inParens++;
      } else if (char === ")") {
        inParens--;
      } else if (char === "," && inParens === 0) {
        tokens.push(currentToken.trim());
        currentToken = "";
        continue;
      }
    }

    currentToken += char;
  }

  if (currentToken.trim()) {
    tokens.push(currentToken.trim());
  }

  return tokens;
}

/**
 * 把结构化数据转为建表语句
 * @param table 结构化数据
 * @returns
 */
export function generateCreateTableDdl(table: TableStructure): string {
  const parts: string[] = [];

  // 基础建表语句
  parts.push(`CREATE TABLE "${quoteIdentifier(table.tableName)}" (`);

  // 处理列定义
  const columnDefinitions = table.columns.map((col) => {
    const tokens: string[] = [];

    // 列名和类型
    tokens.push(`${quoteIdentifier(col.name)} ${col.type}`);

    // 主键 (列级)
    if (col.isPrimaryKey) {
      tokens.push("PRIMARY KEY");
      if (col.autoIncrement) tokens.push("AUTOINCREMENT");
    }

    // NULL 约束
    if (!col.isNullable) tokens.push("NOT NULL");

    // UNIQUE 约束
    if (col.isUniqueKey) tokens.push("UNIQUE");

    // 默认值
    if (col.defaultValue !== null) {
      tokens.push(`DEFAULT ${formatToSqlValueSqlite(col.defaultValue)}`);
    }

    // COLLATE
    if (col.collation) tokens.push(`COLLATE ${col.collation}`);

    // CHECK 约束
    if (col.checkConstraint) {
      tokens.push(`CHECK (${col.checkConstraint})`);
    }

    // GENERATED 列
    if (col.generated) {
      tokens.push(`GENERATED ALWAYS AS (${col.generated.expression}) ${col.generated.type}`);
    }

    return tokens.join(" ");
  });

  // 处理表级约束
  const tableConstraints = table.constraints.map((constraint) => {
    const tokens: string[] = [];

    if (constraint.name) {
      tokens.push(`CONSTRAINT ${quoteIdentifier(constraint.name)}`);
    }

    switch (constraint.type) {
      case "PRIMARY_KEY":
        // 这里只处理复合主键
        if (constraint.columns && constraint.columns.length > 1) {
          tokens.push(`PRIMARY KEY (${constraint.columns?.map(quoteIdentifier).join(", ")})`);
        }
        break;
      case "UNIQUE":
        // 这里只处理复合唯一索引
        if (constraint.columns && constraint.columns.length > 1) {
          tokens.push(`UNIQUE (${constraint.columns?.map(quoteIdentifier).join(", ")})`);
        }
        break;
      case "CHECK":
        tokens.push(`CHECK (${constraint.condition})`);
        break;
      case "FOREIGN_KEY":
        tokens.push(
          `FOREIGN KEY (${constraint.columns?.map(quoteIdentifier).join(", ")}) ` +
            `REFERENCES ${quoteIdentifier(constraint.referenceTable!)} ` +
            `(${constraint.referenceColumns?.map(quoteIdentifier).join(", ")})`,
        );
        if (constraint.onDelete) tokens.push(`ON DELETE ${constraint.onDelete}`);
        if (constraint.onUpdate) tokens.push(`ON UPDATE ${constraint.onUpdate}`);
        break;
    }

    return tokens.join(" ");
  });

  // 合并列定义和约束
  parts.push([...columnDefinitions, ...tableConstraints].join(",\n  "));

  // 闭合基础建表语句的括号
  parts.push(")");

  // 添加表选项
  if (table.options.withoutRowId) parts.push("WITHOUT ROWID");
  if (table.options.strict) parts.push("STRICT");

  return parts.join("\n");
}

// 处理标识符引号
function quoteIdentifier(name: string): string {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) ? name : `"${name}"`;
}

export function test() {
  // 使用示例
  const sql = `CREATE TABLE employees (
    emp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_name TEXT NOT NULL COLLATE NOCASE,
    emp_uid INT(8) NOT NULL COLLATE NOCASE,
    amount DECIMAL(10,2) DEFAULT 0.0,
    email TEXT UNIQUE NOT NULL,
    department TEXT DEFAULT 'General',
    salary REAL CHECK (salary > 0),
    hire_date DATE DEFAULT CURRENT_DATE,
    manager_id INTEGER,
    CONSTRAINT pk_emp PRIMARY KEY (emp_id),
    CONSTRAINT uk_name_dept UNIQUE (emp_name, department),
    CONSTRAINT chk_name_length CHECK (length(emp_name) > 1),
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    emp_info TEXT GENERATED ALWAYS AS (emp_name || ' (' || department || ')') VIRTUAL
) WITHOUT ROWID`;

  const tableStructure = parseCreateTableDdl(sql);

  console.log(JSON.stringify(tableStructure, null, 2));

  console.log(generateCreateTableDdl(tableStructure));
}
