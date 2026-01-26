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
import { WorkScheduleWorkerSummary, WorkScheduleSummaryPeriod } from "../lib/work-schedule.interface";
import { Clock, Sun, Moon, Calendar, Users } from "lucide-react";
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

  const totals = summary.reduce(
    (acc, worker) => ({
      normal: acc.normal + worker.total_normal_hours,
      extra: acc.extra + worker.total_extra_hours,
      night: acc.night + worker.total_night_hours,
      holiday: acc.holiday + worker.total_holiday_hours,
      days: acc.days + worker.days_worked,
    }),
    { normal: 0, extra: 0, night: 0, holiday: 0, days: 0 }
  );

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
                <TableHead className="min-w-[200px]">Trabajador</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Sun className="h-3 w-3" />
                    <span>Normal</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Extra</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Moon className="h-3 w-3" />
                    <span>Nocturno</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Feriado</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">Días</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map((worker) => (
                <TableRow
                  key={worker.worker_id}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    selectedWorkerId === worker.worker_id ? "bg-primary/10" : ""
                  }`}
                  onClick={() => onWorkerSelect?.(worker.worker_id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {selectedWorkerId === worker.worker_id && (
                        <div className="w-1 h-6 bg-primary rounded-full" />
                      )}
                      <span className="truncate">{worker.worker_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {worker.total_normal_hours > 0 ? (
                      <Badge variant="secondary">{worker.total_normal_hours}h</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {worker.total_extra_hours > 0 ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        {worker.total_extra_hours}h
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {worker.total_night_hours > 0 ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        {worker.total_night_hours}h
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {worker.total_holiday_hours > 0 ? (
                      <Badge variant="outline" className="text-purple-600 border-purple-300">
                        {worker.total_holiday_hours}h
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{worker.days_worked}</Badge>
                  </TableCell>
                </TableRow>
              ))}

              {summary.length > 1 && (
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-center">{totals.normal}h</TableCell>
                  <TableCell className="text-center">{totals.extra}h</TableCell>
                  <TableCell className="text-center">{totals.night}h</TableCell>
                  <TableCell className="text-center">{totals.holiday}h</TableCell>
                  <TableCell className="text-center">{totals.days}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
