"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableData {
  fieldNames: string[]; // 字段名
  fieldNamesUnique: string[]; // 是唯一的字段名
  dataArr: object[]; // 每行的数据
  onChange: (val: TableDataChange[]) => void;
  showChanges?: boolean;
}

// 修改表格的数据
export interface TableDataChange {
  index: number; // 行的索引
  field: string; // 字段名
  old: any; // 原先的值
  new: any; // 新的值
}

export function EditableTable({ fieldNames, fieldNamesUnique, dataArr, onChange, showChanges }: TableData) {
  // 状态管理
  const [data, setData] = useState<object[]>(dataArr);
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
          {fieldNames.map((item, index) => (
            <TableHead key={index}>{item}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
    );
  }

  function renderCell(rowIndex: number, rowData: object) {
    return (
      <>
        {fieldNames.map((item, index) => (
          <TableCell key={index} onClick={() => handleEditStart(rowIndex, fieldNames[index], (rowData as any)[item])}>
            {editingRowIdndex === rowIndex && editingFieldName === fieldNames[index] ? (
              <Input
                value={tempValue}
                onChange={handleInputChange}
                autoFocus
                onBlur={() => handleEditSave(rowIndex, editingFieldName)}
                onKeyDown={(e) => e.key === "Enter" && handleEditSave(rowIndex, editingFieldName)}
              />
            ) : (
              (rowData as any)[item]
            )}
          </TableCell>
        ))}
      </>
    );
  }

  return (
    <div className="p-4">
      {fieldNamesUnique.length === 0 && <p>由于无主键或唯一索引, 为了确保数据不被错误地修改, 该表格不能编辑</p>}
      <Table>
        {renderHeader()}
        <TableBody>
          {data.map((item, index) => (
            // TODO: 删除行要重新获取数据, 这里使用index没有问题
            <TableRow key={index}>{renderCell(index, item)}</TableRow>
          ))}
        </TableBody>
      </Table>

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
