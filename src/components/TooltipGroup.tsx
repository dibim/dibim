import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export interface TooltipSectionItem {
  trigger: ReactNode;
  content: ReactNode;
}

export interface TooltipSectionProps {
  dataArr: TooltipSectionItem[];
}

export function TooltipGroup({ dataArr: data }: TooltipSectionProps) {
  return (
    <>
      {data.map((item, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>{item.trigger}</TooltipTrigger>
          <TooltipContent>{item.content}</TooltipContent>
        </Tooltip>
      ))}
    </>
  );
}
