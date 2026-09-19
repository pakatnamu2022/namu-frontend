"use client";

import { differenceInCalendarDays, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/core/core.function";
import { Section } from "@/shared/components/ProfileView";
import { useWorkerVacations } from "../lib/worker.hook";
import VacationHeatmap from "./VacationHeatmap";

/** config_status: 17 = PENDIENTE, 19 = APROBADO. */
const STATUS_PENDING = 17;
const STATUS_APPROVED = 19;

/** Días calendario, inclusive. Si las fechas están invertidas en el legacy, 0. */
const vacationDays = (from: string, to: string) =>
  Math.max(0, differenceInCalendarDays(parseISO(to), parseISO(from)) + 1);

const statusColor = (statusId: number) =>
  statusId === STATUS_APPROVED
    ? "green"
    : statusId === STATUS_PENDING
      ? "orange"
      : "gray";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-muted/50 px-4 py-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

export default function WorkerVacationsTab({ workerId }: { workerId: number }) {
  const { data, isLoading, isError } = useWorkerVacations(workerId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No se pudo cargar la información de vacaciones.
      </p>
    );
  }

  const approvedDays = data
    .filter((v) => v.status_id === STATUS_APPROVED)
    .reduce((sum, v) => sum + vacationDays(v.fecha_inicio, v.fecha_fin), 0);
  const pending = data.filter((v) => v.status_id === STATUS_PENDING).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Solicitudes" value={data.length} />
        <Stat label="Días aprobados" value={approvedDays} />
        <Stat label="Pendientes" value={pending} />
      </div>

      <Section label="Calendario de vacaciones">
        <VacationHeatmap vacations={data} />
      </Section>

      <Section label="Historial de vacaciones">
        {data.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Sin vacaciones registradas
          </p>
        ) : (
          <div className="max-h-[420px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted">
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hasta</TableHead>
                  <TableHead className="text-right">Días</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((vacation) => (
                  <TableRow key={vacation.id}>
                    <TableCell className="font-medium">
                      {vacation.tipo_nombre ?? "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {vacation.periodo_inicio && vacation.periodo_fin
                        ? `${vacation.periodo_inicio} - ${vacation.periodo_fin}`
                        : "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(vacation.fecha_inicio)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(vacation.fecha_fin)}
                    </TableCell>
                    <TableCell className="text-right">
                      {vacationDays(vacation.fecha_inicio, vacation.fecha_fin)}
                    </TableCell>
                    <TableCell>
                      <Badge color={statusColor(vacation.status_id)}>
                        {vacation.status ?? "-"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>
    </div>
  );
}
