import { useEffect, useMemo, useRef, useState } from "react";
import Split from "react-split";
import { Grid3x3, NotebookText, Play, ShieldAlert } from "lucide-react";
import * as Monaco from "monaco-editor";
import sqlWorker from "monaco-editor/esm/vs/basic-languages/sql/sql?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { useSnapshot } from "valtio";
import Editor, { BeforeMount, OnChange, OnMount } from "@monaco-editor/react";
import { DEFAULT_PAGE_SIZE, reIsSingletQuery } from "@/constants";
import { getPageCount } from "@/databases/PostgreSQL/sql";
import { exec, query } from "@/databases/adapter,";
import { extractConditionClause } from "@/databases/utils";
import { appState } from "@/store/valtio";
import { DbResult } from "@/types/types";
import { formatSql } from "@/utils/format_sql";
import { rawRow2EtRow } from "@/utils/render";
import { genPanelPercent } from "@/utils/util";
import { EditableTable, ListRow, TableDataChange } from "../EditableTable";
import { PaginationSection } from "../PaginationSection";
import { TooltipGroup } from "../TooltipGroup";

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
  const snap = useSnapshot(appState);

  // ========== 执行语句 ==========
  async function queryPage(page: number) {
    const code = getEditorCode();
    const dbRes = await query(code, true, page, DEFAULT_PAGE_SIZE);
    if (dbRes) {
      setFieldNames(dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : []);
      const data = dbRes.data ? (JSON.parse(dbRes.data) as Record<string, any>[]) : [];

      setTableData(rawRow2EtRow(data));

      const condition = extractConditionClause(code);
      const ppp = await getPageCount(
        appState.currentConnName,
        condition.tableName,
        DEFAULT_PAGE_SIZE,
        condition.condition,
      );

      setPageTotal(ppp.pageTotal);
      setItemsTotal(ppp.itemsTotal);
    }
  }

  // 格式化代码
  function formatCode() {
    const code = getEditorCode();
    setEditorCode(formatSql(appState.currentDbType, code));
  }

  // 执行代码
  async function execCode() {
    const code = getEditorCode();
    // 获取前10个字符（如果字符串不足10个字符则取全部）
    const first10Chars = code.trim().substring(0, 10).toLowerCase();

    // 检查是否包含"select"
    if (first10Chars.includes("select")) {
      if (reIsSingletQuery.test(code)) {
        await queryPage(currentPage);
      } else {
        console.log("不是单表查询");
      }
    } else {
      const res = await exec(code);

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

  // ========== 执行语句 结束 ==========

  // ========== 面板控制  ==========
  const [sizes, setSizes] = useState<number[]>([50, 30, 20]);
  const [editorHeight, setEditorHeight] = useState<string>("300px");
  const [showResultBar, setShowResultBar] = useState<boolean>(true);
  const [showStatusBar, setShowStatusBar] = useState<boolean>(true);
  const handleResize = (sizes: number[]) => {
    setEditorHeight(`calc(${sizes[0]}vh - 40px)`); // TODO: 临时减 40px
  };

  const defaultSizes = [genPanelPercent(50), genPanelPercent(30), genPanelPercent(20)];

  function resizeLayout() {
    let ehp = 0;
    let res = structuredClone(defaultSizes);

    if (showResultBar && showStatusBar) {
      ehp = genPanelPercent(50);
      res = [ehp, genPanelPercent(30), genPanelPercent(20)];
    } else if (!showResultBar && !showStatusBar) {
      ehp = genPanelPercent(100);
      res = [ehp, 0, 0];
    } else if (!showResultBar) {
      ehp = genPanelPercent(70);
      res = [ehp, 0, genPanelPercent(30)];
    } else if (!showStatusBar) {
      ehp = genPanelPercent(70);
      res = [ehp, genPanelPercent(30), 0];
    }

    setEditorHeight(`calc(${ehp}vh - 40px)`); // TODO: 临时减 40px
    setSizes(res);
  }

  // ========== 面板控制 结束 ==========

  // ========== 结果集和状态栏 ==========
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [tableData, setTableData] = useState<ListRow[]>([]);

  // ========== 结果集和状态栏 结束 ==========

  // ========== 编辑器 ==========
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // 恢复上次编辑的语句
    editor.setValue(snap.sqlEditorContent);

    // 添加快捷键
    // 运行代码
    editor.addCommand(monaco.KeyCode.F9, async () => {
      await execCode();
    });
    // 格式化代码
    editor.addCommand(monaco.KeyCode.F8, async () => {
      formatCode();
    });
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

  const handleEditorChange: OnChange = (value: string | undefined, _ev: Monaco.editor.IModelContentChangedEvent) => {
    if (value !== undefined) {
      appState.setSqlEditorContent(value);
    }
  };

  function resizeEditor() {
    if (editorRef.current) {
      editorRef.current.layout();
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

  async function getData(page: number) {
    if (getEditorCode() === "") return;

    await queryPage(page);
  }

  // ========== 分页 结束 ==========

  // 监听 editorHeight 变化，强制更新编辑器布局
  useEffect(() => {
    resizeEditor();
  }, [editorHeight]);

  useEffect(() => {
    resizeLayout();
  }, [showResultBar, showStatusBar]);

  useEffect(() => {
    resizeLayout();
    resizeEditor();
  }, []);

  const tooltipSectionData = [
    {
      trigger: <Play className="mb-2" onClick={execCode} />,
      content: <p>执行(F9)</p>,
    },
    {
      trigger: <NotebookText className="mb-2" onClick={formatCode} />,
      content: <p>格式化(F8)</p>,
    },
    {
      trigger: <Grid3x3 className="mb-2" onClick={() => setShowResultBar(!showResultBar)} />,
      content: <p>显示结果集</p>,
    },
    {
      trigger: <ShieldAlert className="mb-2" onClick={() => setShowStatusBar(!showStatusBar)} />,
      content: <p>显示状态栏</p>,
    },
  ];

  function renderEditor() {
    return (
      <div className="flex" style={{ height: editorHeight }}>
        <div className="pe-2 ">
          <TooltipGroup dataArr={tooltipSectionData} />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <Editor
            height="100%"
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
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full nested-vertical-container">
      <Split
        sizes={sizes}
        minSize={0}
        onDragEnd={handleResize}
        className="flex overflow-hidden split-container split-vertical"
        direction="vertical"
        cursor="row-resize"
      >
        <div>{renderEditor()}</div>
        <div className="flex flex-col">
          <div>
            <PaginationSection
              currentPage={currentPage}
              setCurrentPage={(val) => setCurrentPage(val)}
              pageTotal={pageTotal}
              itemsTotal={itemsTotal}
              getData={getData}
            />
          </div>
          <div className="flex-1 w-full h-full overflow-scroll">
            <EditableTable
              fieldNames={fieldNames}
              fieldNamesUnique={[appState.uniqueFieldName]}
              dataArr={tableData}
              onChange={onChange}
              editable={appState.uniqueFieldName !== ""}
              multiSelect={true}
              height={`100%`}
              width={`clac(100vw - ${snap.sideBarWidth + snap.listBarWidth})`}
            />
          </div>
        </div>
        <div>
          <div>{errorMessage}</div>
        </div>
      </Split>
    </div>
  );
}
