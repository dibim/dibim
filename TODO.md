
# 📝 TODO

## v0.1 PostgreSQL ✅

- 支持 PostgreSQL 基础功能 ✅
- 优化表格数据的尺寸✅
- SQL 编辑器结果集分页 ✅
- 表格数据列表的 添加行✅

## v0.2 SQLite ✅

- 支持 SQLite ✅
- 添加连接要检查是否重复 ✅
- 表结构里的字段类型可使用下拉框选择 ✅
- 表格数据列表的 添加行的语句改为批量插入 ✅

## v0.3 国际化 ✅

- 国际化 ✅
- 侧边栏宽度按语言自动适应 ✅
- 外观配置文件用明文存储 ✅

## v0.4 多标签页

- 实现多标签页 ✅
- 使用自定义的 Sidebar 组件 ✅
- 标签页的标题和颜色跟随实际功能动态变化 ✅

## v0.5 MySQL

- 在使用过程中逐步完善，其它功能后续有时间再开发📌  
- 优化对话框中的自增
- 字段添加 COLLATE
- 字段添加 CHECK 约束
- 支持 mysql
- 密码在内存中的存储方式要改一下, 使用类似 libsodium 的方式保存  

## v0.6 SQL 功能增强

- SQL 编辑器
  - 记录语句到历史
  - 要实现代码提示(数据库名和字段名)
  - 可用的库: monaco-sql-languages
- 大字符串查看器
- 分区  
- 表结构的对话框保存时添加检查
- 导出sql编辑器的结果集

## 更多功能

- 实现表数据导入/导出
- 支持复合主键
- 支持外键
- 支持触发器
- 添加更多快捷键:

  - alt + d 数据库连接列表
  - alt + t 表格列表
  - alt + f 函数列表
  - alt + v 视图列表
  - alt + c 添加数据库连接
  - alt + b 备份
  - alt + l 锁屏(设置主密码之后)  
  - f5 刷新数据(表结构/ddl等)
  - delete 删除行
  - enter 在对话框里快速确定

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

### Oracle 和 MSSQL 测试环境

```sh
# Oracle XE（社区维护镜像）
docker pull gvenzl/oracle-xe:21
docker run -d -p 1521:1521 -e ORACLE_PASSWORD=yourpw gvenzl/oracle-xe:21

# SQL Server
docker pull mcr.microsoft.com/mssql/server:2022-latest
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=yourStrong(!)Password" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```
