"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkshopDetail } from "../lib/objectivesDashboard.interface";
import { OBJECTIVE_STATUS_BADGE_COLOR } from "../lib/objectivesDashboard.constants";
import ObjectivesAreaOverview from "./ObjectivesAreaOverview";

interface ObjectivesWorkshopDetailProps {
  workshop: WorkshopDetail;
}

export default function ObjectivesWorkshopDetail({
  workshop,
}: ObjectivesWorkshopDetailProps) {
  return (
    <div className="space-y-4">
      <ObjectivesAreaOverview area={workshop} unit="currency" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {workshop.by_concept.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Por Concepto</CardTitle>
              <CardDescription>Distribución del avance facturado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workshop.by_concept.map((concept) => (
                <div key={concept.concept_id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{concept.concept_name}</span>
                    <span className="text-muted-foreground">
                      S/ {concept.progress.toLocaleString("es-PE")} ·{" "}
                      {concept.percentage_of_total}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min(concept.percentage_of_total, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {workshop.by_brand.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Por Marca</CardTitle>
              <CardDescription>Facturación por marca de vehículo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workshop.by_brand.map((brand) => (
                <div key={brand.brand_name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{brand.brand_name}</span>
                    <span className="text-muted-foreground">
                      S/ {brand.total_billing.toLocaleString("es-PE")} ·{" "}
                      {brand.vehicle_count} veh.
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(brand.percentage_of_total, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {workshop.top_advisors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Asesores</CardTitle>
            <CardDescription>Ranking de cumplimiento individual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {workshop.top_advisors.map((advisor) => (
              <div
                key={advisor.advisor_id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border p-3",
                  advisor.rank === 1 && "border-amber-300 bg-amber-50 dark:bg-amber-950/30",
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {advisor.rank === 1 ? (
                    <Trophy className="size-4 text-amber-500 shrink-0" />
                  ) : (
                    <span className="text-xs text-muted-foreground w-4 text-center shrink-0">
                      {advisor.rank}
                    </span>
                  )}
                  <span className="font-medium truncate">{advisor.advisor_name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    S/ {advisor.progress.toLocaleString("es-PE")} / S/{" "}
                    {advisor.objective.toLocaleString("es-PE")}
                  </span>
                  <Badge color={OBJECTIVE_STATUS_BADGE_COLOR[advisor.status]}>
                    {advisor.completion_percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
