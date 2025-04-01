"use client";

import { ReactNode, useEffect, useImperativeHandle, useState } from "react";
import { SquareCheckBig } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface ListItem {
  [key: string]: ReactNode;
}

// 修改表格的数据
export interface TableDataChange {
  index: number; // 行的索引
  field: string; // 字段名
  old: any; // 原先的值
  new: any; // 新的值
}

export type EditableTableMethods = {
  getMultiSelectData: () => Set<number>;
  resetMultiSelectData: () => void;
  deleteMultiSelectedRow: () => void;
};

interface EditableTableProps {
  editable: boolean; // 是否可编辑
  multiSelect: boolean; // 是否可编辑
  fieldNames: string[]; // 字段名
  fieldNamesTitle?: string[]; // 字段名的标题
  fieldNamesUnique: string[]; // 是唯一的字段名
  dataArr: ListItem[]; // 每行的数据
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
  onChange,
  renderRowContextMenu,
  showChanges,
  ref,
}: EditableTableProps) {
  const [data, setData] = useState<ListItem[]>(dataArr);
  const [editingRowIdndex, setEditingRowIndex] = useState<number>(-1); // 正在编辑的索引
  const [editingFieldName, setEditingFieldName] = useState<string>(""); // 正在编辑的字段名
  const [tempValue, setTempValue] = useState<string>("");
  const [changes, setChanges] = useState<TableDataChange[]>([]); // 记录所有修改的变量

  // 开始编辑
  function handleEditStart(indrowIndex: number, fieldName: string, value: string) {
    setEditingRowIndex(indrowIndex);
    setEditingFieldName(fieldName);
    setTempValue(value);
  }

  // 保存编辑
  function handleEditSave(rowIndex: number, fieldName: string) {
    setData(data.map((item, index) => (index === rowIndex ? { ...item, [fieldName]: tempValue } : item)));
    setEditingRowIndex(-1);
    setEditingFieldName("");

    // 记录修改
    const oldValue = (data[rowIndex] as any)[fieldName];
    if (oldValue !== tempValue) {
      setChanges((prev) => [
        ...prev.filter((item) => !(item.index === rowIndex && item.field === fieldName)), // 去重
        { index: rowIndex, field: fieldName, old: oldValue, new: tempValue },
      ]);
    }
  }

  // 处理输入变化
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTempValue(e.target.value);
  }

  // ========== 多选 =========
  const [deletedFieldIndex, setDeletedFieldIndex] = useState<Set<number>>(new Set()); // 删除的字段的索引
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<Set<number>>(new Set()); // 选中的字段的索引

  // 选中行, 删除的时候使用
  function handleSelectRow(id: number) {
    const newSelectedRows = new Set(selectedFieldIndex);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedFieldIndex(newSelectedRows);
  }
  // ========== 多选 =========

  useImperativeHandle(ref, () => ({
    getMultiSelectData: () => selectedFieldIndex,
    resetMultiSelectData: () => {
      setDeletedFieldIndex(new Set());
      setSelectedFieldIndex(new Set());
    },
    deleteMultiSelectedRow: () => {
      setDeletedFieldIndex(selectedFieldIndex);
    },
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

  function renderHeader() {
    return (
      <TableHeader>
        <TableRow>
          {/* 多选触发器 */}
          {multiSelect && (
            <TableHead>
              <SquareCheckBig />
            </TableHead>
          )}
          {/* 正常表头 */}
          {fieldNamesTitle
            ? fieldNamesTitle.map((item, index) => <TableHead key={index}>{item}</TableHead>)
            : fieldNames.map((item, index) => <TableHead key={index}>{item}</TableHead>)}
        </TableRow>
      </TableHeader>
    );
  }

  function renderBody() {
    function genClassName(index: number) {
      // 删除的样式
      if (deletedFieldIndex.has(index)) return " bg-[var(--fvm-danger-clr)]";
      // 选中的样式
      if (selectedFieldIndex.has(index)) return "text-[var(--fvm-primary-clr)] font-bold";
      return "";
    }

    return data.map((rowData, rowIndex) => {
      const node = (
        <TableRow key={rowIndex} className={genClassName(rowIndex)}>
          {/* 多选触发器 */}
          {multiSelect && (
            <TableCell
              className="text-[var(--fvm-info-clr)] cursor-grab"
              onClick={() => {
                handleSelectRow(rowIndex);
              }}
            >
              {selectedFieldIndex.has(rowIndex) ? <span>🔵</span> : <span>🔘</span>}
            </TableCell>
          )}
          {/* 正常数据 */}
          {fieldNames.map((field, index) => (
            <TableCell
              key={index}
              onClick={() => handleEditStart(rowIndex, fieldNames[index], (rowData as any)[field])}
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
                (rowData as any)[field]
              )}
            </TableCell>
          ))}
        </TableRow>
      );

      if (renderRowContextMenu) {
        renderRowContextMenu(rowIndex, node);
      }
      return node;
    });
  }

  return (
    <div className="p-4">
      {fieldNamesUnique.length === 0 && <p>由于无主键或唯一索引, 为了确保数据不被错误地修改, 该表格不能编辑</p>}
      {dataArr.length > 0 && (
        <Table>
          {renderHeader()}
          <TableBody>{renderBody()}</TableBody>
        </Table>
      )}

      {/* 显示修改记录 */}
      {showChanges && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">修改记录</h2>
          {Object.keys(changes).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>行索引</TableCell>
                  <TableCell>字段名</TableCell>
                  <TableCell>修改前</TableCell>
                  <TableCell>修改后</TableCell>
                </TableRow>
              </TableHeader>
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
            </Table>
          ) : (
            <p>暂无数据</p>
          )}
        </div>
      )}
    </div>
  );
}
