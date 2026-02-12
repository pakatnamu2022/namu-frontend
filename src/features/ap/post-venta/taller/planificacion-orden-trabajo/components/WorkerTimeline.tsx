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
  PLANNING_STATUS_LABELS,
} from "../lib/workOrderPlanning.interface";
import { format, parseISO, isSameDay, addHours } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  MousePointerClick,
  Package,
  ListChecks,
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
import { useState, useMemo, useEffect, useRef, useReducer } from "react";
import { cn } from "@/lib/utils";
import { ExceptionalCaseSheet } from "./ExceptionalCaseSheet";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { Building2, RefreshCw } from "lucide-react";
import { useGetWorkOrder } from "../../orden-trabajo/lib/workOrder.hook";
import { WorkOrderResource } from "../../orden-trabajo/lib/workOrder.interface";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  AT_WORK_WORK_ORDER_ID,
  FINISHED_WORK_ORDER_ID,
  OPENING_WORK_ORDER_ID,
  RECEIVED_WORK_ORDER_ID,
} from "@/features/ap/ap-master/lib/apMaster.constants";

interface WorkerTimelineProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedDate: Date;
  data: WorkOrderPlanningResource[];
  onPlanningClick?: (planning: WorkOrderPlanningResource) => void;
  selectionMode?: boolean;
  estimatedHours?: number;
  onTimeSelect?: (
    startDatetime: Date,
    workerId: number,
    hours: number,
    workOrderId: number,
    description: string,
    groupNumber: number,
  ) => void;
  onEstimatedHoursChange?: (hours: number) => void;
  fullPage?: boolean;
  sedeId?: string;
  onRefresh?: () => void;
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
  sedeId,
  onRefresh,
}: WorkerTimelineProps) {
  const [selectedTime, setSelectedTime] = useState<{
    time: Date;
    workerId: number;
  } | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{
    time: Date;
    workerId: number;
  } | null>(null);
  const [isExceptionalCaseOpen, setIsExceptionalCaseOpen] = useState(false);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [openWorkOrderSelect, setOpenWorkOrderSelect] = useState(false);
  const [searchWorkOrder, setSearchWorkOrder] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageWorkOrder, setPageWorkOrder] = useState(1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Obtener sedes disponibles
  const { data: mySedes = [] } = useMySedes({
    company: EMPRESA_AP.id,
  });

  // Obtener órdenes de trabajo con búsqueda y paginación
  const { data: workOrdersData, isLoading: isLoadingWorkOrders } =
    useGetWorkOrder({
      params: {
        search: debouncedSearch,
        page: pageWorkOrder,
        per_page: 20,
        status_id: [
          OPENING_WORK_ORDER_ID,
          RECEIVED_WORK_ORDER_ID,
          AT_WORK_WORK_ORDER_ID,
          FINISHED_WORK_ORDER_ID,
        ],
        sede_id: sedeId,
      },
    });

  // Acumular órdenes de trabajo de todas las páginas usando reducer pattern
  const [accumulatedWorkOrders, dispatchWorkOrders] = useReducer(
    (
      state: WorkOrderResource[],
      action: { type: "set" | "append" | "reset"; data?: WorkOrderResource[] },
    ) => {
      switch (action.type) {
        case "set":
          return action.data || [];
        case "append": {
          const existingIds = new Set(state.map((wo) => wo.id));
          const uniqueNew = (action.data || []).filter(
            (wo) => !existingIds.has(wo.id),
          );
          return uniqueNew.length > 0 ? [...state, ...uniqueNew] : state;
        }
        case "reset":
          return [];
        default:
          return state;
      }
    },
    [],
  );

  // Sincronizar datos paginados del query al estado acumulado
  useEffect(() => {
    if (workOrdersData?.data) {
      if (pageWorkOrder === 1) {
        dispatchWorkOrders({ type: "set", data: workOrdersData.data });
      } else {
        dispatchWorkOrders({ type: "append", data: workOrdersData.data });
      }
    }
  }, [workOrdersData?.data, pageWorkOrder]);

  const workOrders = accumulatedWorkOrders;

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (debouncedSearch !== searchWorkOrder) {
        setDebouncedSearch(searchWorkOrder);
        setPageWorkOrder(1);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchWorkOrder, debouncedSearch]);

  // Encontrar el nombre de la sede seleccionada
  const selectedSede = mySedes.find((s) => s.id.toString() === sedeId);

  // Obtener la orden de trabajo seleccionada
  const selectedWorkOrder = useMemo(() => {
    if (!selectedWorkOrderId) return null;
    return workOrders.find((wo) => wo.id.toString() === selectedWorkOrderId);
  }, [selectedWorkOrderId, workOrders]);

  // Obtener los grupos únicos de los items
  const availableGroups = useMemo(() => {
    if (!selectedWorkOrder?.items) return [];
    const groups = new Set(
      selectedWorkOrder.items.map((item) => item.group_number),
    );
    return Array.from(groups).sort();
  }, [selectedWorkOrder]);

  // Auto-seleccionar grupo si solo hay uno
  const activeGroup = useMemo(() => {
    if (availableGroups.length === 1) return availableGroups[0];
    return selectedGroup;
  }, [availableGroups, selectedGroup]);

  // Filtrar items por grupo seleccionado
  const filteredItems = useMemo(() => {
    if (!selectedWorkOrder?.items) return [];
    if (activeGroup === null) return selectedWorkOrder.items;
    return selectedWorkOrder.items.filter(
      (item) => item.group_number === activeGroup,
    );
  }, [selectedWorkOrder, activeGroup]);

  // Horarios en minutos desde medianoche
  const MORNING_START = 480; // 8:00
  const MORNING_END = 780; // 13:00
  const LUNCH_START = 780; // 13:00
  const AFTERNOON_START = 864; // 14:24
  const AFTERNOON_END = 1080; // 18:00

  const { data: workers = [] } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    sede_id: sedeId,
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
    workerPlannings: WorkOrderPlanningResource[],
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
    workerPlannings: WorkOrderPlanningResource[],
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
    workerPlannings: WorkOrderPlanningResource[],
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
    if (
      selectedTime &&
      onTimeSelect &&
      selectedWorkOrderId &&
      selectedItemId !== null &&
      activeGroup !== null
    ) {
      // Obtener la descripción del item seleccionado
      const selectedItem = filteredItems.find(
        (item) => item.id === selectedItemId,
      );
      const description = selectedItem?.description || "";

      onTimeSelect(
        selectedTime.time,
        selectedTime.workerId,
        estimatedHours,
        Number(selectedWorkOrderId),
        description,
        activeGroup,
      );

      // Limpiar selecciones
      setSelectedTime(null);
      setHoveredSlot(null);
      setSelectedWorkOrderId("");
      setSelectedGroup(null);
      setSelectedItemId(null);
    }
  };

  const handleItemSelect = (itemId: number) => {
    // Si se selecciona el mismo item, deseleccionarlo; si no, seleccionar el nuevo
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  };

  const canConfirm =
    selectedTime &&
    selectedWorkOrderId &&
    selectedItemId !== null &&
    activeGroup !== null;

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
      {/* Sede y Botones */}
      <div className="flex justify-between items-center gap-4">
        {selectedSede && (
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1"
          >
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{selectedSede.description}</span>
          </Badge>
        )}
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="gap-2"
            disabled={!onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsExceptionalCaseOpen(true)}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Caso Excepcional
          </Button>
        </div>
      </div>

      {selectionMode && onEstimatedHoursChange && (
        <div className="space-y-4 p-6 bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl shadow-sm">
          {/* Duración y Orden de Trabajo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="estimated-hours"
                className="text-sm font-semibold text-slate-700"
              >
                Duración de la tarea
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="estimated-hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) =>
                    onEstimatedHoursChange(Number(e.target.value))
                  }
                  className="w-24 text-center font-semibold"
                />
                <span className="text-sm text-slate-600 font-medium">
                  horas
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="work-order"
                className="text-sm font-semibold text-slate-700"
              >
                Orden de Trabajo
              </Label>
              <Popover
                open={openWorkOrderSelect}
                onOpenChange={setOpenWorkOrderSelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openWorkOrderSelect}
                    className="w-full justify-between font-medium"
                  >
                    {selectedWorkOrderId ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{selectedWorkOrder?.correlative}
                        </Badge>
                        <span className="text-sm">
                          {selectedWorkOrder?.vehicle_plate}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Buscar OT...
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscar por correlativo o placa..."
                      value={searchWorkOrder}
                      onValueChange={setSearchWorkOrder}
                    />
                    <CommandList>
                      {isLoadingWorkOrders ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : workOrders.length === 0 ? (
                        <CommandEmpty>
                          No se encontraron órdenes de trabajo.
                        </CommandEmpty>
                      ) : (
                        workOrders.map((wo) => (
                          <CommandItem
                            key={wo.id}
                            value={wo.id.toString()}
                            onSelect={() => {
                              setSelectedWorkOrderId(wo.id.toString());
                              setSelectedGroup(null);
                              setSelectedItemId(null);
                              setOpenWorkOrderSelect(false);
                              setSearchWorkOrder("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedWorkOrderId === wo.id.toString()
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                #{wo.correlative}
                              </Badge>
                              <span className="text-sm">
                                {wo.vehicle_plate}
                              </span>
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Selector de Grupo si hay más de uno */}
          {selectedWorkOrder && availableGroups.length > 1 && (
            <div className="space-y-2 p-4 bg-white rounded-lg border border-slate-200">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Seleccionar Grupo
              </Label>
              <RadioGroup
                value={selectedGroup?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedGroup(Number(value));
                  setSelectedItemId(null);
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {availableGroups.map((group) => {
                    const itemCount = selectedWorkOrder.items.filter(
                      (item) => item.group_number === group,
                    ).length;
                    return (
                      <div key={group} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={group.toString()}
                          id={`group-${group}`}
                        />
                        <Label
                          htmlFor={`group-${group}`}
                          className="cursor-pointer font-medium text-sm"
                        >
                          Grupo {group}{" "}
                          <span className="text-muted-foreground">
                            ({itemCount} trabajos)
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Lista de Descripciones */}
          {selectedWorkOrder && activeGroup !== null && (
            <div className="space-y-2 p-4 bg-white rounded-lg border border-slate-200">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Seleccionar Descripción de Trabajo
              </Label>
              <RadioGroup
                value={selectedItemId?.toString() || ""}
                onValueChange={(value) => setSelectedItemId(Number(value))}
              >
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedItemId === item.id
                            ? "bg-blue-50 border-blue-300 shadow-sm"
                            : "bg-white hover:bg-slate-50"
                        }`}
                        onClick={() => handleItemSelect(item.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <RadioGroupItem
                              value={item.id.toString()}
                              id={`item-${item.id}`}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-semibold bg-linear-to-r from-blue-50 to-indigo-50"
                                >
                                  {item.type_planning_name}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay items disponibles para este grupo
                    </p>
                  )}
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
      )}

      {selectionMode && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">
            {!selectedWorkOrderId && (
              <span>
                Seleccione una <strong>Orden de Trabajo</strong> y luego haz
                click en un espacio disponible del timeline.
              </span>
            )}
            {selectedWorkOrderId && !selectedTime && (
              <span>
                Ahora haz click en un espacio disponible de la línea de tiempo.
                La tarea durará <strong>{estimatedHours}h</strong>.
              </span>
            )}
            {selectedWorkOrderId && selectedTime && selectedItemId === null && (
              <span>
                Selecciona una <strong>descripción de trabajo</strong> para
                continuar.
              </span>
            )}
            {selectedWorkOrderId && selectedTime && selectedItemId !== null && (
              <span className="text-green-700 font-semibold">
                ¡Todo listo! Haz click en "Confirmar y Crear Planificación".
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {selectionMode && selectedTime && (
        <div className="p-5 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">
                Horario seleccionado:
              </p>
              <p className="text-2xl font-bold text-primary">
                {format(selectedTime.time, "HH:mm", { locale: es })} -{" "}
                {format(addHours(selectedTime.time, estimatedHours), "HH:mm", {
                  locale: es,
                })}
              </p>
              {selectedItemId !== null && (
                <p className="text-xs text-primary mt-1">
                  1 descripción seleccionada
                </p>
              )}
            </div>
            <Button
              onClick={handleConfirmSelection}
              disabled={!canConfirm}
              size="lg"
              className="bg-primary hover:bg-primary"
            >
              Confirmar y Crear Planificación
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 border-2 border-blue-500 rounded"></div>
          <span className="text-sm">Planificado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-200 border-2 border-amber-500 rounded"></div>
          <span className="text-sm">Caso Excepcional</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Completado</span>
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
          <div key={worker.id} className="flex items-center gap-3">
            <div className="w-48 shrink-0">
              <h3 className="font-semibold text-sm">{worker.name}</h3>
              <p className="text-xs text-muted-foreground">
                {worker.specialty}
              </p>
            </div>

            <div className="flex-1">
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
                {plannings.map((planning, index) => {
                  const startPos = calculatePosition(
                    planning.planned_start_datetime!,
                  );
                  const width = calculateWidth(planning);
                  const isExternal = planning.type === "external";

                  // Verificar si el planning anterior era interno y este es externo para actualizar espacio
                  const previousPlanning =
                    index > 0 ? plannings[index - 1] : null;
                  const needsTopMargin =
                    isExternal && previousPlanning?.type !== "external";

                  return (
                    <TooltipProvider key={planning.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute cursor-pointer"
                            style={{
                              left: `${startPos}%`,
                              width: `${width}%`,
                              top: needsTopMargin ? "calc(50% + 8px)" : "50%",
                              transform: "translateY(-50%)",
                            }}
                            onClick={() => onPlanningClick?.(planning)}
                          >
                            {/* Barra única - color según estado o tipo */}
                            <div
                              className={`h-5 rounded border-2 ${
                                isExternal
                                  ? "border-amber-500 bg-amber-200"
                                  : PLANNING_STATUS_COLORS[planning.status]
                                      .border
                              } ${
                                !isExternal && planning.actual_start_datetime
                                  ? PLANNING_STATUS_COLORS[planning.status].bg
                                  : !isExternal
                                    ? "bg-blue-200 opacity-50"
                                    : ""
                              }`}
                            ></div>

                            {/* Texto centrado */}
                            <div className="absolute top-0 left-0 right-0 h-5 flex items-center justify-center pointer-events-none z-10">
                              <div className="flex items-center gap-1 px-1">
                                <span className="text-[10px] font-medium truncate text-gray-900">
                                  {planning.work_order_correlative}
                                </span>
                                {isExternal && (
                                  <Badge className="text-[8px] px-1 py-0 h-3 bg-amber-600 text-white">
                                    EXT
                                  </Badge>
                                )}
                                {getEfficiencyIcon(planning)}
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs bg-gray-50 text-black border border-gray-400"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold">
                                {planning.work_order_correlative}
                              </div>
                              {planning.type === "external" && (
                                <Badge className="text-[10px] bg-amber-600 text-white">
                                  Caso Excepcional
                                </Badge>
                              )}
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
                                      parseISO(planning.planned_start_datetime),
                                      "HH:mm",
                                    )}{" "}
                                  -{" "}
                                  {planning.planned_end_datetime &&
                                    format(
                                      parseISO(planning.planned_end_datetime),
                                      "HH:mm",
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
                                          planning.actual_start_datetime,
                                        ),
                                        "HH:mm",
                                      )} - ${
                                        planning.actual_end_datetime
                                          ? format(
                                              parseISO(
                                                planning.actual_end_datetime,
                                              ),
                                              "HH:mm",
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
                              } hover:${
                                PLANNING_STATUS_COLORS[planning.status].bg
                              }`}
                            >
                              {PLANNING_STATUS_LABELS[planning.status]}
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
                        left: `${calculatePositionFromDate(hoveredSlot.time)}%`,
                        width: `${
                          calculatePositionFromDate(
                            addHours(hoveredSlot.time, estimatedHours),
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
                      className="absolute top-0 h-full bg-blue-500 opacity-50 pointer-events-none border-2 border-primary z-30"
                      style={{
                        left: `${calculatePositionFromDate(
                          selectedTime.time,
                        )}%`,
                        width: `${
                          calculatePositionFromDate(
                            addHours(selectedTime.time, estimatedHours),
                          ) - calculatePositionFromDate(selectedTime.time)
                        }%`,
                      }}
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs font-bold text-black">
                          {format(selectedTime.time, "HH:mm")} -{" "}
                          {format(
                            addHours(selectedTime.time, estimatedHours),
                            "HH:mm",
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
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeline = () => {
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
  };

  return (
    <>
      {renderTimeline()}

      {/* Sheet para Caso Excepcional */}
      <ExceptionalCaseSheet
        open={isExceptionalCaseOpen}
        onOpenChange={setIsExceptionalCaseOpen}
        sedeId={sedeId}
      />
    </>
  );
}
