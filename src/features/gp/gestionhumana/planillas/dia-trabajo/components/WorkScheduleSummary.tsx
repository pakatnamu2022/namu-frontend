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
import {
  WorkScheduleWorkerSummary,
  WorkScheduleSummaryPeriod,
} from "../lib/work-schedule.interface";
import { DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkScheduleSummaryProps {
  period?: WorkScheduleSummaryPeriod;
  summary: WorkScheduleWorkerSummary[];
  workersCount: number;
  isLoading?: boolean;
  selectedWorkerId?: number;
  onWorkerSelect?: (workerId: number) => void;
}

export function WorkScheduleSummary({
  period,
  summary,
  workersCount,
  isLoading = false,
  selectedWorkerId,
  onWorkerSelect,
}: WorkScheduleSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Resumen del Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPlanilla = summary.reduce((acc, w) => acc + w.total_amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            Resumen del Período
          </CardTitle>
          {period && (
            <Badge variant="outline" className="text-xs">
              {period.name}
            </Badge>
          )}
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {workersCount} trabajadores
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Trabajador</TableHead>
                <TableHead className="text-right">Sueldo</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-6"
                  >
                    Sin registros en este período
                  </TableCell>
                </TableRow>
              )}

              {summary.map((worker) => (
                <TableRow
                  key={worker.worker_id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedWorkerId === worker.worker_id ? "bg-primary/10" : ""
                  }`}
                  onClick={() => onWorkerSelect?.(worker.worker_id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {selectedWorkerId === worker.worker_id && (
                        <div className="w-1 h-6 bg-primary rounded-full shrink-0" />
                      )}
                      <span className="truncate text-sm">
                        {worker.worker_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    S/ {worker.salary.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    <span
                      className={
                        worker.total_amount >= 0
                          ? "text-green-700"
                          : "text-red-600"
                      }
                    >
                      S/ {worker.total_amount.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}

              {summary.length > 1 && (
                <TableRow className="bg-muted/50 font-semibold border-t-2">
                  <TableCell className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> Total planilla
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right">
                    S/ {totalPlanilla.toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
