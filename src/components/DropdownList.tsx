import * as React from "react";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ListItem {
  id: string | number;
  content: React.ReactNode; // 主内容显示
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
            {item.content}

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
