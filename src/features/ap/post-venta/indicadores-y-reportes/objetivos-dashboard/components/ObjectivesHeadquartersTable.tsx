"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/DataTable";
import { HeadquarterSummary } from "../lib/objectivesDashboard.interface";
import { objectivesHeadquartersColumns } from "./ObjectivesHeadquartersColumns";
import {
  OBJECTIVE_STATUS_BADGE_COLOR,
  OBJECTIVE_STATUS_LABEL,
} from "../lib/objectivesDashboard.constants";

interface ObjectivesHeadquartersTableProps {
  data: HeadquarterSummary[];
  onSedeClick: (sede: HeadquarterSummary) => void;
}

const formatCurrency = (value: number) =>
  `S/ ${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;

export default function ObjectivesHeadquartersTable({
  data,
  onSedeClick,
}: ObjectivesHeadquartersTableProps) {
  const columns = useMemo(
    () => objectivesHeadquartersColumns({ onRowClick: onSedeClick }),
    [onSedeClick],
  );

  const mobileCardRender = (sede: HeadquarterSummary) => (
    <Card
      onClick={() => onSedeClick(sede)}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:bg-muted/70",
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">
              #{sede.rank} · {sede.name}
            </div>
            <div className="text-xs text-muted-foreground">{sede.abbreviation}</div>
          </div>
          <Badge color={OBJECTIVE_STATUS_BADGE_COLOR[sede.status]}>
            {OBJECTIVE_STATUS_LABEL[sede.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Objetivo</div>
            <div className="font-semibold">{formatCurrency(sede.total_objective)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avance</div>
            <div className="font-semibold">{formatCurrency(sede.total_progress)}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Cumplimiento</span>
            <span className="font-semibold">{sede.completion_percentage}%</span>
          </div>
          <Progress value={Math.min(sede.completion_percentage, 100)} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Ranking por Sede</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          variant="simple"
          isVisibleColumnFilter={false}
          mobileCardRender={mobileCardRender}
          className="[&_tbody_tr]:cursor-pointer [&_tbody_tr]:transition-all [&_tbody_tr]:duration-200"
        />
      </CardContent>
    </Card>
  );
}
