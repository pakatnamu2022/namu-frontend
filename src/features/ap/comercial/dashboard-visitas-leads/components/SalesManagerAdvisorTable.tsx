"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface SalesManagerAdvisorTableProps {
  advisors: AdvisorStats[];
  onAdvisorClick?: (workerId: number) => void;
}

export default function SalesManagerAdvisorTable({
  advisors,
  onAdvisorClick,
}: SalesManagerAdvisorTableProps) {
  // Sort by total visits descending
  const sortedAdvisors = [...advisors].sort(
    (a, b) => b.total_visits - a.total_visits
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CALIENTE":
        return "destructive";
      case "TEMPLADA":
        return "default";
      case "FRIO":
        return "secondary";
      default:
        return "outline";
    }
  };

  const renderMetricsBar = (advisor: AdvisorStats) => {
    const total = advisor.total_visits;
    if (total === 0) {
      return (
        <div className="text-xs text-muted-foreground">
          Sin datos
        </div>
      );
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{total} visitas</span>
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
                    className="bg-red-500 hover:bg-red-600 transition-all"
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
                  <div className="w-2 h-2 rounded-full bg-red-500" />
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
                  <span className="text-xs font-semibold">{advisor.attended} ({attendedPct.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-amber-500" />
                    <span className="text-xs">No Atendidos</span>
                  </div>
                  <span className="text-xs font-semibold">{advisor.not_attended} ({notAttendedPct.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-red-500" />
                    <span className="text-xs">Descartados</span>
                  </div>
                  <span className="text-xs font-semibold">{advisor.discarded} ({discardedPct.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2">
            <TableHead className="text-sm font-semibold">Asesor</TableHead>
            <TableHead className="text-sm font-semibold min-w-80">Métricas</TableHead>
            <TableHead className="text-center text-sm font-semibold">T. Promedio</TableHead>
            <TableHead className="text-sm font-semibold">Estados</TableHead>
            <TableHead className="text-center text-sm font-semibold w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAdvisors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                No hay datos disponibles
              </TableCell>
            </TableRow>
          ) : (
            sortedAdvisors.map((advisor) => (
              <TableRow key={advisor.worker_id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="py-4">
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm">{advisor.worker_name}</div>
                    <div className="text-xs text-muted-foreground">ID: {advisor.worker_id}</div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  {renderMetricsBar(advisor)}
                </TableCell>

                <TableCell className="text-center py-4">
                  <span className="text-sm text-muted-foreground">
                    {advisor.average_response_time}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(advisor.by_opportunity_status).length > 0 ? (
                      Object.entries(advisor.by_opportunity_status).map(
                        ([state, count]) =>
                          count > 0 && (
                            <Badge
                              key={`${advisor.worker_id}-${state}`}
                              variant={getStatusColor(state)}
                              className="text-xs font-normal"
                            >
                              {state}: {count as number}
                            </Badge>
                          )
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-center py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAdvisorClick?.(advisor.worker_id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
