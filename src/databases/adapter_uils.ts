import { TableDataChange } from "@/components/EditableTable";
import { NEW_ROW_IS_ADDED_FIELD } from "@/constants";
import { getTab } from "@/context";
import { genDeleteRowsCmd, genInsertRowsCmd, genUpdateFieldCmd } from "./adapter,";
import { FieldWithValue, RowData } from "./types";

export function modifyTableData(
  deletedSet: Set<number>,
  changes: TableDataChange[],
  tableData: RowData[],
  addedRows: RowData[],
) {
  const sqls: string[] = [];

  const tab = getTab();
  if (tab === null) return sqls;
  const tbState = tab.state;

  const tbName = tbState.tableName;

  // 处理变更数据的行
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

  rowDataMap.forEach((changes, rowIndex) => {
    const uniqueField: FieldWithValue = {
      field: tbState.uniqueFieldName,
      value: tableData[rowIndex][tbState.uniqueFieldName],
    };
    const fieldArr: FieldWithValue[] = [];
    for (const c of changes) {
      fieldArr.push({
        field: c.field,
        value: c.new,
      });
    }

    if (fieldArr.length > 0) sqls.push(genUpdateFieldCmd(tbName, uniqueField, fieldArr));
  });

  // 处理删除行
  const arr = []; // 要删除的唯一字段(主键或唯一索引)的值
  for (let index = 0; index < tableData.length; index++) {
    const row = tableData[index];
    if (deletedSet.has(index)) {
      arr.push(row[tbState.uniqueFieldName]);
    }
  }
  if (arr.length > 0) sqls.push(genDeleteRowsCmd(tbName, tbState.uniqueFieldName, arr));

  // 处理新添加的行
  if (addedRows.length > 0) {
    const fieldNames = Object.keys(addedRows[0]).filter((item) => item !== NEW_ROW_IS_ADDED_FIELD);
    const values: any[][] = [];
    for (const r of addedRows) {
      values.push(fieldNames.map((item) => r[item].value));
    }

    sqls.push(genInsertRowsCmd(tbName, fieldNames, values));
  }

  return sqls;
}
