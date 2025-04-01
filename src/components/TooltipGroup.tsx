"use client";

import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export interface TooltipSectionItem {
  trigger: ReactNode;
  content: ReactNode;
}

export interface TooltipSectionProp {
  dataArr: TooltipSectionItem[];
}

export function TooltipGroup({ dataArr: data }: TooltipSectionProp) {
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
