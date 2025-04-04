import { Skeleton } from "./ui/skeleton";

export function EmptyList() {
  return (
    <div className="py-4">
      <Skeleton className="h-4 w-[180px] m-2" />
      <Skeleton className="h-4 w-[150px] m-2" />
      <Skeleton className="h-4 w-[100px] m-2" />
      <Skeleton className="h-4 w-[160px] m-2" />
    </div>
  );
}
