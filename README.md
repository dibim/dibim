# 🚀 DIBIM

## ✨ 简介

**DIBIM** 是一个简单易用的跨平台数据库管理软件。

- ⚡ **基于 Tauri 框架**：安装包小，内存占用低
- 🖥️ **前端**：TypeScript + React + shadcn/ui
- ⚙️ **后端**：Rust + SQLx
- 🗄️ **数据库支持**：PostgreSQL / SQLite / MySQL/MariaDB（尚未开始）

官方仓库地址:

- 🌍 GitHub: [https://github.com/dibim/dibim](https://github.com/dibim/dibim)
- 🇨🇳 Gitee（中国）: [https://gitee.com/dibim/dibim](https://gitee.com/dibim/dibim)
- 🇩🇪 Codeberg（德国）: [https://codeberg.org/dibim/dibim](https://codeberg.org/dibim/dibim)

## ✨ Introduction

**DIBIM** is a simple and easy-to-use cross-platform database management software.

- ⚡ **Based on Tauri framework**: Small binary size & low memory footprint
- 🖥️ **Frontend**: TypeScript + React + shadcn/ui
- ⚙️ **Backend**: Rust + SQLx
- 🗄️ **Database support**: PostgreSQL / SQLite / MySQL/MariaDB(Not Started)

Official repositories:

- 🌍 GitHub: [https://github.com/dibim/dibim](https://github.com/dibim/dibim)
- 🇨🇳 Gitee (China): [https://gitee.com/dibim/dibim](https://gitee.com/dibim/dibim)
- 🇩🇪 Codeberg (Germany): [https://codeberg.org/dibim/dibim](https://codeberg.org/dibim/dibim)

## 🎯 核心特性

- 🚀 轻量级跨平台应用，支持 Windows / macOS / Linux
- 🔍 原生SQL操作体验，数据变更操作均显示待执行语句
- 💅 响应式用户界面
- 🔄 多数据库统一管理
- 💡 可通过 TypeScript 轻松扩展功能

## 🎯 Core features

- 🚀 Lightweight cross-platform application (Windows/macOS/Linux)
- 🔍 Native SQL operation experience with preview of pending execution statements
- 💅 Responsive user interface
- 🔄 Unified multi-database management
- 💡 Easy feature extension via TypeScript

## ⌨️ 快捷键

| 快捷键       | 功能描述                   |
|--------------|----------------------------|
| `F1`         | ℹ️ 关于                    |
| `F2`         | 🗄️ 切换侧边栏              |
| `F3`         | 📜 切换列表栏              |
| `F8`         | 🧹 格式化SQL编辑器代码     |
| `F9`         | ▶️ 执行SQL编辑器代码       |

## ⌨️ Shortcut keys

| Keys         | Function                  |
|--------------|---------------------------|
| `F1`         | ℹ️ About                  |
| `F2`         | 🗄️ Toggle sidebar         |
| `F3`         | 📜 Toggle list bar        |
| `F8`         | 🧹 Format SQL editor code |
| `F9`         | ▶️ Execute SQL code       |

## 🛠️ 开发

### 📜 前置条件

[🔗 Node.js](https://nodejs.org)  
[🔗 Rust](https://www.rust-lang.org/tools/install)  
[🔗 Tauri](https://tauri.app/start/prerequisites/)  
[🔗 Bun](https://bun.sh/)

### ⚛️ 状态管理（Valtio）

在组件中使用 Valtio 时，通过 `const snap = useSnapshot(appState)` 获取的状态快照（snap）应当用于组件的渲染输出（return 语句）中读取值。  
在事件处理、useEffect等逻辑中，应当直接操作原始状态对象 appState 而不是快照对象 snap。

## 🛠️ Development

### 📜 Prerequisites

[🔗 Node.js](https://nodejs.org)  
[🔗 Rust](https://www.rust-lang.org/tools/install)  
[🔗 Tauri](https://tauri.app/start/prerequisites/)  
[🔗 Bun](https://bun.sh/)

### ⚛️ State Management (Valtio)

When using Valtio in a component, the state snapshot (snap) obtained through `const snap = useSnapshot(appState)` should be used to read values in the rendering output (return statement) of the component.
In event handling, useEffect, and other logic, the original state object appState should be directly manipulated instead of the snapshot object snap.

## 📝 TODO

### v0.1.0 PostgreSQL ✅

- 支持 PostgreSQL 基础功能 ✅
- 优化表格数据的尺寸✅
- SQL 编辑器结果集分页 ✅
- 表格数据列表的 添加行✅

### v0.2 SQLite ✅

- 支持 SQLite ✅
- 添加连接要检查是否重复 ✅
- 表结构里的字段类型可使用下拉框选择 ✅
- 表格数据列表的 添加行的语句改为批量插入 ✅

### v0.3 国际化 ✅

- 国际化 ✅
- 侧边栏宽度按语言自动适应 ✅
- 外观配置文件用明文存储 ✅

### v0.4 MySQL

- 在使用过程中逐步完善，其它功能后续有时间再开发📌
- 优化对话框中的自增
- 字段添加 COLLATE
- 字段添加 CHECK 约束
- 支持 mysql
- 表格数据分页查询, 没有主键的待实现
- 密码在内存中的存储方式要改一下, 使用类似 libsodium 的方式保存  
- 优化确认框的尺寸控制

### v0.5 SQL 功能增强

- SQL 编辑器
  - 记录到历史
  - 要实现代码提示(表名和字段名) 推迟
- 大字符串查看器
- 分区  

### v0.6

- 表结构的对话框保存时添加检查
- 导出sql编辑器的结果集

### v1.0

- 实现多标签页

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
