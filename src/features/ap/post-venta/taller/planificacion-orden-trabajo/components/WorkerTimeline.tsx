"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_COLORS,
} from "../lib/workOrderPlanning.interface";
import { format, parseISO, isSameDay, addHours } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  MousePointerClick,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";

interface WorkerTimelineProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedDate: Date;
  data: WorkOrderPlanningResource[];
  onPlanningClick?: (planning: WorkOrderPlanningResource) => void;
  selectionMode?: boolean;
  estimatedHours?: number;
  onTimeSelect?: (startDatetime: Date, workerId: number, hours: number) => void;
  onEstimatedHoursChange?: (hours: number) => void;
  fullPage?: boolean;
}

export function WorkerTimeline({
  open = true,
  onOpenChange,
  selectedDate,
  data,
  onPlanningClick,
  selectionMode = false,
  estimatedHours = 0,
  onTimeSelect,
  onEstimatedHoursChange,
  fullPage = false,
}: WorkerTimelineProps) {
  const [selectedTime, setSelectedTime] = useState<{
    time: Date;
    workerId: number;
  } | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{
    time: Date;
    workerId: number;
  } | null>(null);

  // Horarios en minutos desde medianoche
  const MORNING_START = 480; // 8:00
  const MORNING_END = 780; // 13:00
  const LUNCH_START = 780; // 13:00
  const AFTERNOON_START = 864; // 14:24
  const AFTERNOON_END = 1080; // 18:00

  const { data: workers = [] } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  const dayPlannings = data.filter((planning) => {
    if (!planning.planned_start_datetime) return false;
    return isSameDay(parseISO(planning.planned_start_datetime), selectedDate);
  });

  const workerPlannings = workers.map((worker) => ({
    worker: {
      id: worker.id,
      name: `${worker.name}`,
      specialty: worker.position || "Operario",
    },
    plannings: dayPlannings.filter((p) => p.worker_id === worker.id),
  }));

  // Convertir hora a posición en el timeline (0-100%)
  const timeToPosition = (hours: number, minutes: number): number => {
    const totalMinutes = hours * 60 + minutes;

    // Mañana: 8:00-13:00
    if (totalMinutes >= MORNING_START && totalMinutes <= MORNING_END) {
      const morningProgress =
        (totalMinutes - MORNING_START) / (MORNING_END - MORNING_START);
      return morningProgress * 50; // Mañana ocupa 50% del timeline
    }

    // Tarde: 14:24-18:00
    if (totalMinutes >= AFTERNOON_START && totalMinutes <= AFTERNOON_END) {
      const afternoonProgress =
        (totalMinutes - AFTERNOON_START) / (AFTERNOON_END - AFTERNOON_START);
      return 60 + afternoonProgress * 40; // Tarde ocupa del 60% al 100%
    }

    return 0;
  };

  // Convertir posición del timeline (0-100%) a hora
  const positionToTime = (position: number): Date | null => {
    let targetMinutes: number;

    // Mañana: 0%-50%
    if (position <= 50) {
      const morningProgress = position / 50;
      targetMinutes =
        MORNING_START + morningProgress * (MORNING_END - MORNING_START);
    }
    // Almuerzo: 50%-60% (no seleccionable)
    else if (position > 50 && position < 60) {
      return null;
    }
    // Tarde: 60%-100%
    else {
      const afternoonProgress = (position - 60) / 40;
      targetMinutes =
        AFTERNOON_START + afternoonProgress * (AFTERNOON_END - AFTERNOON_START);
    }

    let hours = Math.floor(targetMinutes / 60);
    let mins = Math.round(targetMinutes % 60);

    // Redondear a 6 minutos (0.1 horas)
    mins = Math.round(mins / 6) * 6;
    if (mins >= 60) {
      hours += 1;
      mins = 0;
    }

    const date = new Date(selectedDate);
    date.setHours(hours, mins, 0, 0);
    return date;
  };

  const calculatePosition = (time: string) => {
    const date = parseISO(time);
    return timeToPosition(date.getHours(), date.getMinutes());
  };

  const calculatePositionFromDate = (date: Date) => {
    return timeToPosition(date.getHours(), date.getMinutes());
  };

  const calculateWidth = (planning: WorkOrderPlanningResource) => {
    if (!planning.planned_start_datetime || !planning.planned_end_datetime)
      return 0;
    const startPos = calculatePosition(planning.planned_start_datetime);
    const endPos = calculatePosition(planning.planned_end_datetime);
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

  const isSlotAvailable = (
    startTime: Date,
    workerPlannings: WorkOrderPlanningResource[]
  ) => {
    const endTime = addHours(startTime, estimatedHours);
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    const startHour = startTime.getHours();
    const startMin = startTime.getMinutes();
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMinute;

    // Verificar que no cruce el almuerzo
    if (startTotalMin < LUNCH_START && endTotalMin > LUNCH_START) {
      return false; // Cruza el inicio del almuerzo
    }

    // Verificar que esté dentro del horario laboral
    const isInMorning =
      startTotalMin >= MORNING_START && endTotalMin <= MORNING_END;
    const isInAfternoon =
      startTotalMin >= AFTERNOON_START && endTotalMin <= AFTERNOON_END;

    if (!isInMorning && !isInAfternoon) {
      return false;
    }

    // Verificar conflictos con tareas existentes
    return !workerPlannings.some((p) => {
      if (!p.planned_start_datetime || !p.planned_end_datetime) return false;
      const planStart = parseISO(p.planned_start_datetime);
      const planEnd = parseISO(p.planned_end_datetime);
      return (
        (startTime >= planStart && startTime < planEnd) ||
        (endTime > planStart && endTime <= planEnd) ||
        (startTime <= planStart && endTime >= planEnd)
      );
    });
  };

  const handleTimelineClick = (
    event: React.MouseEvent<HTMLDivElement>,
    workerId: number,
    workerPlannings: WorkOrderPlanningResource[]
  ) => {
    if (!selectionMode) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const position = (clickX / rect.width) * 100;
    const clickedTime = positionToTime(position);

    if (clickedTime && isSlotAvailable(clickedTime, workerPlannings)) {
      setSelectedTime({ time: clickedTime, workerId });
    }
  };

  const handleTimelineHover = (
    event: React.MouseEvent<HTMLDivElement>,
    workerId: number,
    workerPlannings: WorkOrderPlanningResource[]
  ) => {
    if (!selectionMode) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const hoverX = event.clientX - rect.left;
    const position = (hoverX / rect.width) * 100;
    const hoveredTime = positionToTime(position);

    if (hoveredTime && isSlotAvailable(hoveredTime, workerPlannings)) {
      setHoveredSlot({ time: hoveredTime, workerId });
    } else {
      setHoveredSlot(null);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedTime && onTimeSelect) {
      onTimeSelect(selectedTime.time, selectedTime.workerId, estimatedHours);
      setSelectedTime(null);
      setHoveredSlot(null);
    }
  };

  const timeMarkers = [
    { time: "8:00", position: 0 },
    { time: "9:00", position: 10 },
    { time: "10:00", position: 20 },
    { time: "11:00", position: 30 },
    { time: "12:00", position: 40 },
    { time: "13:00", position: 50 },
    { time: "14:24", position: 60 },
    { time: "15:00", position: 69 },
    { time: "16:00", position: 80 },
    { time: "17:00", position: 91 },
    { time: "18:00", position: 100 },
  ];

  const timelineContent = (
    <div className="space-y-6">
      {selectionMode && onEstimatedHoursChange && (
        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <Label
            htmlFor="estimated-hours"
            className="text-sm font-medium whitespace-nowrap"
          >
            Duración de la tarea:
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="estimated-hours"
              type="number"
              min="0.5"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => onEstimatedHoursChange(Number(e.target.value))}
              className="w-20 text-center"
            />
            <span className="text-sm text-muted-foreground">horas</span>
          </div>
        </div>
      )}

      {selectionMode && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Haz click en un espacio disponible de la línea de tiempo para
            seleccionar la hora de inicio. La tarea durará{" "}
            <strong>{estimatedHours}h</strong>.
          </AlertDescription>
        </Alert>
      )}

      {selectionMode && selectedTime && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Horario seleccionado:
              </p>
              <p className="text-lg font-bold text-blue-700">
                {format(selectedTime.time, "HH:mm", { locale: es })} -{" "}
                {format(addHours(selectedTime.time, estimatedHours), "HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
            <Button onClick={handleConfirmSelection}>
              Confirmar y Continuar
            </Button>
          </div>
        </div>
      )}

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

      <div className="space-y-6">
        {workerPlannings.map(({ worker, plannings }) => (
          <div key={worker.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-48 shrink-0">
                <h3 className="font-semibold text-sm">{worker.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {worker.specialty}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-48 right-0 h-full">
                <div
                  className={`relative h-20 rounded border ${
                    selectionMode ? "cursor-pointer" : ""
                  }`}
                  onClick={(e) =>
                    selectionMode
                      ? handleTimelineClick(e, worker.id, plannings)
                      : undefined
                  }
                  onMouseMove={(e) =>
                    selectionMode
                      ? handleTimelineHover(e, worker.id, plannings)
                      : undefined
                  }
                  onMouseLeave={() =>
                    selectionMode ? setHoveredSlot(null) : undefined
                  }
                >
                  {/* Área de mañana */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gray-100"
                    style={{ width: "50%" }}
                  ></div>

                  {/* Separador almuerzo */}
                  <div
                    className="absolute top-0 bottom-0 bg-orange-100 border-l-2 border-r-2 border-orange-300 z-10"
                    style={{ left: "50%", width: "10%" }}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-orange-700 whitespace-nowrap">
                      ALMUERZO
                    </div>
                  </div>

                  {/* Área de tarde */}
                  <div
                    className="absolute top-0 bottom-0 bg-gray-100"
                    style={{ left: "60%", width: "40%" }}
                  ></div>

                  {/* Marcadores de hora */}
                  {timeMarkers.map((marker, index) => (
                    <div
                      key={index}
                      className="absolute top-0 bottom-0 flex flex-col items-start z-20"
                      style={{ left: `${marker.position}%` }}
                    >
                      <div className="w-px h-2 bg-gray-500"></div>
                      <span className="text-[10px] text-gray-700 font-medium mt-1 -ml-2">
                        {marker.time}
                      </span>
                    </div>
                  ))}

                  {/* Barras de planificación */}
                  {plannings.map((planning, idx) => {
                    const startPos = calculatePosition(
                      planning.planned_start_datetime!
                    );
                    const width = calculateWidth(planning);

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
                              {/* Barra única - color según estado */}
                              <div
                                className={`h-5 rounded border-2 ${
                                  PLANNING_STATUS_COLORS[planning.status].border
                                } ${
                                  planning.actual_start_datetime
                                    ? PLANNING_STATUS_COLORS[planning.status].bg
                                    : "bg-blue-200 opacity-50"
                                }`}
                              ></div>

                              {/* Texto centrado */}
                              <div className="absolute top-0 left-0 right-0 h-5 flex items-center justify-center pointer-events-none z-10">
                                <div className="flex items-center gap-1 px-1">
                                  <span className="text-[10px] font-medium truncate  text-gray-900">
                                    {planning.work_order_correlative}
                                  </span>
                                  {getEfficiencyIcon(planning)}
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <div className="font-semibold">
                                {planning.work_order_correlative}
                              </div>
                              <div className="text-sm">
                                {planning.description}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground ">
                                    Planificado:
                                  </span>
                                  <p>
                                    {planning.planned_start_datetime &&
                                      format(
                                        parseISO(
                                          planning.planned_start_datetime
                                        ),
                                        "HH:mm"
                                      )}{" "}
                                    -{" "}
                                    {planning.planned_end_datetime &&
                                      format(
                                        parseISO(planning.planned_end_datetime),
                                        "HH:mm"
                                      )}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Real:
                                  </span>
                                  <p>
                                    {planning.actual_start_datetime
                                      ? `${format(
                                          parseISO(
                                            planning.actual_start_datetime
                                          ),
                                          "HH:mm"
                                        )} - ${
                                          planning.actual_end_datetime
                                            ? format(
                                                parseISO(
                                                  planning.actual_end_datetime
                                                ),
                                                "HH:mm"
                                              )
                                            : "En curso"
                                        }`
                                      : "No iniciado"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Estimado:
                                  </span>
                                  <p>{planning.estimated_hours || "N/A"}h</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Real:
                                  </span>
                                  <p>{planning.actual_hours}h</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Eficiencia:
                                  </span>
                                  <p className="flex items-center gap-1">
                                    {getEfficiencyPercentage(planning)}
                                    {getEfficiencyIcon(planning)}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                className={`${
                                  PLANNING_STATUS_COLORS[planning.status].bg
                                } ${
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

                  {/* Preview hover */}
                  {selectionMode &&
                    hoveredSlot &&
                    hoveredSlot.workerId === worker.id && (
                      <div
                        className="absolute top-0 h-full bg-blue-300 opacity-40 pointer-events-none border-2 border-blue-500 border-dashed z-20"
                        style={{
                          left: `${calculatePositionFromDate(
                            hoveredSlot.time
                          )}%`,
                          width: `${
                            calculatePositionFromDate(
                              addHours(hoveredSlot.time, estimatedHours)
                            ) - calculatePositionFromDate(hoveredSlot.time)
                          }%`,
                        }}
                      ></div>
                    )}

                  {/* Selección confirmada */}
                  {selectionMode &&
                    selectedTime &&
                    selectedTime.workerId === worker.id && (
                      <div
                        className="absolute top-0 h-full bg-blue-500 opacity-50 pointer-events-none border-2 border-blue-700 z-30"
                        style={{
                          left: `${calculatePositionFromDate(
                            selectedTime.time
                          )}%`,
                          width: `${
                            calculatePositionFromDate(
                              addHours(selectedTime.time, estimatedHours)
                            ) - calculatePositionFromDate(selectedTime.time)
                          }%`,
                        }}
                      >
                        <div className="flex items-center justify-center h-full">
                          <span className="text-xs font-bold text-black">
                            {format(selectedTime.time, "HH:mm")} -{" "}
                            {format(
                              addHours(selectedTime.time, estimatedHours),
                              "HH:mm"
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                  {plannings.length === 0 && !selectionMode && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        Sin tareas asignadas
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">
            {selectionMode ? "Seleccionar Horario" : "Línea de Tiempo"} -{" "}
            {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
              locale: es,
            })}
          </h2>
        </div>
        {timelineContent}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectionMode ? (
              <MousePointerClick className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            {selectionMode ? "Seleccionar Horario" : "Línea de Tiempo"} -{" "}
            {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
              locale: es,
            })}
          </DialogTitle>
        </DialogHeader>
        {timelineContent}
      </DialogContent>
    </Dialog>
  );
}
