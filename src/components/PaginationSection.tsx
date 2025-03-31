"use client";

import { useEffect, useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "./ui/x_pagination";

export interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageTotal: number;
  itemsTotal: number;
  getData: (page: number) => Promise<any>;
}
export function PaginationSection({ currentPage, setCurrentPage, pageTotal, itemsTotal, getData }: PaginationProps) {
  const [inputedPage, setInputedPage] = useState<number>(1); // 输入的页码

  const firstPage = () => {
    let page = 1;
    getData(page);
    setCurrentPage(page);
  };

  const lastPage = () => {
    let page = pageTotal;
    getData(page);
    setCurrentPage(page);
  };

  const prevPage = () => {
    let page = currentPage - 1;
    if (page > 0) {
      getData(page);
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    let page = currentPage + 1;
    if (page <= pageTotal) {
      getData(page);
      setCurrentPage(page);
    }
  };

  const goToPage = () => {
    let page = inputedPage;
    if (page <= 0) page = 1;
    if (page > pageTotal) page = pageTotal;

    getData(page);
    setCurrentPage(page);
  };

  // 输入框里的页面跟随当前页码变化
  useEffect(() => {
    setInputedPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    getData(currentPage);
  }, []);

  return (
    <div className="flex">
      <Pagination className="flex-1 justify-start px-8">
        <PaginationContent>
          <PaginationItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <PaginationFirst className="!px-1" href="#" text={""} onClick={() => firstPage()} />
              </TooltipTrigger>
              <TooltipContent>
                <p>第一页</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>
          <PaginationItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <PaginationPrevious className="!px-1" href="#" text={""} onClick={() => prevPage()} />
              </TooltipTrigger>
              <TooltipContent>
                <p>上一页</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>
          <PaginationItem className="flex">
            <div className="pe-2 w-20">
              <Input
                value={inputedPage}
                onChange={(e) => {
                  try {
                    setInputedPage(parseInt(e.target.value));
                  } catch (error) {
                    console.log("解析要跳转额页码出错: ", error);
                  }
                }}
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center pe-4">
                  <CornerDownLeft onClick={goToPage} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>跳转到第{inputedPage}页</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>
          <PaginationItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <PaginationNext className="!px-1" href="#" text={""} onClick={() => nextPage()} />
              </TooltipTrigger>
              <TooltipContent>
                <p>下一页</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>
          <PaginationItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <PaginationLast className="!px-1" href="#" text={""} onClick={() => lastPage()} />
              </TooltipTrigger>
              <TooltipContent>
                <p>最后一页</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="text-muted-foreground">
        {pageTotal} <strong>页</strong> {itemsTotal} 行
      </div>
    </div>
  );
}
