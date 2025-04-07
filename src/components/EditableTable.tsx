import { JSX, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SquareCheckBig } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { NEW_ROW_IS_ADDED_FIELD } from "@/constants";
import { cn } from "@/lib/utils";
import { getRandomNegativeInt } from "@/utils/number";

export interface ListCell {
  value: any;
  // 渲染 value 的函数, 可添加更复杂的控制
  // The function of rendering value can add more complex controls
  render: (val: any) => JSX.Element;
}

export interface ListRow {
  [key: string]: ListCell;
}

export interface TableDataChange {
  index: number; // 行的索引 | Index of rows
  field: string; // 字段名| Field name
  old: any; // 原先的值 | old value
  new: any; // 新的值 | new value
}

export type EditableTableMethods = {
  addChange: (val: TableDataChange) => void;
  deleteMultiSelectedRow: () => void;
  deleteRow: (val: number) => void;
  getAddedRow: () => ListRow[];
  getMultiDeleteData: () => Set<number>;
  getMultiSelectData: () => Set<number>;
  resetData: () => void;
  willRanderTable: () => void;
};

interface EditableTableProps {
  editable: boolean;
  multiSelect: boolean;
  fieldNames: string[];
  fieldNamesTitle?: string[];
  // 唯一的字段名(主键或唯一索引的)
  // Unique field name (primary key or unique index)
  fieldNamesUnique: string[];
  dataArr: ListRow[];
  height: string;
  width: string;
  onChange: (val: TableDataChange[]) => void;
  renderRowContextMenu?: (index: number, node: React.ReactNode) => React.ReactElement;
  showChanges?: boolean;
  ref?: React.Ref<EditableTableMethods>;
}

