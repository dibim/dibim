import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ListChecks } from "lucide-react";
import { useSnapshot } from "valtio";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { getTab } from "@/context";
import { getTableData } from "@/databases/adapter,";
import { useActiveTabStore } from "@/hooks/useActiveTabStore";
import { addNotification, appState } from "@/store/valtio";
import { TableSection, TableSectionMethods } from "../TableSection";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function TableData() {
  const tab = getTab();
  if (tab === null) return <p>No tab found</p>;
  const store = tab.store;
  const snapTab = useSnapshot(store);

  const { t } = useTranslation();
  const snap = useSnapshot(appState);
  const tableRef = useRef<TableSectionMethods | null>(null);

  // ========== 多选字段 ==========
  const [checkedField, setCheckedField] = useState<string[]>(["*"]);

  function changeCheckedField(val: string, checked: boolean) {
    const prevVal = checkedField.filter((item) => item !== "*");
    let res = checked ? [...prevVal, val] : prevVal.filter((item) => item !== val);

    // 确保必须有一个唯一字段
    const pks = store.currentTableStructure.filter((item) => item.isPrimaryKey);
    const uks = store.currentTableStructure.filter((item) => item.isUniqueKey);
    let hasUk = false;
    pks.map((item) => {
      if (res.includes(item.name)) hasUk = true;

      if (!hasUk && !res.includes(item.name)) {
        res = [item.name, ...res];
        hasUk = true;
      }
    });
    uks.map((item) => {
      if (!hasUk && !res.includes(item.name)) {
        res = [item.name, ...res];
        hasUk = true;
      }
    });

    // TODO: 添加翻译
    addNotification("获取表格数据必须有一个主键字段或唯一约束字段, 已自动添加", "warning");

    setCheckedField(res);
  }

  const btnExt = [
    {
      trigger: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ListChecks />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault(); // 阻止默认行为
              }}
            >
              <Checkbox
                checked={checkedField.length === 1 && checkedField[0] === "*"}
                id="check-all"
                onCheckedChange={(checked) => {
                  setCheckedField(checked ? ["*"] : []);
                }}
              />
              <label
                htmlFor="check-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("Check all")} {/* TODO: 添加翻译 */}
              </label>
            </DropdownMenuItem>

            {snapTab.currentTableStructure.map((item, index) => (
              <DropdownMenuItem
                key={index}
                onSelect={(e) => {
                  e.preventDefault(); // 阻止默认行为
                }}
              >
                <Checkbox
                  checked={checkedField.includes(item.name)}
                  id={`${index}___${item}`}
                  onCheckedChange={(checked) => {
                    changeCheckedField(item.name, checked === true);
                  }}
                />
                <label
                  htmlFor={`${index}___${item}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.name}
                  {item.isPrimaryKey ? ` (${t("Primary key")})` : ""}
                  {item.isUniqueKey ? ` (${t("Unique key")})` : ""}
                </label>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      content: <p>{t("Select Fields")}</p>, // 这里不会触发, 在 trigger 里添加一个 Tooltip
    },
  ];

  // ========== 多选字段 结束 ==========

  const getData = async (page: number) => {
    if (store.currentTableName === "") {
      return [];
    }

    const res = await getTableData({
      tableName: store.currentTableName,
      currentPage: page,
      fields: checkedField,
      pageSize: DEFAULT_PAGE_SIZE,
      where: "",
    });

    if (res) {
      if (tableRef.current) {
        tableRef.current.setFieldNames(res.columnName);
        tableRef.current.setTableData(res.data);
        tableRef.current.setItemsTotal(res.itemsTotal);
        tableRef.current.setPageTotal(res.pageTotal);
      }

      return res.data;
    }

    return [];
  };

  async function initData() {
    await getData(1);
    tableRef.current?.setCurrentPage(1);
  }

  // 监听 store 的变化 | Monitor changes in the store
  useActiveTabStore(appState.activeTabId, "currentDbNme", (_val: any) => {
    setCheckedField(["*"]);
  });

  useEffect(() => {
    setCheckedField(["*"]);
  }, []);

  return (
    <TableSection
      ref={tableRef}
      width={`clac(100vw - ${snap.sideBarWidth + snap.listBarWidth + 40}px)`} // TODO: 临时减40px
      getData={getData}
      initData={initData}
      btnExt={btnExt}
    />
  );
}
