import { ListRow } from "@/components/EditableTable";
import { RowData } from "@/types/types";

export function rawRow2EtRow(data: RowData[]) {
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

  return dataArrTemp;
}
