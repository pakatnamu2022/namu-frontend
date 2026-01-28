"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ChartLoadingSkeletonProps {
  type: "VISITA" | "LEADS";
}

export default function ChartLoadingSkeleton({
  type,
}: ChartLoadingSkeletonProps) {
  const typeLabel = type === "LEADS" ? "Leads" : "Visitas";

  return (
    <div className="space-y-6">
      <Card className="py-0">
        <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6!">
            <CardTitle>{typeLabel} por Fecha</CardTitle>
            <CardDescription>Cargando gráficos...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            Cargando...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
