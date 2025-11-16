import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CardSkeletonGrid() {
  return (
    <Card>
      <CardHeader className="flex flex-row gap-2 justify-between items-center p-3">
        <Skeleton className="size-16 aspect-square mb-0" />
        <div className="flex flex-col gap-2 w-full justify-center">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </CardHeader>
    </Card>
  );
}
