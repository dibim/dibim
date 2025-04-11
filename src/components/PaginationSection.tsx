import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [inputedPage, setInputedPage] = useState<number>(1);

  const firstPage = () => {
    getData(1);
    setCurrentPage(1);
  };

  const lastPage = () => {
    getData(pageTotal);
    setCurrentPage(pageTotal);
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      goToPage();
    }
  };

  // 输入框里的页面跟随当前页码变化
  // The page in the input box changes with the current page number
  useEffect(() => {
    setInputedPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    getData(currentPage);
  }, []);

  return (
    <div className="flex items-center">
      <Pagination className="flex-1 justify-start px-8">
        <PaginationContent>
          <PaginationItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <PaginationFirst className="!px-1" href="#" text={""} onClick={() => firstPage()} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("First page")}</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>
          <PaginationItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <PaginationPrevious className="!px-1" href="#" text={""} onClick={() => prevPage()} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("Previous page")}</p>
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
                onKeyDown={handleKeyDown}
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center pe-4">
                  <CornerDownLeft onClick={goToPage} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("&Go to page", { page: inputedPage })}</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>
          <PaginationItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <PaginationNext className="!px-1" href="#" text={""} onClick={() => nextPage()} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("Next page")}</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>
          <PaginationItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <PaginationLast className="!px-1" href="#" text={""} onClick={() => lastPage()} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("Last page")}</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="text-muted-foreground">{t("&pageCounter", { pageTotal, itemsTotal })}</div>
    </div>
  );
}
