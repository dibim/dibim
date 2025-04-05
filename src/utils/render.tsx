import { ListRow } from "@/components/EditableTable";
import { RowData } from "@/types/types";

export function rawRow2EtRow(data: RowData[]) {
  const dataArrTemp: ListRow[] = [];
  data.map((row) => {
    const wrappedRow: ListRow = {};
    for (const key in row) {
      if (row.hasOwnProperty(key)) {
        wrappedRow[key] = {
          value: (row as any)[key],
          render: (val: any) => {
            if (val === null) return <div className="text-gray-500">NULL</div>;

            return <div>{val}</div>;
          },
        };
      }
    }

    dataArrTemp.push(wrappedRow);
  });

  return dataArrTemp;
}
