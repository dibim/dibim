import { useMemo, useRef, useState } from "react";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { NotebookText, Play } from "lucide-react";
import * as Monaco from "monaco-editor";
import sqlWorker from "monaco-editor/esm/vs/basic-languages/sql/sql?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import Editor, { BeforeMount, OnChange, OnMount } from "@monaco-editor/react";
import { DEFAULT_PAGE_SIZE, reIsSingletQuery } from "@/constants";
import { exec, query } from "@/databases/adapter,";
import { appState } from "@/store/valtio";
import { DbResult } from "@/types/types";
import { formatSql } from "@/utils/format_sql";
import { EditableTable, TableDataChange } from "../EditableTable";
import { PaginationSection } from "../PaginationSection";
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
  async function queryPage(page: number) {
    // FIXME: 查询页码1 媒介过, 第二页才有, 估计是rust的问题
    console.log("查询 页码 :  ", page);

    const res = await query(code, true, page, DEFAULT_PAGE_SIZE);

    console.log("查询 res :  ", res);

    if (res) {
      const resData = res as unknown as DbResult;
      if (resData.errorMessage !== "") {
        setErrorMessage(resData.errorMessage.replace("error returned from database: ", " "));
      } else {
        setFieldNames(JSON.parse(resData.columnName) as string[]);
        setTableData(JSON.parse(resData.data) as { [key: string]: any }[]);
      }
    }
  }

  // 格式化代码
  function formatCode() {
    const code = getEditorCode();
    setEditorCode(formatSql(appState.currentDbType, code));
  }

  // 执行代码
  async function execCode() {
    // 获取前10个字符（如果字符串不足10个字符则取全部）
    const first10Chars = getEditorCode().trim().substring(0, 10).toLowerCase();
    // TODO: 只需支持单表查询

    // 检查是否包含"select"
    if (first10Chars.includes("select")) {
      if (reIsSingletQuery.test(code)) {
        await queryPage(currentPage);
      } else {
        console.log("不是单表查询");
      }
    } else {
      const res = await exec(code);

      // TODO:
      console.log("res:   ", res);

      if (res) {
        const resData = res as unknown as DbResult;
        if (resData.errorMessage !== "") {
          setErrorMessage(resData.errorMessage.replace("error returned from database: ", " "));
        } else {
          //  TODO: 显示影响的行数
        }
      }
    }
  }

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
  // ========== 面板控制 结束 ==========

  // ========== 结果集和状态栏 ==========
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  // ========== 结果集和状态栏 结束 ==========

  // ========== 编辑器 ==========
  const [code, setCode] = useState<string>("");
  const editorRef = useRef<any>(null);

  const handleEditorChange: OnChange = (value: string | undefined, _ev: Monaco.editor.IModelContentChangedEvent) => {
    setCode(value || "");
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // 添加快捷键
    // 运行代码
    editor.addCommand(monaco.KeyCode.F9, async () => {
      await execCode();
    });
    // 格式化代码
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => formatCode());
  };

  const beforeMount: BeforeMount = useMemo(
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

  // 获取编辑器里的代码
  function getEditorCode() {
    if (editorRef.current) {
      return editorRef.current.getValue();
    }
    return "";
  }

  // 设置编辑器里的代码
  function setEditorCode(newCode: string) {
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
    }
  }
  // ========== 编辑器 结束 ==========

  // ========== 分页 结束 ==========
  const [currentPage, setCurrentPage] = useState<number>(1); // 当前页码
  const [pageTotal, setPageTotal] = useState<number>(0); // 页数
  const [itemsTotal, setItemsTotal] = useState<number>(0); // 数据总条数

  //  表格的变化
  const [changes, setChanges] = useState<TableDataChange[]>([]); // 记录所有修改的变量
  function onChange(val: TableDataChange[]) {
    setChanges(val);
    // TODO: 保存时生成语句
  }

  async function getData() {
    // setCurrentPage(currentPage + 1);

    // FIXME: 这里的分页有问题. 可能是 rust 的问题, 也可能是没有执行 setPageTotal 和 setItemsTotal, 计算出错
    await queryPage(currentPage + 1);
  }

  // ========== 分页 结束 ==========

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
          <div className="flex flex-col">
            <PaginationSection
              currentPage={currentPage}
              setCurrentPage={(val) => setCurrentPage(val)}
              pageTotal={pageTotal}
              itemsTotal={itemsTotal}
              getData={getData}
            />
            <div className="flex-1 w-full h-full overflow-scroll">
              {/* FIXME: 找到主键和唯一索引, 不能写死 id */}
              <EditableTable
                fieldNames={fieldNames}
                fieldNamesUnique={["id"]}
                dataArr={tableData}
                onChange={onChange}
                editable={true}
                multiSelect={true}
              />
            </div>
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
