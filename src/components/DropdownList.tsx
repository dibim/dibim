import * as React from "react";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ListItem {
  id: string;
  content: React.ReactNode; // 主内容显示
  contentOnClick: (tableName: string) => void;
  menuItems: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
}

interface ReusableDropdownListProps {
  items: ListItem[];
  menuAlign?: "start" | "center" | "end";
  itemClassName?: string;
  menuItemClassName?: string;
}

export function DropdownList({
  items,
  menuAlign = "end",
  itemClassName = "",
  menuItemClassName = "",
}: ReusableDropdownListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <DropdownMenu key={item.id}>
          <div className={`flex items-center justify-between ${itemClassName}`}>
            <div
              className="flex-1"
              onClick={() => {
                item.contentOnClick(item.id);
              }}
            >
              {item.content}
            </div>

            <DropdownMenuTrigger asChild>
              <EllipsisVertical />
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent align={menuAlign}>
            {item.menuItems.map((menuItem, index) => (
              <DropdownMenuItem
                key={index}
                onClick={menuItem.onClick}
                disabled={menuItem.disabled}
                className={`flex items-center gap-2 ${menuItemClassName}`}
              >
                {menuItem.icon && <span>{menuItem.icon}</span>}
                {menuItem.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
}
