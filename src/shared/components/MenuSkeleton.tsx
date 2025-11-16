import { Skeleton } from "@/components/ui/skeleton";

export default function MenuSkeleton() {
  return (
    <div className="w-full mx-auto flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full h-7" />
          <div className="pl-4 flex flex-col gap-1">
            <Skeleton className="w-full h-7" />
            <Skeleton className="w-full h-7" />
          </div>
        </div>
      ))}
    </div>
  );
}
