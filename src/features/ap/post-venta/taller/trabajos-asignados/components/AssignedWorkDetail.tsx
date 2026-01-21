"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_COLORS,
  PLANNING_STATUS_LABELS,
  SESSION_STATUS_LABELS,
} from "../../planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, User, FileText, PlayCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useIsTablet } from "@/hooks/use-tablet";

interface AssignedWorkDetailProps {
  planning: WorkOrderPlanningResource | null;
  open: boolean;
  onClose: () => void;
}

export function AssignedWorkDetail({
  planning,
  open,
  onClose,
}: AssignedWorkDetailProps) {
  const isTablet = useIsTablet();

  if (!planning) return null;

  const colors = PLANNING_STATUS_COLORS[planning.status];

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Detalle de  - ${planning.work_order_correlative}`}
      type={isTablet ? "tablet" : "default"}
      className="sm:max-w-3xl"
    >
      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {/* Estado */}
        <div className="flex items-center justify-between">
          <Badge
            className={`${colors.bg} ${colors.text} border ${colors.border}`}
            variant="outline"
          >
            {PLANNING_STATUS_LABELS[planning.status]}
          </Badge>
        </div>

        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Orden de Trabajo
                </p>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <p className="font-medium">
                    {planning.work_order_correlative}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trabajador</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <p className="font-medium">{planning.worker_name}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Descripción</p>
              <p className="font-medium">{planning.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tiempos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Tiempos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Horas Estimadas
                </p>
                <p className="text-2xl font-bold text-primary">
                  {planning.estimated_hours || "-"} horas
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Horas Trabajadas
                </p>
                <p
                  className={`text-2xl font-bold ${
                    planning.estimated_hours &&
                    planning.actual_hours > planning.estimated_hours
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {planning.actual_hours != null
                    ? `${planning.actual_hours} horas`
                    : "-"}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Inicio Planificado
                </p>
                <p className="font-medium">
                  {planning.planned_start_datetime
                    ? format(
                        parseISO(planning.planned_start_datetime),
                        "dd/MM/yyyy HH:mm",
                        { locale: es },
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fin Planificado</p>
                <p className="font-medium">
                  {planning.planned_end_datetime
                    ? format(
                        parseISO(planning.planned_end_datetime),
                        "dd/MM/yyyy HH:mm",
                        { locale: es },
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inicio Real</p>
                <p className="font-medium">
                  {planning.actual_start_datetime
                    ? format(
                        parseISO(planning.actual_start_datetime),
                        "dd/MM/yyyy HH:mm",
                        { locale: es },
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fin Real</p>
                <p className="font-medium">
                  {planning.actual_end_datetime
                    ? format(
                        parseISO(planning.actual_end_datetime),
                        "dd/MM/yyyy HH:mm",
                        { locale: es },
                      )
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sesiones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Historial de Sesiones ({planning.sessions_count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planning.sessions && planning.sessions.length > 0 ? (
              <div className="space-y-4">
                {planning.sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Sesión {index + 1}</h4>
                      <Badge
                        color={
                          session.status === "in_progress"
                            ? "blue"
                            : session.status === "completed"
                              ? "green"
                              : "gray"
                        }
                      >
                        {SESSION_STATUS_LABELS[session.status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Inicio</p>
                        <p className="font-medium">
                          {format(
                            parseISO(session.start_datetime),
                            "dd/MM/yyyy HH:mm",
                            { locale: es },
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fin</p>
                        <p className="font-medium">
                          {session.end_datetime
                            ? format(
                                parseISO(session.end_datetime),
                                "dd/MM/yyyy HH:mm",
                                { locale: es },
                              )
                            : "En curso..."}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Horas Trabajadas
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {session.hours_worked
                          ? `${Number(session.hours_worked).toFixed(1)}h`
                          : "En curso..."}
                      </p>
                    </div>

                    {session.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notas</p>
                        <p className="text-sm">{session.notes}</p>
                      </div>
                    )}

                    {session.pause_reason && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <p className="text-sm text-muted-foreground">
                          Razón de Pausa
                        </p>
                        <p className="text-sm text-yellow-800">
                          {session.pause_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No se han registrado sesiones de trabajo aún.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </GeneralSheet>
  );
}
