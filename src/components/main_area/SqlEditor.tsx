import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Split from "react-split";
import { Grid3x3, NotebookText, Play, ShieldAlert } from "lucide-react";
import * as Monaco from "monaco-editor";
import sqlWorker from "monaco-editor/esm/vs/basic-languages/sql/sql?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { useSnapshot } from "valtio";
import Editor, { BeforeMount, OnChange, OnMount } from "@monaco-editor/react";
import { DEFAULT_PAGE_SIZE, RE_IS_SINGLET_QUERY } from "@/constants";
import { getTab } from "@/context";
import { exec, query } from "@/databases/adapter,";
import { getPageCount } from "@/databases/postgresql/sql";
import { RowData } from "@/databases/types";
import { extractConditionClause } from "@/databases/utils";
import { coreState } from "@/store/core";
import { DbResult, TextNotificationData } from "@/types/types";
import { formatSql } from "@/utils/format_sql";
import { genPanelPercent } from "@/utils/util";
import { TableSection, TableSectionMethods } from "../TableSection";
import { TextNotification } from "../TextNotification";
import { TooltipGroup } from "../TooltipGroup";

// 初始化 Monaco 环境, 避免从 CDN 加载
// Initialize Monaco environment to avoid loading from CDN
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
  const tab = getTab();
  if (tab === null) return;
  const tabState = tab.state;

  const { t } = useTranslation();
  const coreSnap = useSnapshot(coreState);
  const tableRef = useRef<TableSectionMethods | null>(null);
  const [messageData, setMessageData] = useState<TextNotificationData | null>(null);

  // ========== 执行语句 | Execute statements ==========
  async function queryPage(page: number) {
    if (coreState.currentConnName === "") {
      setMessageData({
        message: t("Please connect to the database first"),
        type: "error",
      });
      return;
    }

    const code = getEditorCode();
    const dbRes = await query(code, true, page, DEFAULT_PAGE_SIZE);
    if (dbRes) {
      const data = dbRes.data ? (JSON.parse(dbRes.data) as RowData[]) : [];

      const condition = extractConditionClause(code);
      const res = await getPageCount(
        coreState.currentConnName,
        condition.tableName,
        DEFAULT_PAGE_SIZE,
        condition.condition,
      );

      if (tableRef.current) {
        tableRef.current.setFieldNames(dbRes.columnName ? (JSON.parse(dbRes.columnName) as string[]) : []);
        tableRef.current.setTableData(data);
        tableRef.current.setPageTotal(res.pageTotal);
        tableRef.current.setItemsTotal(res.itemsTotal);
      }

      if (dbRes.errorMessage !== "") {
        if (dbRes.errorMessage.startsWith("error returned from database: ")) {
          setMessageData({
            message: dbRes.errorMessage.replace("error returned from database: ", " "),
            type: "error",
          });
        } else {
          setMessageData({
            message: dbRes.errorMessage,
            type: "info",
          });
        }
      }
    } else {
      setMessageData({
        message: "The query returned null.",
        type: "info",
      });
    }
  }

  function formatCode() {
    const code = getEditorCode();
    const res = formatSql(coreState.currentConnType, code);
    if (res.errorMessage !== "") {
      setMessageData({ message: res.errorMessage, type: "error" });
    } else {
      setEditorCode(res.result);
    }
  }

  async function execCode() {
    const code = getEditorCode();
    const first10Chars = code.trim().substring(0, 10).toLowerCase();
    if (first10Chars.includes("select")) {
      if (RE_IS_SINGLET_QUERY.test(code)) {
        const currentPage = tableRef.current ? tableRef.current.getCurrentPage() : 1;
        await queryPage(currentPage);
      } else {
        console.log(t("Not a single-table query"));
      }
    } else {
      const res = await exec(code);

      if (res) {
        const resData = res as unknown as DbResult;
        if (resData.errorMessage !== "") {
          if (resData.errorMessage.startsWith("error returned from database: ")) {
            setMessageData({
              message: resData.errorMessage.replace("error returned from database: ", " "),
              type: "error",
            });
          }
          setMessageData({
            message: resData.errorMessage,
            type: "info",
          });
        } else {
          //  TODO: 显示影响的行数
        }
      } else {
        setMessageData({
          message: "The query returned null.",
          type: "error",
        });
      }
    }
  }

  // ========== 执行语句 结束 | Execute statements end ==========

  // ========== 面板控制 | Panel control  ==========
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

  // ========== 面板控制 结束 | Panel control end ==========

  // ========== 编辑器 | Editor ==========
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // 恢复上次编辑的语句 | Restore the last edited statement
    editor.setValue(tabState.sqlEditorContent);

    // 添加快捷键 | Add shortcut keys
    editor.addCommand(monaco.KeyCode.F9, async () => {
      await execCode();
    });
    editor.addCommand(monaco.KeyCode.F8, async () => {
      formatCode();
    });
  };

  const beforeMount: BeforeMount = useMemo(
    () => (monacoInstance: typeof Monaco) => {
      monacoInstance.languages.register({ id: "sql" });

      // 代码补全 | Code completion
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

  function getEditorCode() {
    if (editorRef.current) {
      return editorRef.current.getValue();
    }
    return "";
  }

  function setEditorCode(newCode: string) {
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
    }
  }

  const handleEditorChange: OnChange = (value: string | undefined, _ev: Monaco.editor.IModelContentChangedEvent) => {
    if (value !== undefined) {
      tabState.setSqlEditorContent(value);
    }
  };

  function resizeEditor() {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }
  // ========== 编辑器 结束 | Editor end ==========

  // 修改已有数据的变更记录, 不含添加和删除
  // Change logs for modifying existing data, excluding additions and deletions.
  // const [changes, setChanges] = useState<TableDataChange[]>([]);
  // function onChange(val: TableDataChange[]) {
  //   setChanges(val);
  //   // FIXME: 保存时生成语句
  // }

  async function getData(page: number) {
    if (getEditorCode() === "") return;

    await queryPage(page);
  }

  // 监听 editorHeight 变化，强制更新编辑器布局
  // Monitor changes in editorHeight and force updates to editor layout
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
      content: <p>{t("Execute")}(F9)</p>,
    },
    {
      trigger: <NotebookText className="mb-2" onClick={formatCode} />,
      content: <p>{t("Format")}(F8)</p>,
    },
    {
      trigger: <Grid3x3 className="mb-2" onClick={() => setShowResultBar(!showResultBar)} />,
      content: <p>{t("Toggle result sets")}</p>,
    },
    {
      trigger: <ShieldAlert className="mb-2" onClick={() => setShowStatusBar(!showStatusBar)} />,
      content: <p>{t("Toggle status bar")}</p>,
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
              suggestOnTriggerCharacters: true,
              quickSuggestions: {
                other: true,
                comments: false,
                strings: true,
              },
              autoClosingBrackets: "always",
              autoIndent: "full",
              formatOnType: true,
              wordBasedSuggestions: "off",
              acceptSuggestionOnEnter: "on",
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
          <TableSection
            ref={tableRef}
            width={`clac(100vw - ${coreSnap.sideBarWidth + coreSnap.listBarWidth})`}
            getData={getData}
            initData={() => {}}
          />
        </div>
        <div>
          <TextNotification message={messageData?.message || ""} type={messageData?.type}></TextNotification>
        </div>
      </Split>
    </div>
  );
}
