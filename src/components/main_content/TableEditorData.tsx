import { useEffect, useRef, useState } from "react";
import { CircleCheck, CircleMinus, CirclePlus, CircleX, RotateCw } from "lucide-react";
import { subscribeKey } from "valtio/utils";
import { DEFAULT_PAGE_SIZE, HEDAER_H } from "@/constants";
import { exec, genDeleteRowsCmd, genUpdateFieldCmd, getTableData } from "@/databases/adapter,";
import { FieldWithValue } from "@/databases/types";
import { getDefultOrderField } from "@/databases/utils";
import { cn } from "@/lib/utils";
import { appState } from "@/store/valtio";
import { ConfirmDialog } from "../ConfirmDialog";
import { EditableTable, EditableTableMethods, ListRow, TableDataChange } from "../EditableTable";
import { PaginationSection } from "../PaginationSection";
import { SqlCodeViewer } from "../SqlCodeViewer";
import { TextWarning } from "../TextWarning";
import { TooltipGroup } from "../TooltipGroup";

export function TableEditorData() {
  const tableRef = useRef<EditableTableMethods | null>(null);

  const [tableData, setTableData] = useState<Record<string, any>[]>([]); // 表格数据
  const [fieldNames, setFieldNames] = useState<string[]>([]); // 字段名
  const [willExecCmd, setWillExecCmd] = useState<string>(""); // 将要执行的命令(sql 语句)
  const [showDialogAlter, setShowDialogAlter] = useState<boolean>(false);

  // 获取表格数据
  const getData = async (page: number) => {
    if (appState.currentTableName === "") {
      return [];
    }

    // 整理参数
    const orderBy = getDefultOrderField(appState.currentTableStructure);
    const lastRow = tableData[tableData.length - 1];
    const lastOrderByValue = lastRow ? (lastRow as any)[orderBy] : null;

    if (orderBy === "") {
      console.log("orderBy 为空字符串");
      return [];
    }

    const res = await getTableData({
      tableName: appState.currentTableName,
      sortField: orderBy,
      sortOrder: "ASC",
      currentPage: page,
      pageSize: DEFAULT_PAGE_SIZE,
      lastOrderByValue,
    });

    if (res) {
      setFieldNames(res.columnName);
      setTableData(res.data);
      setItemsTotal(res.itemsTotal);
      setPageTotal(res.pageTotal);

      return res.data;
    }

    return [];
  };

  // ========== 分页 ==========
  const [currentPage, setCurrentPage] = useState<number>(1); // 当前页码
  const [pageTotal, setPageTotal] = useState<number>(0); // 页数
  const [itemsTotal, setItemsTotal] = useState<number>(0); // 数据总条数

  //  表格的变化
  const [changes, setChanges] = useState<TableDataChange[]>([]); // 记录所有修改的变量
  function onChange(val: TableDataChange[]) {
    setChanges(val);
  }
  // ========== 分页 结束 ==========

  function handleApply() {
    if (appState.uniqueFieldName === "") return;

    const deletedSet = tableRef.current?.getMultiDeleteData() || new Set();

    // 处理变更数据的航
    const rowDataMap = new Map<number, TableDataChange[]>();
    for (const c of changes) {
      // 是删除的行的 index 不处理
      if (deletedSet.has(c.index)) continue;

      if (rowDataMap.has(c.index)) {
        rowDataMap.get(c.index)!.push(c);
      } else {
        rowDataMap.set(c.index, [c]);
      }
    }

    const sqls: string[] = [];
    rowDataMap.forEach((changes, rowIndex) => {
      // TODO: 根据表结构去找
      const uniqueField: FieldWithValue = {
        field: appState.uniqueFieldName,
        value: rowIndex,
      };
      const fieldArr: FieldWithValue[] = [];
      for (const c of changes) {
        fieldArr.push({
          field: c.field,
          value: c.new,
        });
      }

      sqls.push(genUpdateFieldCmd(appState.currentTableName, uniqueField, fieldArr));
    });

    // 最后处理删除行
    const arr = []; // 要删除的唯一字段(主键或唯一索引)的值
    for (let index = 0; index < tableData.length; index++) {
      const row = tableData[index];
      if (deletedSet.has(index)) {
        arr.push(row[appState.uniqueFieldName]);
      }
    }
    sqls.push(genDeleteRowsCmd(appState.currentTableName, appState.uniqueFieldName, arr));

    setWillExecCmd(sqls.join(""));
    setShowDialogAlter(true);
  }

  function handleCancel() {
    setChanges([]);
    tableRef.current?.resetMultiSelectData();
  }

  function handleAdd() {
    //TODO:; 为了简单, 直接在表格最开始的位置添加
  }

  function handleDelete() {
    if (appState.uniqueFieldName === "") return;

    tableRef.current?.deleteMultiSelectedRow();
  }

  const [dataArr, setDataArr] = useState<ListRow[]>([]);
  function updateDataArr(data: object[]) {
    const dataArrTemp: ListRow[] = [];
    data.map((row) => {
      const wrappedRow: ListRow = {};
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          wrappedRow[key] = {
            render: (val: any) => <div>{val}</div>,
            value: (row as any)[key],
          };
        }
      }

      dataArrTemp.push(wrappedRow);
    });
    setDataArr(dataArrTemp);
  }

  // 确定执行语句
  function handleConfirm() {
    exec(willExecCmd);
    initData();
  }

  async function initData() {
    const data = await getData(1);
    setCurrentPage(1);
    updateDataArr(data);
  }

  useEffect(() => {
    initData();

    // 监听 store 的变化
    const unsubscribe = subscribeKey(appState, "currentTableName", (_value: any) => {
      initData();
    });
    return () => unsubscribe();
  }, []);

  const tooltipSectionData = [
    {
      trigger: <RotateCw color="var(--fvm-info-clr)" onClick={() => getData(currentPage)} />,
      content: <p>刷新</p>,
    },
    {
      trigger: <CirclePlus color="var(--fvm-primary-clr)" onClick={handleAdd} />,
      content: <p>添加行</p>,
    },
    {
      trigger: <CircleMinus color="var(--fvm-danger-clr)" onClick={handleDelete} />,
      content: <p>删除行</p>,
    },
    {
      trigger: <CircleCheck color="var(--fvm-success-clr)" onClick={handleApply} />,
      content: <p>应用</p>,
    },
    {
      trigger: <CircleX color="var(--fvm-warning-clr)" onClick={handleCancel} />,
      content: <p>取消</p>,
    },
  ];

  return (
    <>
      {/* 按钮栏 */}
      <div className="flex flex-wrap pb-2">
        <div className={cn("gap-4 px-2 pb-2 sm:pl-2.5 inline-flex items-center justify-center ")}>
          <TooltipGroup dataArr={tooltipSectionData} />
        </div>
        <div className="flex flex-1">
          <PaginationSection
            currentPage={currentPage}
            setCurrentPage={(val) => setCurrentPage(val)}
            pageTotal={pageTotal}
            itemsTotal={itemsTotal}
            getData={getData}
          />
          {appState.uniqueFieldName === "" && (
            <TextWarning
              type="error"
              message={"当前表格没有主键或唯一索引, 为了确保数据不被误操作,不可以编辑该表格"}
            ></TextWarning>
          )}
        </div>
      </div>

      {/* 主体表格 */}
      <EditableTable
        ref={tableRef}
        fieldNames={fieldNames}
        fieldNamesUnique={[appState.uniqueFieldName]}
        dataArr={dataArr}
        onChange={onChange}
        editable={appState.uniqueFieldName !== ""}
        multiSelect={true}
      />

      {/* 确认要执行的变更语句 */}
      <ConfirmDialog
        open={showDialogAlter}
        title={`确认要保存变更吗?`}
        description={`请确认将要执行的语句:`}
        content={<SqlCodeViewer ddl={willExecCmd} />}
        cancelText={"取消"}
        cancelCb={() => {
          setShowDialogAlter(false);
        }}
        okText={"确定"}
        okCb={handleConfirm}
      />
    </>
  );
}
