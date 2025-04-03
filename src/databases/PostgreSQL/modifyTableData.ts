import { TableDataChange } from "@/components/EditableTable";
import { appState } from "@/store/valtio";
import { RowData } from "@/types/types";
import { genDeleteRowsCmd, genUpdateFieldCmd } from "../adapter,";
import { FieldWithValue } from "../types";

export function modifyTableData(deletedSet: Set<number>, changes: TableDataChange[], tableData: RowData[]) {
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

  return sqls;
}
