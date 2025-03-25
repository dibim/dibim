/**
 * SQL 编辑器及其查询结果
 */
import { useMemo } from "react";
import * as Monaco from "monaco-editor";
import sqlWorker from "monaco-editor/esm/vs/basic-languages/sql/sql?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import Editor from "@monaco-editor/react";

// 初始化 Monaco 环境, 避免从 CDN 加载
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "sql") return new sqlWorker();
    return new editorWorker();
  },
};

const SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "GROUP BY",
  "ORDER BY",
  "INSERT INTO",
  "UPDATE",
  "DELETE",
  "CREATE TABLE",
  "ALTER TABLE",
];

export function SqlEditor() {
  const beforeMount = useMemo(
    () => (monacoInstance: typeof Monaco) => {
      monacoInstance.languages.register({ id: "sql" });

      // 代码补全逻辑
      monacoInstance.languages.registerCompletionItemProvider("sql", {
        triggerCharacters: SQL_KEYWORDS.map((k) => k[0].toLowerCase()),
        provideCompletionItems: (model, position) => {
          // 获取当前光标前的单词范围
          const word = model.getWordUntilPosition(position);

          const prefix = model
            .getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            })
            .toLowerCase();

          // 生成补全建议
          const suggestions = SQL_KEYWORDS.filter((k) => k.toLowerCase().startsWith(prefix)).map((keyword) => ({
            label: keyword,
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            insertText: keyword + (SQL_KEYWORDS.includes(keyword) ? " " : ""), // 添加空格
            range: new monacoInstance.Range( // 替换范围
              position.lineNumber,
              word.startColumn, // 输入起始位置
              position.lineNumber,
              word.endColumn, // 输入结束位置
            ),
            filterText: keyword.toLowerCase(), // 强制小写匹配
            sortText: "0" + keyword, // 确保正确排序
          }));

          return { suggestions };
        },
      });
    },
    [],
  );

  return (
    <div>
      <div>操作按钮: 执行 / 格式化等</div>
      <div>
        <Editor
          height="500px"
          language="sql"
          theme="vs-dark"
          beforeMount={beforeMount}
          options={{
            suggestOnTriggerCharacters: true, // 必须开启
            quickSuggestions: {
              other: true, // 非注释/字符串区域也显示建议
              comments: false,
              strings: true,
            },
            autoClosingBrackets: "always",
            autoIndent: "full",
            formatOnType: true,
            wordBasedSuggestions: "off", // 禁用默认单词补全（关键！）
            acceptSuggestionOnEnter: "on", // 回车直接选中
          }}
        />
      </div>
      <div>查询的据</div>
      <div>错误提示</div>
    </div>
  );
}
