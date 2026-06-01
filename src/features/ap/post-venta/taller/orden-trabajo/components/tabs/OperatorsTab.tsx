"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { useGetConsolidatedPlanning } from "../../../planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import {
  PLANNING_STATUS_COLORS,
  PLANNING_STATUS_LABELS,
} from "../../../planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { formatHours } from "@/core/core.function";
import { DetailSheetTable } from "@/shared/components/DetailSheetTable";

// const getGroupColor = (groupNumber: number) => {
//   return GROUP_COLORS[groupNumber] || DEFAULT_GROUP_COLOR;
// };

interface OperatorsTabProps {
  workOrderId: number;
}

export default function OperatorsTab({ workOrderId }: OperatorsTabProps) {
  // Consultar planificación consolidada
  const { data: consolidatedPlanning = [], isLoading: isLoadingConsolidated } =
    useGetConsolidatedPlanning(workOrderId);

  if (isLoadingConsolidated) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Cargando trabajadores asignados...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 w-full">
      {consolidatedPlanning.length > 0 ? (
        <>
          <Card className="p-4 sm:p-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumen de Planificación
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Progreso consolidado de los trabajos asignados
              </p>
            </div>
          </Card>

          {/* Tabla de Planificación Consolidada */}
          <DetailSheetTable
            rows={consolidatedPlanning}
            getKey={(row) => `${row.group_number}-${row.description}`}
            columns={[
              {
                header: "Descripción",
                render: (row) => (
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {row.description}
                    </p>
                  </div>
                ),
              },
              {
                header: "Programadas Total",
                render: (row) => (
                  <span className="font-semibold text-gray-700">
                    {formatHours(row.total_estimated_hours)}
                  </span>
                ),
              },
              {
                header: "Real Total",
                render: (row) => (
                  <span className="font-semibold text-blue-600">
                    {formatHours(row.total_actual_hours)}
                  </span>
                ),
              },
              {
                header: "Restante",
                render: (row) => (
                  <span
                    className={`font-semibold ${
                      row.remaining_hours > 0
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatHours(row.remaining_hours)}
                  </span>
                ),
              },
              {
                header: "Progreso",
                render: (row) => (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          row.progress_percentage >= 100
                            ? "bg-green-500"
                            : row.progress_percentage >= 50
                              ? "bg-blue-500"
                              : "bg-orange-500"
                        }`}
                        style={{
                          width: `${Math.min(row.progress_percentage, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">
                      {row.progress_percentage}%
                    </span>
                  </div>
                ),
              },
              {
                header: "Estado",
                render: (row) => (
                  <Badge
                    className={`${
                      PLANNING_STATUS_COLORS[row.status]?.bg || "bg-gray-100"
                    } ${
                      PLANNING_STATUS_COLORS[row.status]?.text ||
                      "text-gray-700"
                    } hover:${
                      PLANNING_STATUS_COLORS[row.status]?.bg || "bg-gray-100"
                    } hover:${
                      PLANNING_STATUS_COLORS[row.status]?.text ||
                      "text-gray-700"
                    } pointer-events-none`}
                  >
                    {PLANNING_STATUS_LABELS[row.status] || row.status}
                  </Badge>
                ),
              },
              {
                header: "Cant.",
                render: (row) => (
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{row.workers_count}</span>
                  </div>
                ),
              },
              {
                header: "Trabajadores Asignados",
                render: (row) => (
                  <div className="flex flex-wrap gap-1.5">
                    {row.workers && row.workers.length > 0 ? (
                      row.workers.map((worker, idx) => (
                        <Badge
                          key={`${worker.worker_id}-${idx}`}
                          color="secondary"
                          className="text-xs"
                        >
                          {worker.worker_name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">
                        Sin asignar
                      </span>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </>
      ) : (
        <Card className="p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Sin trabajadores asignados
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Aún no se han asignado trabajadores a ningún grupo de esta orden
              de trabajo. Dirígete a la pestaña de planificación para asignar
              operarios.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
