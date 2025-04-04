import { Skeleton } from "./ui/skeleton";

export function EmptyList() {
  return (
    <div className="py-4">
      <Skeleton className="h-4 w-[150px]" />
      <Skeleton className="h-4 w-[100px]" />
    </div>
  );
}
