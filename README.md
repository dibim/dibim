# Tauri + React + Typescript

## TODO

- 表格数据分页查询
- 页面表格超出尺寸的控制待优化
- 添加db链接, 启动时的逻辑优化一下
- 表结构的编辑, 推迟
- 大字符串查看器
- 分区
- ddl 推迟

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## rust 只负责连接和直接返回数据库的结果

### 查询

某些数据库库可能提供直接将查询结果转换为 JSON 的功能。例如：

    PostgreSQL: 可以直接在 SQL 查询中使用 json_agg 或 row_to_json 函数，将查询结果直接返回为 JSON 格式。

    MySQL: 可以使用 JSON_OBJECT 或 JSON_ARRAYAGG 函数。

    SQLite: 可以使用 json_group_array 或 json_object 函数。

示例：PostgreSQL 使用 json_agg

```sql

SELECT json_agg(row_to_json(t))
FROM (
    SELECT id, name FROM users
) t;
```

示例：MySQL 使用 JSON_OBJECT

```sql
SELECT JSON_OBJECT('id', id, 'name', name) FROM users;
```

示例：SQLite 使用 json_group_array

```sql
SELECT json_group_array(json_object('id', id, 'name', name)) FROM users;
```

在这种情况下，数据库会直接返回 JSON 字符串，你只需要在 Rust 中读取并输出即可。

### 非查询

pg

```rust
// 执行 UPDATE 语句
let rows_affected = client.execute("UPDATE users SET name = 'Alice' WHERE id = 1", &[]).await?;

// 构造 JSON 结果
let result = json!({
    "operation": "UPDATE",
    "rows_affected": rows_affected,
});
```

mysql

```rust
    // 获取受影响的行数
let rows_affected = conn.affected_rows();

// 构造 JSON 结果
let result = json!({
    "operation": "UPDATE",
    "rows_affected": rows_affected,
});
```

sqlite

```rust
    // 执行 UPDATE 语句
let rows_affected = conn.execute("UPDATE users SET name = 'Alice' WHERE id = 1", [])?;

// 构造 JSON 结果
let result = json!({
    "operation": "UPDATE",
    "rows_affected": rows_affected,
});

```
