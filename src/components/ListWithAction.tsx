import * as React from "react";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isPcScreen } from "@/utils/ media_query";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./ui/context-menu";

export interface ListItemItem {
  label: string;
  className?: string;
  onClick: (item: ListItem) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  isLine?: boolean; // 是分割线
}

export interface ListItem {
  id: string;
  content: React.ReactNode; // 主内容显示
  contentOnClick: (item: ListItem) => void;
  menuItems: ListItemItem[];
}

const STR_BTN = "button";
const STR_RC = "rightClick";

interface ReusableDropdownListProps {
  items: ListItem[];
  className?: string;
  menuAlign?: "start" | "center" | "end";
  itemClassName?: string;
  menuItemClassName?: string;
  triggerMethod?: typeof STR_BTN | typeof STR_RC; // 操作按钮的触发方式, 按钮或者右击, 或者留空自动判断
}

export function ListWithAction({
  items,
  className = "",
  menuAlign = "end",
  itemClassName = "",
  menuItemClassName = "",
  triggerMethod,
}: ReusableDropdownListProps) {
  if (!triggerMethod) {
    triggerMethod = isPcScreen() ? STR_RC : STR_BTN;
  }
  return (
    <div className={`${className}`}>
      {/* 按钮触发 */}
      {triggerMethod === STR_BTN &&
        items.map((item) => (
          <DropdownMenu key={item.id}>
            <div className={`flex items-center justify-between`}>
              <div
                className={`flex-1 ${itemClassName}`}
                onClick={() => {
                  item.contentOnClick(item);
                }}
              >
                {item.content}
              </div>

              <DropdownMenuTrigger asChild>
                <EllipsisVertical />
              </DropdownMenuTrigger>
            </div>

            <DropdownMenuContent align={menuAlign}>
              {item.menuItems.map((menuItem, index) => {
                return menuItem.isLine ? (
                  <hr className="my-2" key={index} />
                ) : (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => {
                      menuItem.onClick(item);
                    }}
                    disabled={menuItem.disabled}
                    className={`flex items-center gap-2 ${menuItemClassName} ${menuItem.className || ""}`}
                  >
                    {menuItem.icon && <span>{menuItem.icon}</span>}
                    {menuItem.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

      {/* 右击触发 */}
      {triggerMethod === STR_RC &&
        items.map((item) => (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger asChild>
              <div
                className={`${itemClassName}`}
                onClick={() => {
                  item.contentOnClick(item);
                }}
              >
                {item.content}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {item.menuItems.map((menuItem, index) => {
                return menuItem.isLine ? (
                  <hr className="my-2" key={index} />
                ) : (
                  <ContextMenuItem
                    className={menuItem.className || ""}
                    key={index}
                    onClick={() => {
                      menuItem.onClick(item);
                    }}
                  >
                    {menuItem.icon && <span>{menuItem.icon}</span>}
                    {menuItem.label}
                  </ContextMenuItem>
                );
              })}
            </ContextMenuContent>
          </ContextMenu>
        ))}
    </div>
  );
}
