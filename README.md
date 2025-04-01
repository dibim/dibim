# DIBIM

## 简介

**DIBIM** 是一个简单易用的数据库管理软件.

依托于 [Tauri](https://tauri.app/), 操作数据库等基础功能均在rust中实现, 前端所需的数据在前端通过原生 SQL 语句传递给 rust 执行.

前端使用 [TypeScript](https://www.typescriptlang.org) + [React](https://react.dev/) + [shadcn/ui](https://ui.shadcn.com/), 易于扩展.

后端使用 [sqlx](https://github.com/launchbadge/sqlx) 操作 SQL 数据库, 支持  PostgreSQL, MySQL, MariaDB, SQLite.

## 快捷键

- f2: 切换侧边栏
- f3: 切换列表栏
- f9: 执行 sql 编辑器里的代码
- alt + shift + f: 执行 sql 编辑器里的代码

## 使用 valtio

在组件中使用 Valtio 时，通过 `const snap = useSnapshot(appState)` 获取的状态快照（snap）应当用于组件的渲染输出（return 语句）中读取值。
在事件处理、副作用等逻辑操作中，应当直接操作原始状态对象 appState 而不是快照对象 snap。

## TODO

### v0.1 pg

- 查询结果的编辑
  - sql 编辑器的结果集
  - 分页还有问题
- 表格数据列表  
  - 待生成删除语句 ---
  - 添加行数据
  - 按钮功能函数还有未做完的

### v0.2 sqlite

- 支持 sqlite
- 添加连接要检查是否重复
- 表格数据分页查询, 没有主键的待实现

### v0.3 mysql

- 支持 mysql
- 密码在内存中的存储方式要改一下, 使用类似 libsodium 的方式保存  
- 优化页面表格超出尺寸的控制
- 优化确认框的尺寸控制

### v0.4 优化 sql 语句功能

- sql 编辑器
  - 记录到历史
  - 要实现代码提示(表名和字段名) 推迟
- 大字符串查看器
- 分区  

### v0.5

- 字段类型改为下拉框, 提高效率
- 表结构的对话框保存是添加检查
- 优化表名列表的磁盘占用大小的样式
- 导出sql编辑器的结果集

### v1.0

- 实现多标签页
- 支持符合主键
- 支持外键
- 支持触发器
- 实现表数据导入/导出
- 添加更多快捷键:

  - alt + d 数据库连接列表
  - alt + t 表格列表
  - alt + f 函数列表
  - alt + v 视图列表
  - alt + c 添加数据库连接
  - alt + b 备份
  - alt + l 锁屏(设置主密码之后)
  - f1 关于
  - f3 切换sql编辑器下方的提示栏栏
  - f5 刷新数据(表结构/ddl等)

## 更多功能

- 同步配置文件等, 使用 gist 存储
- ER 图
- 支持更多数据库
- (跨数据库)数据同步
- 云数据库支持
- 操作日志记录
- 数据导入/导出支持更多格式
- 代码片段库
- 团队协作
  
## 其它

### oracle 和 mssql 的测试环境

```sh
# Oracle XE (社区维护的镜像)
docker pull gvenzl/oracle-xe:21
docker run -d -p 1521:1521 -e ORACLE_PASSWORD=yourpw gvenzl/oracle-xe:21

# SQL Server
docker pull mcr.microsoft.com/mssql/server:2022-latest
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=yourStrong(!)Password" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```
