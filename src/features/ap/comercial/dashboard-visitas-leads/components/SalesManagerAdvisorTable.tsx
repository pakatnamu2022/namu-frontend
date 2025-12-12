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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Rendimiento por Asesor</h3>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Asesor</TableHead>
                <TableHead className="text-center font-bold">
                  Total Visitas
                </TableHead>
                <TableHead className="text-center font-bold">
                  No Atendidos
                </TableHead>
                <TableHead className="text-center font-bold">
                  Atendidos
                </TableHead>
                <TableHead className="text-center font-bold">
                  Descartados
                </TableHead>
                <TableHead className="text-center font-bold">
                  % Atención
                </TableHead>
                <TableHead className="text-center font-bold">
                  Tiempo Promedio
                </TableHead>
                <TableHead className="font-bold">
                  Estados Oportunidad
                </TableHead>
                <TableHead className="text-center font-bold">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAdvisors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground"
                  >
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                sortedAdvisors.map((advisor) => (
                  <TableRow
                    key={advisor.worker_id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      <div className="font-semibold">
                        {advisor.worker_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {advisor.worker_id}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-bold text-lg">
                        {advisor.total_visits}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold text-yellow-600">
                        {advisor.not_attended}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {advisor.total_visits > 0
                          ? `${(
                              (advisor.not_attended / advisor.total_visits) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold text-green-600">
                        {advisor.attended}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {advisor.total_visits > 0
                          ? `${(
                              (advisor.attended / advisor.total_visits) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold text-red-600">
                        {advisor.discarded}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {advisor.total_visits > 0
                          ? `${(
                              (advisor.discarded / advisor.total_visits) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className={`font-bold ${
                          advisor.attention_percentage >= 50
                            ? "text-green-600"
                            : advisor.attention_percentage >= 25
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {advisor.attention_percentage.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium">
                        {advisor.average_response_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(advisor.by_opportunity_status).length >
                        0 ? (
                          Object.entries(advisor.by_opportunity_status).map(
                            ([state, count]) =>
                              count > 0 && (
                                <Badge
                                  key={`${advisor.worker_id}-${state}`}
                                  variant={getStatusColor(state)}
                                  className="text-xs"
                                >
                                  {state}: {count as number}
                                </Badge>
                              )
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Sin datos
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdvisorClick?.(advisor.worker_id)}
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
      </div>
    </div>
  );
}
