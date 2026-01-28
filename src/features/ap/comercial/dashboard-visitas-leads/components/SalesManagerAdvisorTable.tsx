"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdvisorStats } from "../lib/dashboard.interface";
import { Eye } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { useMemo } from "react";
import { getStatusColor } from "../../oportunidades/lib/opportunities.constants";

interface SalesManagerAdvisorTableProps {
  advisors: AdvisorStats[];
  type: "VISITA" | "LEADS";
  onAdvisorClick?: (workerId: number) => void;
}

const renderMetricsBar = (advisor: AdvisorStats, type: "VISITA" | "LEADS") => {
  const total = advisor.total_visits;
  if (total === 0) {
    return <div className="text-xs text-muted-foreground">Sin datos</div>;
  }

  const attendedPct = (advisor.attended / total) * 100;
  const notAttendedPct = (advisor.not_attended / total) * 100;
  const discardedPct = (advisor.discarded / total) * 100;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-2 cursor-pointer">
            {/* Header: Total y % Atención */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {total} {type === "VISITA" ? "visitas" : "leads"}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {advisor.average_response_time}
                </span>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  advisor.attention_percentage >= 50
                    ? "bg-green-100 text-green-700"
                    : advisor.attention_percentage >= 25
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {advisor.attention_percentage.toFixed(1)}% atención
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted/40">
              {advisor.attended > 0 && (
                <div
                  className="bg-green-500 hover:bg-green-600 transition-all"
                  style={{ width: `${attendedPct}%` }}
                />
              )}
              {advisor.not_attended > 0 && (
                <div
                  className="bg-amber-500 hover:bg-amber-600 transition-all"
                  style={{ width: `${notAttendedPct}%` }}
                />
              )}
              {advisor.discarded > 0 && (
                <div
                  className="bg-slate-500 hover:bg-slate-600 transition-all"
                  style={{ width: `${discardedPct}%` }}
                />
              )}
            </div>

            {/* Indicadores compactos */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{advisor.attended}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{advisor.not_attended}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                <span>{advisor.discarded}</span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-3">
          <div className="space-y-2">
            <div className="font-semibold text-sm border-b pb-2">
              Desglose de {total} visitas
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <span className="text-xs">Atendidos</span>
                </div>
                <span className="text-xs font-semibold">
                  {advisor.attended} ({attendedPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-500" />
                  <span className="text-xs">No Atendidos</span>
                </div>
                <span className="text-xs font-semibold">
                  {advisor.not_attended} ({notAttendedPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-slate-500" />
                  <span className="text-xs">Descartados</span>
                </div>
                <span className="text-xs font-semibold">
                  {advisor.discarded} ({discardedPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between gap-8 pt-2 border-t">
                <span className="text-xs">Tiempo promedio</span>
                <span className="text-xs font-semibold">
                  {advisor.average_response_time}
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function SalesManagerAdvisorTable({
  advisors,
  onAdvisorClick,
  type,
}: SalesManagerAdvisorTableProps) {
  const columns = useMemo<ColumnDef<AdvisorStats>[]>(
    () => [
      {
        accessorKey: "worker_name",
        header: "Asesor",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-medium text-sm">
              {row.original.worker_name}
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {row.original.worker_id}
            </div>
          </div>
        ),
      },
      {
        id: "metrics",
        header: "Métricas",
        cell: ({ row }) => renderMetricsBar(row.original, type),
      },
      {
        id: "states",
        header: "Estados",
        cell: ({ row }) => (
          <div className="flex flex-col flex-wrap gap-1.5">
            {Object.entries(row.original.by_opportunity_status).length > 0 ? (
              Object.entries(row.original.by_opportunity_status).map(
                ([state, count]) =>
                  count > 0 && (
                    <Badge
                      size="sm"
                      variant="outline"
                      key={`${row.original.worker_id}-${state}`}
                      color={getStatusColor(state)}
                      className="text-xs font-normal w-fit"
                    >
                      {state}: {count as number}
                    </Badge>
                  ),
              )
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAdvisorClick?.(row.original.worker_id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onAdvisorClick],
  );

  // Sort by total visits descending
  const sortedAdvisors = useMemo(
    () => [...advisors].sort((a, b) => b.total_visits - a.total_visits),
    [advisors],
  );

  return (
    <DataTable
      columns={columns}
      data={sortedAdvisors}
      isVisibleColumnFilter={false}
    />
  );
}
