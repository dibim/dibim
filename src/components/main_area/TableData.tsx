import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ListChecks } from "lucide-react";
import { useSnapshot } from "valtio";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { getTab } from "@/context";
import { getTableData } from "@/databases/adapter,";
import { getDefultOrderField } from "@/databases/utils";
import { useActiveTabStore } from "@/hooks/useActiveTabStore";
import { addNotification, coreState } from "@/store/core";
import { TableSection, TableSectionMethods } from "../TableSection";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

const ALL_FIELD = ["*"];

export function TableData() {
  const tab = getTab();
  if (tab === null) return <p>No tab found</p>;
  const tabState = tab.state;
  const snapTab = useSnapshot(tabState);

  const { t } = useTranslation();
  const snapCore = useSnapshot(coreState);
  const tableRef = useRef<TableSectionMethods | null>(null);

  // ========== 多选字段 ==========
  const [checkedField, setCheckedField] = useState<string[]>(ALL_FIELD);

  function changeCheckedField(val: string, checked: boolean) {
    const prevVal = checkedField.filter((item) => item !== "*");
    let res = checked ? [...prevVal, val] : prevVal.filter((item) => item !== val);

    // 确保必须有一个唯一字段
    const pks = tabState.tableStructure.filter((item) => item.isPrimaryKey);
    const uks = tabState.tableStructure.filter((item) => item.isUniqueKey);
    let hasUk = false;
    pks.map((item) => {
      if (res.includes(item.name)) hasUk = true;

      if (!hasUk && !res.includes(item.name)) {
        res = [item.name, ...res];
        addNotification(t("&checkUniqueTip"), "warning");
        hasUk = true;
      }
    });
    uks.map((item) => {
      if (!hasUk && !res.includes(item.name)) {
        res = [item.name, ...res];
        addNotification(t("&checkUniqueTip"), "warning");
        hasUk = true;
      }
    });

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
                {t("Check all")}
              </label>
            </DropdownMenuItem>

            {snapTab.tableStructure.map((item, index) => (
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

  /**
   *获取数据
   *
   * @param {number} page 要获取的数据的页码
   * @param {boolean} [isInit] 如果为 true, 使用初始值获取
   * @return {*}
   */
  async function getData(page: number, isInit?: boolean) {
    if (tabState.tableName === "") {
      return [];
    }

    const sortField = getDefultOrderField(tabState.tableStructure);
    const res = await getTableData({
      tableName: tabState.tableName,
      currentPage: page,
      fields: isInit ? ALL_FIELD : checkedField,
      pageSize: DEFAULT_PAGE_SIZE,
      where: "",
      sortField: [{ fieldName: sortField, direction: "ASC" }],
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
  }

  async function initData(isInit?: boolean) {
    await getData(1, isInit);
    tableRef.current?.setCurrentPage(1);
  }

  // 监听 store 的变化 | Monitor changes in the store
  useActiveTabStore(coreState.activeTabId, "dbNme", (_val: any) => {
    setCheckedField(["*"]);
  });

  useEffect(() => {
    setCheckedField(["*"]);
  }, []);

  return (
    <TableSection
      ref={tableRef}
      width={`clac(100vw - ${snapCore.sideBarWidth + snapCore.listBarWidth + 40}px)`} // TODO: 临时减40px
      getData={getData}
      initData={initData}
      btnExt={btnExt}
    />
  );
}
