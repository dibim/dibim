/**
 * SQL 编辑器及其查询结果
 */
import { useMemo, useRef, useState } from "react";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { NotebookText, Play } from "lucide-react";
import * as Monaco from "monaco-editor";
import sqlWorker from "monaco-editor/esm/vs/basic-languages/sql/sql?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import Editor from "@monaco-editor/react";
import { exec, query } from "@/databases/adapter,";
import { useCoreStore } from "@/store";
import { DbResult } from "@/types/types";
import { formatSql } from "@/utils/format_sql";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
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
  const { currentDbType } = useCoreStore();

  // ========== 面板控制  ==========
  const [showResultBar, setShowResultBar] = useState<boolean>(false);
  const panelResultRef = useRef<ImperativePanelHandle>(null);
  function toggleResultBar() {
    if (panelResultRef.current) {
      if (showResultBar) {
        panelResultRef.current.expand();
      } else {
        panelResultRef.current.collapse();
      }
      setShowResultBar(!showResultBar);
    }
  }

  const [showStatusBar, setShowStatusBar] = useState<boolean>(false);
  const panelStatusBarRef = useRef<ImperativePanelHandle>(null);
  function toggleStatusBar() {
    if (panelStatusBarRef.current) {
      if (showStatusBar) {
        panelStatusBarRef.current.expand();
      } else {
        panelStatusBarRef.current.collapse();
      }
      setShowStatusBar(!showStatusBar);
    }
  }
  // ========== 面板空值 结束 ==========

  // ========== 结果集和状态栏 ==========
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [columnName, setColumnName] = useState<string[]>([]);
  const [dataArr, setDataArr] = useState<any[]>([]);

  // ========== 结果集和状态栏 结束 ==========

  // ========== 编辑器 ==========
  const [code, setCode] = useState<string>("");
  const editorRef = useRef<any>(null);

  const handleEditorChange = (value: string | undefined, _ev: Monaco.editor.IModelContentChangedEvent) => {
    setCode(value || "");
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
  };

  // 获取编辑器里的代码
  const getEditorCode = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      console.log("Current code:", code);
      return code;
    }
    return "";
  };

  // 设置编辑器里的代码
  const setEditorCode = (newCode: string) => {
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
    }
  };

  // 格式化代码
  function formatCode() {
    const code = getEditorCode();
    console.log("code: ", code);

    setEditorCode(formatSql(currentDbType, code));
  }

  // 执行代码
  async function execCode() {
    // 不能都用 exec, 查询的会不返回结果

    let res = null;
    let isQuery = false;
    // 获取前10个字符（如果字符串不足10个字符则取全部）
    const first10Chars = code.trim().substring(0, 10).toLowerCase();

    // 检查是否包含"select"
    if (first10Chars.includes("select")) {
      // TODO: 实现翻页
      res = await query(code, true, 1, 100);
      isQuery = true;
    } else {
      res = await exec(code);
    }

    console.log("res:   ", res);

    if (res) {
      const resData = res as unknown as DbResult;
      if (resData.errorMessage !== "") {
        setErrorMessage(resData.errorMessage.replace("error returned from database: ", " "));
      } else {
        if (isQuery) {
          setColumnName(JSON.parse(resData.columnName) as string[]);
          setDataArr(JSON.parse(resData.data) as { [key: string]: any }[]);
        }
      }
    }
  }

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
  // ========== 编辑器 结束 ==========

  function renderEditor() {
    return (
      <div className="flex">
        <div className="pe-2 ">
          <Tooltip>
            <TooltipTrigger asChild>
              <Play className="mb-2" onClick={execCode} />
            </TooltipTrigger>
            <TooltipContent>
              <p>执行</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <NotebookText className="mb-2" onClick={formatCode} />
            </TooltipTrigger>
            <TooltipContent>
              <p>格式化</p>
            </TooltipContent>
          </Tooltip>
          {/*           
          FIXME: 3个 panel 先后折叠 2 个会有问题, 这 2 个里始终会显示一个
          <Tooltip>
            <TooltipTrigger asChild>
              <Grid3x3 className="mb-2" onClick={toggleResultBar} />
            </TooltipTrigger>
            <TooltipContent>
              <p>显示结果集</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ShieldAlert className="mb-2" onClick={toggleStatusBar} />
            </TooltipTrigger>
            <TooltipContent>
              <p>显示状态栏</p>
            </TooltipContent>
          </Tooltip> */}
        </div>
        <div className="flex-1">
          <Editor
            height="500px"
            language="sql"
            theme="vs-dark"
            beforeMount={beforeMount}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
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
        <Panel defaultSize={60} minSize={20}>
          <div className="w-full">{renderEditor()}</div>
        </Panel>
        <PanelResizeHandle className="h-1 bg-secondary hover:bg-blue-500" />
        <Panel defaultSize={30} collapsible collapsedSize={0} ref={panelResultRef}>
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  {columnName.map((item, index) => (
                    <TableHead key={index}>{item}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataArr.map((rowData, index) => (
                  <TableRow key={index}>
                    {columnName.map((item, ii) => (
                      <TableCell key={ii}>{rowData[item]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>
        <PanelResizeHandle className="h-1 bg-secondary hover:bg-blue-500" />
        <Panel defaultSize={10} collapsible collapsedSize={0} ref={panelStatusBarRef}>
          <div className="w-full">
            <div>{errorMessage}</div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
