# 🚀 DIBIM

## ✨ 简介

**DIBIM** 是一个简单易用的跨平台数据库管理软件。

- ⚡ **基于 Tauri 框架**：安装包小，内存占用低
- 🖥️ **前端**：TypeScript + React + shadcn/ui
- ⚙️ **后端**：Rust + SQLx
- 🗄️ **数据库支持**：PostgreSQL / SQLite（MySQL/MariaDB - 进行中）

[TODO](./TODO.md)

## ✨ Introduction

**DIBIM** is a simple and easy-to-use cross-platform database management software.

- ⚡ **Based on Tauri framework**: Small binary size & low memory footprint
- 🖥️ **Frontend**: TypeScript + React + shadcn/ui
- ⚙️ **Backend**: Rust + SQLx
- 🗄️ **Database support**: PostgreSQL / SQLite (MySQL/MariaDB - In Progress)

[TODO](./TODO.md)

## 官方仓库地址

- 🌍 GitHub: [https://github.com/dibim/dibim](https://github.com/dibim/dibim)
- 🇨🇳 Gitee（中国）: [https://gitee.com/dibim/dibim](https://gitee.com/dibim/dibim)
- 🇩🇪 Codeberg（德国）: [https://codeberg.org/dibim/dibim](https://codeberg.org/dibim/dibim)

## Official repositories

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

| 按键         | 功能                       |
|--------------|----------------------------|
| `F1`         | ℹ️ 关于                    |
| `F2`         | 📜 切换列表栏              |
| `F8`         | 🧹 格式化SQL编辑器代码     |
| `F9`         | ▶️ 执行SQL编辑器代码       |

## ⌨️ Shortcut keys

| Keys         | Function                  |
|--------------|---------------------------|
| `F1`         | ℹ️ About                  |
| `F2`         | 📜 Toggle list bar        |
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
f
