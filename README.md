# 🚀 DIBIM - 数据库管理工具 | Database Management Tools

## ✨ 简介

**DIBIM** 是一个简单易用的跨平台数据库管理软件。

- ⚡ **基于 Tauri 框架**：安装包较小，内存占用较低。
- 🖥️ **前端**：TypeScript + React + shadcn/ui。
- ⚙️ **后端**：Rust + SQLx。
- 🗄️ **数据库支持**：PostgreSQL / MySQL / MariaDB / SQLite。

**DIBIM** is a simple and easy-to-use cross platform database management software.

- ⚡ **Based on Tauri framework**: small binary & low memory.
- 🖥️ **Frontend**: TypeScript + React + shadcn/ui
- ⚙️ **Backend**: Rust + SQLx。
- 🗄️ **Database support**: PostgreSQL / MySQL / MariaDB / SQLite。

官方仓库地址:

- GitHub: [https://github.com/dibim/dibim](https://github.com/dibim/dibim)
- Gitee(中国): [https://gitee.com/dibim/dibim](https://gitee.com/dibim/dibim)
- Codeberg(德国): [https://codeberg.org/dibim/dibim](https://codeberg.org/dibim/dibim)

Official repository:

- GitHub: [https://github.com/dibim/dibim](https://github.com/dibim/dibim)
- Gitee(China): [https://gitee.com/dibim/dibim](https://gitee.com/dibim/dibim)
- Codeberg(Germany): [https://codeberg.org/dibim/dibim](https://codeberg.org/dibim/dibim)

## 🎯 核心特性

- 🚀 轻量级跨平台应用，支持 Windows / macOS / Linux
- 🔍 原生SQL操作体验，变更数据的操作均会显示要执行的语句
- 💅 响应式用户界面
- 🔄 多数据库统一管理
- 💡 可通过 TypeScript 轻松扩展更多功能

## 🎯 Core features

- 🚀 Windows / macOS / Linux Lightweight cross platform application, supporting Windows/macOS/Linux
- 🔍 Native SQL operation experience, all operations that change data will display the statements to be executed
- 💅 Responsive User Interface
- 🔄 Unified management of multiple databases
- 💡 More features can be easily extended through TypeScript

## ⌨️ 快捷键

| 快捷键        | 功能描述                     |
|--------------|----------------------------|
| `F1`         | ℹ️ 关于                     |
| `F2`         | 🗄️ 切换侧边栏               |
| `F3`         | 📜 切换列表栏               |
| `F8`         | 🧹 格式化SQL编辑器代码      |
| `F9`         | ▶️ 执行SQL编辑器代码        |

## ⌨️ Shortcut keys

| Keys       |  function                    |
|--------------|----------------------------|
| `F1`         | ℹ️ About                    |
| `F2`         | 🗄️ Switch sidebar               |
| `F3`         | 📜 Switch list bar               |
| `F8`         | 🧹 Format SQL Editor Code      |
| `F9`         | ▶️ Execute SQL editor code        |

## ⚛️ 状态管理（Valtio）

在组件中使用 Valtio 时，通过 `const snap = useSnapshot(appState)` 获取的状态快照（snap）应当用于组件的渲染输出（return 语句）中读取值。  
在事件处理、useEffect等逻辑中，应当直接操作原始状态对象 appState 而不是快照对象 snap。

## ⚛️ State Management (Valtio)

When using Valtio in a component, the state snapshot (snap) obtained through `const snap = useSnapshot(appState)` should be used to read values in the rendering output (return statement) of the component.
In event handling, useEffect, and other logic, the original state object appState should be directly manipulated instead of the snapshot object snap.

## 📝 TODO

### v0.1.0 pg✅

- 支持 pg 的基本功能✅
- 优化表格数据的尺寸✅
- sql 编辑器结果集分页✅
- 表格数据列表的 添加行✅
  
### v0.2 sqlite

- 支持 sqlite
- 添加连接要检查是否重复
- 字段类型改为下拉框
- 表格数据列表的 添加行的语句改为批量插入

### v0.3 mysql

- 支持 mysql
- 表格数据分页查询, 没有主键的待实现
- 密码在内存中的存储方式要改一下, 使用类似 libsodium 的方式保存  
- 优化确认框的尺寸控制

### v0.4 优化 sql 语句功能

- sql 编辑器
  - 记录到历史
  - 要实现代码提示(表名和字段名) 推迟
- 大字符串查看器
- 分区  

### v0.5

- 表结构的对话框保存时添加检查
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
