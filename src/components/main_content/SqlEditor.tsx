/**
 * SQL 编辑器及其查询结果
 */
import { useMemo } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Grid3x3, NotebookText, Play, ShieldAlert } from "lucide-react";
import * as Monaco from "monaco-editor";
import sqlWorker from "monaco-editor/esm/vs/basic-languages/sql/sql?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import Editor from "@monaco-editor/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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

  function renderEditor() {
    return (
      <div className="flex">
        <div className="pe-2 ">
          <Tooltip>
            <TooltipTrigger asChild>
              <Play className="mb-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>执行</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <NotebookText className="mb-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>格式化</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Grid3x3 className="mb-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>显示结果集</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ShieldAlert className="mb-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>显示状态栏</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex-1">
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
      </div>
    );
  }

  return (
    <div className="h-full">
      <PanelGroup direction="vertical">
        <Panel defaultSize={50} minSize={20}>
          <div className="w-full">{renderEditor()}</div>
        </Panel>
        <PanelResizeHandle className="h-1 bg-secondary hover:bg-blue-500" />
        <Panel defaultSize={25}>
          <div className="w-full">
            <div>错误提示</div>
          </div>
        </Panel>
        <PanelResizeHandle className="h-1 bg-secondary hover:bg-blue-500" />
        <Panel defaultSize={25}>
          <div className="w-full">
            <div>查询的据</div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
