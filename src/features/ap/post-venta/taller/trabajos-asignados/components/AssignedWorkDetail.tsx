"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge, BadgeColor } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_COLORS,
  PLANNING_STATUS_LABELS,
  SESSION_STATUS_LABELS,
} from "../../planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { User, PlayCircle } from "lucide-react";
import { useIsTablet } from "@/hooks/use-tablet";
import { InfoSection } from "@/shared/components/InfoSection";
import { formatDateTime, formatHours } from "@/core/core.function";

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
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        title="Trabajos realizados"
        subtitle={`Detalle de ${planning.work_order_correlative}`}
        type={isTablet ? "tablet" : "default"}
        size="3xl"
      >
        <div className="space-y-6 px-6">
          {/* Información General */}
          <InfoSection
            title="Información General"
            fields={[
              {
                label: "N° Orden de Trabajo",
                value: planning.work_order_correlative,
              },
              {
                label: "Estado",
                value: (
                  <Badge color={colors.color as BadgeColor} variant="outline">
                    {PLANNING_STATUS_LABELS[planning.status]}
                  </Badge>
                ),
              },
              {
                label: "Trabajador",
                value: (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{planning.worker_name}</span>
                  </div>
                ),
              },
              {
                label: "Descripción",
                value: planning.description,
              },
            ]}
          />

          {/* Tiempos */}
          <InfoSection
            title="Información de Tiempos"
            fields={[
              {
                label: "Horas Programadas",
                value: formatHours(planning.estimated_hours),
              },
              {
                label: "Horas Trabajadas",
                value: formatHours(planning.actual_hours),
              },
              {
                label: "Inicio Programado",
                value: formatDateTime(planning.planned_start_datetime),
              },
              {
                label: "Fin Programado",
                value: formatDateTime(planning.planned_end_datetime),
              },
              {
                label: "Inicio Real",
                value: formatDateTime(planning.actual_start_datetime),
              },
              {
                label: "Fin Real",
                value: formatDateTime(planning.actual_end_datetime),
              },
            ]}
          />

          {/* Sesiones */}
          <section className="bg-white border rounded-lg shadow-sm">
            <header className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Historial de Sesiones ({planning.sessions_count})
              </h3>
            </header>

            <div className="px-6 py-4">
              {planning.sessions && planning.sessions.length > 0 ? (
                <ol className="space-y-4">
                  {planning.sessions.map((session, index) => (
                    <li key={session.id} className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {session.status === "in_progress" ? (
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                          ) : session.status === "completed" ? (
                            <svg
                              className="h-5 w-5 text-green-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
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

                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                          <div>
                            <p className="text-muted-foreground">Inicio</p>
                            <p className="font-medium">
                              {formatDateTime(session.start_datetime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fin</p>
                            <p className="font-medium">
                              {session.end_datetime ? (
                                formatDateTime(session.end_datetime)
                              ) : (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                  En curso...
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground">
                            Horas Trabajadas
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {session.hours_worked ? (
                              `${formatHours(session.hours_worked)}`
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                En curso...
                              </span>
                            )}
                          </p>
                        </div>

                        {session.notes && (
                          <div className="mt-3">
                            <p className="text-sm text-muted-foreground">
                              Notas
                            </p>
                            <p className="text-sm">{session.notes}</p>
                          </div>
                        )}

                        {session.pause_reason && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-sm text-muted-foreground">
                              Razón de Pausa
                            </p>
                            <p className="text-sm text-yellow-800">
                              {session.pause_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No se han registrado sesiones de trabajo aún.
                </p>
              )}
            </div>
          </section>
        </div>
      </GeneralSheet>
    </>
  );
}
