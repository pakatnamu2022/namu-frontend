"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock } from "lucide-react";
import {
  DEFAULT_GROUP_COLOR,
  GROUP_COLORS,
} from "../../lib/workOrder.interface";
import { useGetConsolidatedPlanning } from "../../../planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import {
  PLANNING_STATUS_COLORS,
  PLANNING_STATUS_LABELS,
} from "../../../planificacion-orden-trabajo/lib/workOrderPlanning.interface";

const getGroupColor = (groupNumber: number) => {
  return GROUP_COLORS[groupNumber] || DEFAULT_GROUP_COLOR;
};

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
    <div className="space-y-6">
      {/* Tabla de Planificación Consolidada */}
      {consolidatedPlanning.length > 0 ? (
        <Card className="p-4 sm:p-6">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumen de Planificación por Grupo
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Progreso consolidado de los trabajos asignados
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="min-w-20 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Grupo
                  </th>
                  <th className="min-w-[200px] px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Descripción
                  </th>
                  <th className="text-center min-w-[100px] px-4 py-3 text-sm font-medium text-gray-700">
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Est. Total</span>
                    </div>
                  </th>
                  <th className="text-center min-w-[100px] px-4 py-3 text-sm font-medium text-gray-700">
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Real Total</span>
                    </div>
                  </th>
                  <th className="text-center min-w-[100px] px-4 py-3 text-sm font-medium text-gray-700">
                    Restante
                  </th>
                  <th className="text-center min-w-[120px] px-4 py-3 text-sm font-medium text-gray-700">
                    Progreso
                  </th>
                  <th className="text-center min-w-[100px] px-4 py-3 text-sm font-medium text-gray-700">
                    Estado
                  </th>
                  <th className="text-center min-w-[100px] px-4 py-3 text-sm font-medium text-gray-700">
                    Cant.
                  </th>
                  <th className="min-w-[250px] px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Trabajadores Asignados
                  </th>
                </tr>
              </thead>
              <tbody>
                {consolidatedPlanning.map((planning) => {
                  const colors = getGroupColor(Number(planning.group_number));
                  return (
                    <tr
                      key={`${planning.group_number}-${planning.description}`}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Badge
                          className="text-white"
                          style={{ backgroundColor: colors.badge }}
                        >
                          Grupo {planning.group_number}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {planning.description}
                          </p>
                        </div>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className="font-semibold text-gray-700">
                          {planning.total_estimated_hours}h
                        </span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className="font-semibold text-blue-600">
                          {planning.total_actual_hours}h
                        </span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span
                          className={`font-semibold ${
                            planning.remaining_hours > 0
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {planning.remaining_hours}h
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                planning.progress_percentage >= 100
                                  ? "bg-green-500"
                                  : planning.progress_percentage >= 50
                                  ? "bg-blue-500"
                                  : "bg-orange-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  planning.progress_percentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            {planning.progress_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="text-center px-4 py-3">
                        <Badge
                          className={`${
                            PLANNING_STATUS_COLORS[planning.status]?.bg ||
                            "bg-gray-100"
                          } ${
                            PLANNING_STATUS_COLORS[planning.status]?.text ||
                            "text-gray-700"
                          } hover:${
                            PLANNING_STATUS_COLORS[planning.status]?.bg ||
                            "bg-gray-100"
                          } hover:${
                            PLANNING_STATUS_COLORS[planning.status]?.text ||
                            "text-gray-700"
                          } pointer-events-none`}
                        >
                          {PLANNING_STATUS_LABELS[planning.status] ||
                            planning.status}
                        </Badge>
                      </td>
                      <td className="text-center px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">
                            {planning.workers_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {planning.workers && planning.workers.length > 0 ? (
                            planning.workers.map((worker, idx) => (
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
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
