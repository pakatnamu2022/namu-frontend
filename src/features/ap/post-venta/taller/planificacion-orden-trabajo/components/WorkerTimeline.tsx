"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_COLORS,
} from "../lib/workOrderPlanning.interface";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_WORKERS } from "../lib/workOrderPlanning.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkerTimelineProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  data: WorkOrderPlanningResource[];
  onPlanningClick?: (planning: WorkOrderPlanningResource) => void;
}

export function WorkerTimeline({
  open,
  onOpenChange,
  selectedDate,
  data,
  onPlanningClick,
}: WorkerTimelineProps) {
  // Horarios del día (8AM-1PM, 2PM-6PM)
  const morningStart = 8;
  const morningEnd = 13;
  const afternoonStart = 14;
  const afternoonEnd = 18;

  // Filtrar planificaciones del día seleccionado
  const dayPlannings = data.filter((planning) => {
    if (!planning.planned_start_datetime) return false;
    return isSameDay(parseISO(planning.planned_start_datetime), selectedDate);
  });

  // Agrupar por trabajador
  const workerPlannings = MOCK_WORKERS.map((worker) => ({
    worker,
    plannings: dayPlannings.filter((p) => p.worker_id === worker.id),
  }));

  // Calcular posición en la línea de tiempo
  const calculatePosition = (time: string, isEnd: boolean = false) => {
    const date = parseISO(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Mañana: 8:00 (480 min) a 13:00 (780 min) = 300 min total
    // Tarde: 14:00 (840 min) a 18:00 (1080 min) = 240 min total

    if (hours >= morningStart && hours < morningEnd) {
      // Período de mañana (50% del ancho)
      const morningStartMin = morningStart * 60;
      const morningTotalMin = (morningEnd - morningStart) * 60;
      const progress = (totalMinutes - morningStartMin) / morningTotalMin;
      return progress * 50; // 50% del ancho para la mañana
    } else if (hours >= afternoonStart && hours < afternoonEnd) {
      // Período de tarde (50% del ancho)
      const afternoonStartMin = afternoonStart * 60;
      const afternoonTotalMin = (afternoonEnd - afternoonStart) * 60;
      const progress = (totalMinutes - afternoonStartMin) / afternoonTotalMin;
      return 50 + progress * 50; // 50% offset + 50% para la tarde
    }

    return isEnd ? 100 : 0;
  };

  const calculateWidth = (planning: WorkOrderPlanningResource) => {
    if (!planning.planned_start_datetime || !planning.planned_end_datetime) return 0;

    const startPos = calculatePosition(planning.planned_start_datetime);
    const endPos = calculatePosition(planning.planned_end_datetime, true);

    return endPos - startPos;
  };

  const getEfficiencyIcon = (planning: WorkOrderPlanningResource) => {
    if (!planning.estimated_hours || planning.actual_hours === 0) return null;

    const efficiency = (planning.estimated_hours / planning.actual_hours) * 100;

    if (efficiency > 100) {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    } else if (efficiency < 100) {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getEfficiencyPercentage = (planning: WorkOrderPlanningResource) => {
    if (!planning.estimated_hours || planning.actual_hours === 0) return "N/A";

    const efficiency = (planning.estimated_hours / planning.actual_hours) * 100;
    return `${efficiency.toFixed(0)}%`;
  };

  // Generar marcadores de hora
  const timeMarkers = [
    { time: "8:00", position: 0 },
    { time: "9:00", position: 10 },
    { time: "10:00", position: 20 },
    { time: "11:00", position: 30 },
    { time: "12:00", position: 40 },
    { time: "13:00", position: 50 },
    { time: "14:00", position: 50 },
    { time: "15:00", position: 62.5 },
    { time: "16:00", position: 75 },
    { time: "17:00", position: 87.5 },
    { time: "18:00", position: 100 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Línea de Tiempo - {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Leyenda */}
          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 border-2 border-blue-500 rounded"></div>
              <span className="text-sm">Planificado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Ejecutado</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm">Más eficiente</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm">Menos eficiente</span>
            </div>
          </div>

          {/* Timeline por trabajador */}
          <div className="space-y-6">
            {workerPlannings.map(({ worker, plannings }) => (
              <div key={worker.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-48 flex-shrink-0">
                    <h3 className="font-semibold text-sm">{worker.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {worker.specialty}
                    </p>
                  </div>
                </div>

                {/* Línea de tiempo */}
                <div className="relative">
                  {/* Grid de tiempo */}
                  <div className="absolute top-0 left-48 right-0 h-full">
                    <div className="relative h-20 bg-gray-100 rounded border">
                      {/* Separador almuerzo */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 z-10"></div>

                      {/* Marcadores de hora */}
                      {timeMarkers.map((marker, index) => (
                        <div
                          key={index}
                          className="absolute top-0 bottom-0 flex flex-col items-center"
                          style={{ left: `${marker.position}%` }}
                        >
                          <div className="w-px h-2 bg-gray-400"></div>
                          <span className="text-[10px] text-gray-600 mt-1">
                            {marker.time}
                          </span>
                        </div>
                      ))}

                      {/* Barras de planificación */}
                      {plannings.map((planning, idx) => {
                        const startPos = calculatePosition(planning.planned_start_datetime!);
                        const width = calculateWidth(planning);
                        const actualStartPos = planning.actual_start_datetime
                          ? calculatePosition(planning.actual_start_datetime)
                          : startPos;
                        const actualEndPos = planning.actual_end_datetime
                          ? calculatePosition(planning.actual_end_datetime, true)
                          : actualStartPos;
                        const actualWidth = actualEndPos - actualStartPos;

                        return (
                          <TooltipProvider key={planning.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="absolute cursor-pointer"
                                  style={{
                                    left: `${startPos}%`,
                                    width: `${width}%`,
                                    top: `${20 + idx * 25}px`,
                                  }}
                                  onClick={() => onPlanningClick?.(planning)}
                                >
                                  {/* Barra planificada (fondo) */}
                                  <div
                                    className={`h-5 rounded border-2 ${
                                      PLANNING_STATUS_COLORS[planning.status].border
                                    } bg-blue-200 opacity-50`}
                                  ></div>

                                  {/* Barra real (encima) */}
                                  {planning.actual_start_datetime && (
                                    <div
                                      className={`absolute top-0 h-5 rounded ${
                                        PLANNING_STATUS_COLORS[planning.status].bg
                                      } flex items-center justify-center`}
                                      style={{
                                        left: `${((actualStartPos - startPos) / width) * 100}%`,
                                        width: `${(actualWidth / width) * 100}%`,
                                      }}
                                    >
                                      <div className="flex items-center gap-1 px-1">
                                        <span className="text-[10px] font-medium truncate text-white">
                                          {planning.work_order_correlative}
                                        </span>
                                        {getEfficiencyIcon(planning)}
                                      </div>
                                    </div>
                                  )}

                                  {/* Si no ha iniciado, mostrar solo planificado */}
                                  {!planning.actual_start_datetime && (
                                    <div className="absolute top-0 left-0 right-0 h-5 flex items-center justify-center">
                                      <span className="text-[10px] font-medium truncate">
                                        {planning.work_order_correlative}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <div className="font-semibold">
                                    {planning.work_order_correlative}
                                  </div>
                                  <div className="text-sm">{planning.description}</div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-muted-foreground">Planificado:</span>
                                      <p>
                                        {planning.planned_start_datetime &&
                                          format(parseISO(planning.planned_start_datetime), "HH:mm")} -{" "}
                                        {planning.planned_end_datetime &&
                                          format(parseISO(planning.planned_end_datetime), "HH:mm")}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Real:</span>
                                      <p>
                                        {planning.actual_start_datetime
                                          ? `${format(parseISO(planning.actual_start_datetime), "HH:mm")} - ${
                                              planning.actual_end_datetime
                                                ? format(parseISO(planning.actual_end_datetime), "HH:mm")
                                                : "En curso"
                                            }`
                                          : "No iniciado"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Estimado:</span>
                                      <p>{planning.estimated_hours || "N/A"}h</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Real:</span>
                                      <p>{planning.actual_hours}h</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Eficiencia:</span>
                                      <p className="flex items-center gap-1">
                                        {getEfficiencyPercentage(planning)}
                                        {getEfficiencyIcon(planning)}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    className={`${PLANNING_STATUS_COLORS[planning.status].bg} ${
                                      PLANNING_STATUS_COLORS[planning.status].text
                                    }`}
                                  >
                                    {planning.status}
                                  </Badge>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}

                      {/* Mensaje si no hay tareas */}
                      {plannings.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            Sin tareas asignadas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Espacio para la línea de tiempo */}
                  <div className="h-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