export function EditableTable({
  editable,
  fieldNames,
  fieldNamesTitle,
  multiSelect,
  fieldNamesUnique,
  dataArr,
  height,
  width,
  onChange,
  renderRowContextMenu,
  showChanges,
  ref,
}: EditableTableProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<ListRow[]>(dataArr);
  const [editingRowIdndex, setEditingRowIndex] = useState<number>(-1);
  const [editingFieldName, setEditingFieldName] = useState<string>("");
  const [tempValue, setTempValue] = useState<string>("");
  // 修改已有数据的变更记录, 不含添加和删除
  // Change logs for modifying existing data, excluding additions and deletions.
  const [changes, setChanges] = useState<TableDataChange[]>([]);

  function handleEditStart(rowIndex: number, fieldName: string, value: string) {
    setActiveIndex(rowIndex);
    setEditingRowIndex(rowIndex);
    setEditingFieldName(fieldName);
    setTempValue(value);
  }

  function handleEditSave(rowIndex: number, fieldName: string) {
    setData(
      data.map((item, index) =>
        index === rowIndex
          ? {
              ...item,
              [fieldName]: {
                ...item[fieldName],
                value: tempValue,
              },
            }
          : item,
      ),
    );
    setEditingRowIndex(-1);
    setEditingFieldName("");

    // 是新添加的行, 不记录修改
    // This line was added and is not tracked for modifications.
    if (data[rowIndex][NEW_ROW_IS_ADDED_FIELD]) {
      return;
    }

    const oldValue = getCellValue(data[rowIndex], fieldName);
    if (oldValue !== tempValue) {
      setChanges((prev) => [
        ...prev.filter((item) => !(item.index === rowIndex && item.field === fieldName)),
        { index: rowIndex, field: fieldName, old: oldValue, new: tempValue },
      ]);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTempValue(e.target.value);
  }

  // ========== 多选 | Multi-select =========
  const [deletedRowIndex, setDeletedRowIndex] = useState<Set<number>>(new Set());
  const [selectedRowIndex, setSelectedRowIndex] = useState<Set<number>>(new Set());

  function handleSelectRow(id: number) {
    const newSelectedRows = new Set(selectedRowIndex);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRowIndex(newSelectedRows);
  }
  // ========== 多选 结束 | Multi-select end =========

  // ========== 防止重新渲染滚动表格 | Prevent re-rendering of a scrolling table ==========
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLTableSectionElement | null>(null);
  const scrollPosRef = useRef(0);

  // 要触发修改表格重新渲染之前调用
  // Call this before modifying the table to trigger a re-render.
  function willRanderTable() {
    setActiveIndex(getRandomNegativeInt());
  }

  function handleClickRow(index: number) {
    if (!containerRef.current) return;

    scrollPosRef.current = containerRef.current.scrollTop;
    setActiveIndex(index);
  }

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.scrollTop = scrollPosRef.current;
  }, [activeIndex]);
  // ========== 防止重新渲染滚动表格 结束 | Prevent re-rendering of a scrolling table end ==========

  useImperativeHandle(ref, () => ({
    addChange: (val: TableDataChange) => setChanges([...changes, val]),
    deleteMultiSelectedRow: () => setDeletedRowIndex(selectedRowIndex),
    deleteRow: (val: number) => setDeletedRowIndex(new Set([...deletedRowIndex, val])),
    getAddedRow: () => data.filter((item) => item[NEW_ROW_IS_ADDED_FIELD]),
    getMultiDeleteData: () => deletedRowIndex,
    getMultiSelectData: () => selectedRowIndex,
    resetData: () => {
      setChanges([]);
      setDeletedRowIndex(new Set());
      setSelectedRowIndex(new Set());
    },
    willRanderTable,
  }));

  useEffect(() => {
    onChange(changes);
  }, [changes]);

  useEffect(() => {
    setData(dataArr);
  }, [dataArr]);
  useEffect(() => {
    setData(dataArr);
  }, []);

  function XTable({ className, ...props }: React.ComponentProps<"table">) {
    return (
      <div
        ref={containerRef}
        data-slot="table-container"
        className="relative table-body-scroll overflow-x-scroll overflow-y-scroll"
        style={{ height, width }}
      >
        <table data-slot="table" className={cn("caption-bottom text-sm", className)} {...props} />
      </div>
    );
  }

  function XTableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return <thead data-slot="table-header" className={cn("[&_tr]:border-b", "bg-accent", className)} {...props} />;
  }

  function renderHeader() {
    return (
      <XTableHeader>
        <TableRow>
          {multiSelect && (
            <TableHead>
              <SquareCheckBig />
            </TableHead>
          )}

          {fieldNamesTitle
            ? fieldNamesTitle.map((item, index) => <TableHead key={index}>{item}</TableHead>)
            : fieldNames.map((item, index) => <TableHead key={index}>{item}</TableHead>)}
        </TableRow>
      </XTableHeader>
    );
  }

  function renderCell(rowData: ListRow, field: string) {
    const cell = rowData[field as keyof ListRow];
    if (cell) return cell.render(cell.value);
    return <div></div>;
  }

  function getCellValue(rowData: ListRow, field: string) {
    const cell = rowData[field as keyof ListRow];
    if (cell) return cell.value;
    return "";
  }

  function renderBody() {
    function genClassName(index: number) {
      if (deletedRowIndex.has(index)) return " bg-[var(--fvm-danger-clr)]";
      if (selectedRowIndex.has(index)) return "text-[var(--fvm-primary-clr)] font-bold";
      return "";
    }

    return data.map((rowData, rowIndex) => {
      const node = (
        <TableRow key={rowIndex} className={genClassName(rowIndex)} onClick={() => handleClickRow(rowIndex)}>
          {multiSelect && (
            <TableCell
              className="text-[var(--fvm-info-clr)] cursor-grab"
              onClick={() => {
                handleSelectRow(rowIndex);
              }}
            >
              {selectedRowIndex.has(rowIndex) ? <span>🔵</span> : <span>🔘</span>}
            </TableCell>
          )}

          {fieldNames.map((field, index) => (
            <TableCell
              key={index}
              onClick={() => {
                handleEditStart(rowIndex, fieldNames[index], getCellValue(rowData, field));
              }}
            >
              {editable && editingRowIdndex === rowIndex && editingFieldName === fieldNames[index] ? (
                <Input
                  value={tempValue}
                  onChange={handleInputChange}
                  autoFocus
                  onBlur={() => handleEditSave(rowIndex, editingFieldName)}
                  onKeyDown={(e) => e.key === "Enter" && handleEditSave(rowIndex, editingFieldName)}
                />
              ) : (
                renderCell(rowData, field)
              )}
            </TableCell>
          ))}
        </TableRow>
      );

      if (renderRowContextMenu) return renderRowContextMenu(rowIndex, node);

      return node;
    });
  }

  return (
    <>
      {fieldNamesUnique.length === 0 && <p>{t("&notUniqueKeyTip")}</p>}
      {dataArr.length > 0 && (
        <XTable>
          {renderHeader()}
          <TableBody>{renderBody()}</TableBody>
        </XTable>
      )}

      {/* 显示修改记录 */}
      {showChanges && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">修改记录</h2>
          {Object.keys(changes).length > 0 ? (
            <XTable>
              <XTableHeader>
                <TableRow>
                  <TableCell>行索引</TableCell>
                  <TableCell>字段名</TableCell>
                  <TableCell>修改前</TableCell>
                  <TableCell>修改后</TableCell>
                </TableRow>
              </XTableHeader>
              <TableBody>
                {Object.entries(changes).map(([key, change]) => {
                  return (
                    <TableRow key={key}>
                      <TableCell>{change.index}</TableCell>
                      <TableCell>{change.field}</TableCell>
                      <TableCell>{change.old?.toString()}</TableCell>
                      <TableCell>{change.new?.toString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </XTable>
          ) : (
            <p>暂无数据</p>
          )}
        </div>
      )}
    </>
  );
}
