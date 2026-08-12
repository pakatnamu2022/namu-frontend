"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaProgress } from "../lib/objectivesDashboard.interface";
import {
  OBJECTIVE_STATUS_BADGE_COLOR,
  OBJECTIVE_STATUS_LABEL,
} from "../lib/objectivesDashboard.constants";

interface ObjectivesAreaOverviewProps {
  area: AreaProgress;
  unit?: "currency" | "count";
}

const formatValue = (value: number, unit: "currency" | "count") =>
  unit === "currency"
    ? `S/ ${value.toLocaleString("es-PE")}`
    : value.toLocaleString("es-PE");

export default function ObjectivesAreaOverview({
  area,
  unit = "currency",
}: ObjectivesAreaOverviewProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Objetivo</p>
            <p className="text-lg font-semibold">{formatValue(area.objective, unit)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avance</p>
            <p className="text-lg font-semibold text-primary">
              {formatValue(area.progress, unit)}
            </p>
          </div>
          <Badge color={OBJECTIVE_STATUS_BADGE_COLOR[area.status]}>
            {OBJECTIVE_STATUS_LABEL[area.status]}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Cumplimiento</span>
            <span className="font-semibold text-foreground">
              {area.completion_percentage}%
            </span>
          </div>
          <Progress value={Math.min(area.completion_percentage, 100)} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
