import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 定义选项的类型
export interface SelectOption {
  value: string;
  label: string;
  group?: string; // 用于分组的可选字段
}

// 定义组件的 props 类型
interface SearchableSelectProps {
  value: string;
  optionsData: SelectOption[];
  onChange: (val: string) => void;
}

export function SearchableSelect({ value, optionsData, onChange }: SearchableSelectProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 根据搜索查询过滤选项，同时保留分组信息
  const filteredOptionsMap = optionsData.reduce(
    (map, option) => {
      if (option.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        if (!map[option.group || "ungrouped"]) {
          map[option.group || "ungrouped"] = [];
        }

        map[option.group || "ungrouped"].push(option);
      }

      return map;
    },
    {} as Record<string, SelectOption[]>,
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>

      <SelectContent>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full p-2 border-b"
        />

        {Object.entries(filteredOptionsMap).map(([group, options]) => (
          <SelectGroup key={group}>
            {group !== "ungrouped" && <SelectLabel>{group}</SelectLabel>}

            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
