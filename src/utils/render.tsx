import { ListRow } from "@/components/EditableTable";
import { Null } from "@/components/Null";
import { RowData } from "@/databases/types";

export function rawRow2EtRow(data: RowData[]) {
  const dataArrTemp: ListRow[] = [];
  data.map((row) => {
    const wrappedRow: ListRow = {};
    for (const key in row) {
      if (row.hasOwnProperty(key)) {
        wrappedRow[key] = {
          value: (row as any)[key],
          render: (val: any) => {
            if (val === null) return <Null />;

            return <div>{val}</div>;
          },
        };
      }
    }

    dataArrTemp.push(wrappedRow);
  });

  return dataArrTemp;
}
