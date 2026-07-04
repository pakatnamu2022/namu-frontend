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
  PLANNING_VISUAL_STATE_COLORS,
  PLANNING_VISUAL_STATE_LABELS,
  getPlanningVisualState,
} from "../lib/workOrderPlanning.interface";
import {
  WORK_SCHEDULE,
  minutesToTimelinePosition,
} from "../lib/workOrderPlanning.constants";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  MousePointerClick,
  Package,
  Pencil,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useEffect, useRef, useReducer } from "react";
import { createPortal } from "react-dom";
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
import {
  Check,
  ChevronsUpDown,
  Loader2,
  MoveHorizontal,
  Eraser,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGetWorkOrderPlanning } from "../lib/workOrderPlanning.hook";
import { STATUS_WORK_ORDER } from "../../orden-trabajo/lib/workOrder.constants";

interface WorkerTimelineProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedDate: Date;
  data?: WorkOrderPlanningResource[];
  onPlanningClick?: (planning: WorkOrderPlanningResource) => void;
  onEdit?: (planning: WorkOrderPlanningResource) => void;
  onDelete?: (id: number) => void;
  permissions?: {
    canUpdate: boolean;
    canDelete: boolean;
  };
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
  readOnly?: boolean;
}

export function WorkerTimeline({
  open = true,
  onOpenChange,
  selectedDate,
  onPlanningClick,
  onEdit,
  onDelete,
  permissions,
  selectionMode = false,
  estimatedHours = 0,
  onTimeSelect,
  onEstimatedHoursChange,
  fullPage = false,
  sedeId,
  readOnly = false,
}: WorkerTimelineProps) {
  const [selectedTime, setSelectedTime] = useState<{
    time: Date;
    workerId: number;
  } | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{
    time: Date;
    workerId: number;
  } | null>(null);
  // Refs para el resize de la barra seleccionada
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartHoursRef = useRef(0);
  const timelineRectRef = useRef<DOMRect | null>(null);
  // Tooltip flotante que sigue al cursor mientras se hace resize del bloque azul,
  // para que se vea la hora de inicio/fin aunque el técnico esté abajo en la lista
  const [resizeTooltip, setResizeTooltip] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);
  // Tooltip flotante que sigue al cursor antes de hacer clic, para previsualizar
  // la hora de inicio/fin del bloque a ubicar
  const [hoverTooltip, setHoverTooltip] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);
  const [isExceptionalCaseOpen, setIsExceptionalCaseOpen] = useState(false);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>("");
  const [selectedWorkOrderData, setSelectedWorkOrderData] =
    useState<WorkOrderResource | null>(null);
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
        per_page: 10,
        status_id: [
          STATUS_WORK_ORDER.APERTURADO,
          STATUS_WORK_ORDER.RECEPCIONADO,
          STATUS_WORK_ORDER.EN_TRABAJO,
        ],
        sede_id: sedeId,
      },
      enabled: !!sedeId,
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

  // Orden de trabajo seleccionada: se guarda el objeto completo al momento de
  // seleccionarla para no depender de que siga presente en la lista paginada/
  // filtrada (que se recarga sin filtro al limpiar la búsqueda tras elegir).
  const selectedWorkOrder = selectedWorkOrderData;

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

  const effectiveSelectedItemId =
    filteredItems.length === 1 ? filteredItems[0].id : selectedItemId;

  // Horarios en minutos desde medianoche (definidos en workOrderPlanning.constants.ts)
  const {
    MORNING_START,
    MORNING_END,
    LUNCH_START,
    AFTERNOON_START,
    AFTERNOON_END,
  } = WORK_SCHEDULE;

  // Suma horas de trabajo reales a una fecha, saltando el almuerzo.
  // Ej: 11:00 + 3h = 17:24 (no 14:00), porque salta 13:00-14:24
  const addWorkHours = (start: Date, hours: number): Date => {
    let remainingMinutes = Math.round(hours * 60);
    let currentMinutes = start.getHours() * 60 + start.getMinutes();

    // Si empieza en almuerzo, avanzar al inicio de la tarde
    if (
      currentMinutes >= LUNCH_START &&
      currentMinutes < WORK_SCHEDULE.LUNCH_END
    ) {
      currentMinutes = WORK_SCHEDULE.LUNCH_END;
    }

    while (remainingMinutes > 0) {
      if (currentMinutes < LUNCH_START) {
        // Estamos en la mañana
        const minutesUntilLunch = LUNCH_START - currentMinutes;
        if (remainingMinutes <= minutesUntilLunch) {
          currentMinutes += remainingMinutes;
          remainingMinutes = 0;
        } else {
          remainingMinutes -= minutesUntilLunch;
          currentMinutes = WORK_SCHEDULE.LUNCH_END; // saltar almuerzo
        }
      } else {
        // Estamos en la tarde o más allá
        currentMinutes += remainingMinutes;
        remainingMinutes = 0;
      }
    }

    // Si cayó en el almuerzo, mover al inicio de la tarde
    if (
      currentMinutes > LUNCH_START &&
      currentMinutes < WORK_SCHEDULE.LUNCH_END
    ) {
      currentMinutes = WORK_SCHEDULE.LUNCH_END;
    }

    const result = new Date(start);
    result.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);
    return result;
  };

  const { data: workers = [] } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    sede_id: sedeId,
    sede$empresa_id: EMPRESA_AP.id,
  });

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const { data: ownPlanningData, refetch: refetchPlanning } =
    useGetWorkOrderPlanning({
      params: {
        per_page: 100,
        ...(sedeId && { workOrder$sede_id: sedeId }),
        planned_date: selectedDateStr,
      },
      enabled: !!sedeId,
    });

  const dayPlannings = (ownPlanningData?.data ?? []).filter((planning) => {
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
    return minutesToTimelinePosition(hours * 60 + minutes);
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

    // Redondear a 1 minuto
    mins = Math.round(mins);
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

  const formatDecimalHours = (hours: number | null | undefined): string => {
    if (hours == null || hours === 0) return "0min";
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const min = totalMinutes % 60;
    if (h === 0) return `${min}min`;
    if (min === 0) return `${h}h`;
    return `${h}h ${min}min`;
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
    const startHour = startTime.getHours();
    const startMin = startTime.getMinutes();
    const startTotalMin = startHour * 60 + startMin;

    // Si el día seleccionado es hoy, no permitir horas pasadas
    if (isSameDay(selectedDate, new Date())) {
      const now = new Date();
      const nowTotalMin = now.getHours() * 60 + now.getMinutes();
      if (startTotalMin < nowTotalMin) {
        return false;
      }
    }

    // Verificar que el inicio esté dentro del horario laboral (no en almuerzo)
    const startInMorning =
      startTotalMin >= MORNING_START && startTotalMin < MORNING_END;
    const startInAfternoon =
      startTotalMin >= AFTERNOON_START && startTotalMin <= AFTERNOON_END;

    if (!startInMorning && !startInAfternoon) {
      return false;
    }

    // Verificar conflictos con tareas existentes usando el fin real (saltando almuerzo)
    const endTimeForConflict = addWorkHours(startTime, estimatedHours);
    return !workerPlannings.some((p) => {
      if (!p.planned_start_datetime || !p.planned_end_datetime) return false;
      const planStart = parseISO(p.planned_start_datetime);
      const planEnd = parseISO(p.planned_end_datetime);
      return (
        (startTime >= planStart && startTime < planEnd) ||
        (endTimeForConflict > planStart && endTimeForConflict <= planEnd) ||
        (startTime <= planStart && endTimeForConflict >= planEnd)
      );
    });
  };

  // Calcula cuántas horas se derraman al día siguiente (overflow)
  const getOverflowHours = (startTime: Date, hours: number): number => {
    const endTime = addWorkHours(startTime, hours);
    const endTotalMin = endTime.getHours() * 60 + endTime.getMinutes();
    // Si la hora de fin es menor que la de inicio en minutos absolutos,
    // significa que pasó la medianoche (edge case extremo), lo ignoramos.
    // Solo nos interesa si supera AFTERNOON_END (18:00)
    if (endTotalMin > AFTERNOON_END) {
      return (endTotalMin - AFTERNOON_END) / 60;
    }
    return 0;
  };

  // Devuelve la hora de fin del último bloque del trabajador en este día,
  // o null si no tiene bloques.
  const getLastBlockEnd = (
    workerPlannings: WorkOrderPlanningResource[],
  ): Date | null => {
    const sorted = [...workerPlannings]
      .filter((p) => p.planned_end_datetime)
      .sort(
        (a, b) =>
          parseISO(b.planned_end_datetime!).getTime() -
          parseISO(a.planned_end_datetime!).getTime(),
      );
    if (sorted.length === 0) return null;
    return parseISO(sorted[0].planned_end_datetime!);
  };

  const handleTimelineClick = (
    event: React.MouseEvent<HTMLDivElement>,
    workerId: number,
    workerPlannings: WorkOrderPlanningResource[],
  ) => {
    if (!selectionMode) return;
    // No permitir elegir horario hasta que haya una OT seleccionada
    if (!selectedWorkOrderId) return;
    // Si ya hay un slot seleccionado, no permitir reposicionar sin usar el botón "Mover"
    if (selectedTime) return;

    const lastEnd = getLastBlockEnd(workerPlannings);

    if (lastEnd) {
      // Si el último bloque ya termina en 18:00 o después, la barra está llena
      const lastEndTotalMin = lastEnd.getHours() * 60 + lastEnd.getMinutes();
      if (lastEndTotalMin >= AFTERNOON_END) return;

      // Si el último bloque quedó en el pasado (hora actual > fin del último bloque),
      // partir desde la hora actual (tiempo muerto permitido)
      let effectiveStart = lastEnd;
      if (isSameDay(selectedDate, new Date())) {
        const now = new Date();
        if (now > lastEnd) {
          effectiveStart = now;
        }
      }

      // Si el inicio cae en almuerzo, saltar al fin del almuerzo
      const effectiveStartMin =
        effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
      if (
        effectiveStartMin >= LUNCH_START &&
        effectiveStartMin < WORK_SCHEDULE.LUNCH_END
      ) {
        effectiveStart = new Date(effectiveStart);
        effectiveStart.setHours(
          Math.floor(WORK_SCHEDULE.LUNCH_END / 60),
          WORK_SCHEDULE.LUNCH_END % 60,
          0,
          0,
        );
      }

      // Tiene bloques: el inicio es el fin del último bloque o la hora actual (lo que sea mayor)
      if (isSlotAvailable(effectiveStart, workerPlannings)) {
        setSelectedTime({ time: effectiveStart, workerId });
        setHoverTooltip(null);
      }
    } else {
      // Sin bloques: libre desde hora actual
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const position = (clickX / rect.width) * 100;
      const clickedTime = positionToTime(position);
      if (clickedTime && isSlotAvailable(clickedTime, workerPlannings)) {
        setSelectedTime({ time: clickedTime, workerId });
        setHoverTooltip(null);
      }
    }
  };

  // ── Resize handlers ───────────────────────────────────────────────────────
  const handleResizeStart = (
    e: React.MouseEvent,
    timelineEl: HTMLDivElement,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartHoursRef.current = estimatedHours;
    timelineRectRef.current = timelineEl.getBoundingClientRect();

    if (selectedTime) {
      setResizeTooltip({
        x: e.clientX,
        y: e.clientY,
        label: `${format(selectedTime.time, "HH:mm")} - ${format(
          addWorkHours(selectedTime.time, estimatedHours),
          "HH:mm",
        )}`,
      });
    }

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current || !timelineRectRef.current || !selectedTime)
        return;
      const rect = timelineRectRef.current;
      const deltaX = ev.clientX - dragStartXRef.current;
      const deltaFraction = deltaX / rect.width;

      // Convertir fracción de timeline a horas (el timeline total = 8 horas laborales aprox)
      // Mañana: 0-50% = 5h  |  Almuerzo: 50-60% = skip  |  Tarde: 60-100% = 3.6h
      const totalWorkHours =
        (WORK_SCHEDULE.MORNING_END -
          WORK_SCHEDULE.MORNING_START +
          WORK_SCHEDULE.AFTERNOON_END -
          WORK_SCHEDULE.AFTERNOON_START) /
        60;
      const deltaHours = deltaFraction * totalWorkHours;

      let newHours = Math.max(0.5, dragStartHoursRef.current + deltaHours);
      // Redondear a 1 minuto exacto
      newHours = Math.round(newHours * 60) / 60;

      onEstimatedHoursChange?.(newHours);

      setResizeTooltip({
        x: ev.clientX,
        y: ev.clientY,
        label: `${format(selectedTime.time, "HH:mm")} - ${format(
          addWorkHours(selectedTime.time, newHours),
          "HH:mm",
        )}`,
      });
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      setResizeTooltip(null);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleTimelineHover = (
    event: React.MouseEvent<HTMLDivElement>,
    workerId: number,
    workerPlannings: WorkOrderPlanningResource[],
  ) => {
    if (!selectionMode) return;
    // No mostrar preview de horario hasta que haya una OT seleccionada
    if (!selectedWorkOrderId) return;
    // Si ya hay un slot seleccionado, no mostrar hover (solo se mueve con el botón)
    if (selectedTime) return;

    const lastEnd = getLastBlockEnd(workerPlannings);

    if (lastEnd) {
      // Si el último bloque ya termina en 18:00 o después, la barra está llena
      const lastEndTotalMin = lastEnd.getHours() * 60 + lastEnd.getMinutes();
      if (lastEndTotalMin >= AFTERNOON_END) {
        setHoveredSlot(null);
        setHoverTooltip(null);
        return;
      }

      // Si el último bloque quedó en el pasado (hora actual > fin del último bloque),
      // partir desde la hora actual (tiempo muerto permitido)
      let effectiveStart = lastEnd;
      if (isSameDay(selectedDate, new Date())) {
        const now = new Date();
        if (now > lastEnd) {
          effectiveStart = now;
        }
      }

      // Si el inicio cae en almuerzo, saltar al fin del almuerzo
      const effectiveStartMin =
        effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
      if (
        effectiveStartMin >= LUNCH_START &&
        effectiveStartMin < WORK_SCHEDULE.LUNCH_END
      ) {
        effectiveStart = new Date(effectiveStart);
        effectiveStart.setHours(
          Math.floor(WORK_SCHEDULE.LUNCH_END / 60),
          WORK_SCHEDULE.LUNCH_END % 60,
          0,
          0,
        );
      }

      // Tiene bloques: preview fijo al fin del último bloque o la hora actual (lo que sea mayor)
      if (isSlotAvailable(effectiveStart, workerPlannings)) {
        setHoveredSlot({ time: effectiveStart, workerId });
        setHoverTooltip({
          x: event.clientX,
          y: event.clientY,
          label: `${format(effectiveStart, "hh:mm a")} - ${format(
            addWorkHours(effectiveStart, estimatedHours),
            "hh:mm a",
          )}`,
        });
      } else {
        setHoveredSlot(null);
        setHoverTooltip(null);
      }
    } else {
      // Sin bloques: preview libre siguiendo el cursor
      const rect = event.currentTarget.getBoundingClientRect();
      const hoverX = event.clientX - rect.left;
      const position = (hoverX / rect.width) * 100;
      const hoveredTime = positionToTime(position);
      if (hoveredTime && isSlotAvailable(hoveredTime, workerPlannings)) {
        setHoveredSlot({ time: hoveredTime, workerId });
        setHoverTooltip({
          x: event.clientX,
          y: event.clientY,
          label: `${format(hoveredTime, "hh:mm a")} - ${format(
            addWorkHours(hoveredTime, estimatedHours),
            "hh:mm a",
          )}`,
        });
      } else {
        setHoveredSlot(null);
        setHoverTooltip(null);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (
      selectedTime &&
      onTimeSelect &&
      selectedWorkOrderId &&
      effectiveSelectedItemId !== null &&
      activeGroup !== null
    ) {
      // Obtener la descripción del item seleccionado
      const selectedItem = filteredItems.find(
        (item) => item.id === effectiveSelectedItemId,
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
      setHoverTooltip(null);
      setResizeTooltip(null);
      setSelectedWorkOrderId("");
      setSelectedWorkOrderData(null);
      setSelectedGroup(null);
      setSelectedItemId(null);
    }
  };

  const handleItemSelect = (itemId: number) => {
    // Si se selecciona el mismo item, deseleccionarlo; si no, seleccionar el nuevo
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  };

  // Limpia la OT, grupo, item, duración y horario seleccionados para volver a empezar
  const handleClearSelection = () => {
    setSelectedWorkOrderId("");
    setSelectedWorkOrderData(null);
    setSelectedGroup(null);
    setSelectedItemId(null);
    setSelectedTime(null);
    setHoveredSlot(null);
    setHoverTooltip(null);
    setResizeTooltip(null);
    setSearchWorkOrder("");
    onEstimatedHoursChange?.(1);
  };

  const canConfirm =
    selectedTime &&
    selectedWorkOrderId &&
    effectiveSelectedItemId !== null &&
    activeGroup !== null;

  // Posición de la hora actual en el timeline (solo relevante si selectedDate es hoy)
  const nowTimelinePosition = useMemo(() => {
    if (!isSameDay(selectedDate, new Date())) return null;
    const now = new Date();
    return minutesToTimelinePosition(now.getHours() * 60 + now.getMinutes());
  }, [selectedDate]);

  const timeMarkers = [
    { time: "8:00", position: timeToPosition(8, 0) },
    { time: "9:00", position: timeToPosition(9, 0) },
    { time: "10:00", position: timeToPosition(10, 0) },
    { time: "11:00", position: timeToPosition(11, 0) },
    { time: "12:00", position: timeToPosition(12, 0) },
    { time: "13:00", position: timeToPosition(13, 0) },
    { time: "14:24", position: timeToPosition(14, 24) },
    { time: "15:00", position: timeToPosition(15, 0) },
    { time: "16:00", position: timeToPosition(16, 0) },
    { time: "17:00", position: timeToPosition(17, 0) },
    { time: "18:00", position: timeToPosition(18, 0) },
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
            onClick={() => refetchPlanning()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          {!readOnly && (
            <Button
              variant="outline"
              onClick={() => setIsExceptionalCaseOpen(true)}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Caso Excepcional
            </Button>
          )}
        </div>
      </div>

      {selectionMode && onEstimatedHoursChange && (
        <div className="relative space-y-4 p-6 bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl shadow-sm">
          {selectedWorkOrderId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="absolute right-3 top-3 gap-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60"
            >
              <Eraser className="h-3.5 w-3.5" />
              Limpiar
            </Button>
          )}
          {/* Orden de Trabajo + Duración (columna izquierda) -> Trabajo a Realizar (columna derecha, proporcional) */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">
            <div className="space-y-4">
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
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {selectedWorkOrder?.correlative}
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
                  <PopoverContent
                    className="w-[400px] p-0 overflow-hidden"
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Buscar por correlativo o placa..."
                        value={searchWorkOrder}
                        onValueChange={setSearchWorkOrder}
                      />
                      <CommandList className="max-h-60 overflow-y-auto">
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
                                setSelectedWorkOrderData(wo);
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
                                  {wo.correlative}
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

              <div className="space-y-2">
                <Label
                  htmlFor="estimated-hours"
                  className="text-sm font-semibold text-slate-700"
                >
                  Duración del trabajo
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="estimated-hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={Number(estimatedHours.toFixed(2))}
                    onChange={(e) =>
                      onEstimatedHoursChange(
                        Math.round(Number(e.target.value) * 100) / 100,
                      )
                    }
                    className="w-24 text-center font-semibold"
                  />
                  <span className="text-sm text-slate-600 font-medium">
                    horas
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                Trabajo a Realizar
              </Label>

              {!selectedWorkOrder ? (
                <div className="flex items-center justify-center min-h-24 rounded-lg border border-dashed border-slate-300 bg-white/50 px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Selecciona una orden de trabajo para ver los trabajos
                    disponibles
                  </p>
                </div>
              ) : (
                <>
                  {/* Selector de Grupo si hay más de uno */}
                  {availableGroups.length > 1 && (
                    <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                      <Label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" />
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
                              <div
                                key={group}
                                className="flex items-center space-x-2"
                              >
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
                  {activeGroup !== null && (
                    <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-200">
                      <RadioGroup
                        value={effectiveSelectedItemId?.toString() || ""}
                        onValueChange={(value) =>
                          setSelectedItemId(Number(value))
                        }
                      >
                        <div className="space-y-1 max-h-56 overflow-y-auto">
                          {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                              <div
                                key={item.id}
                                className={`flex items-start gap-2 px-2 py-3 rounded border cursor-pointer transition-colors ${
                                  effectiveSelectedItemId === item.id
                                    ? "bg-blue-50 border-blue-300"
                                    : "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                                }`}
                                onClick={() => handleItemSelect(item.id)}
                              >
                                <RadioGroupItem
                                  value={item.id.toString()}
                                  id={`item-${item.id}`}
                                  className="mt-0.5 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-semibold bg-linear-to-r from-blue-50 to-indigo-50 px-1.5 py-0"
                                    >
                                      {item.type_planning.description}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-semibold bg-linear-to-r from-blue-50 to-indigo-50 px-1.5 py-0"
                                    >
                                      {item.type_operation_name}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium text-slate-800 leading-snug mt-0.5 truncate">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-3">
                              No hay items disponibles para este grupo
                            </p>
                          )}
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectionMode &&
        selectedTime &&
        (() => {
          const overflowHours = getOverflowHours(
            selectedTime.time,
            estimatedHours,
          );
          if (overflowHours <= 0) return null;
          const overflowMins = Math.round(overflowHours * 60);
          const overflowLabel =
            overflowMins % 60 === 0
              ? `${overflowMins / 60}h`
              : overflowMins < 60
                ? `${overflowMins}min`
                : `${Math.floor(overflowMins / 60)}h ${overflowMins % 60}min`;
          return (
            <Alert className="border-orange-300 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700 font-medium">
                El horario excede las 18:00. <strong>{overflowLabel}</strong>{" "}
                continuará al día siguiente desde las 08:00.
              </AlertDescription>
            </Alert>
          );
        })()}

      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg flex-wrap">
        {(
          ["planned", "paused", "in_progress", "overtime", "completed"] as const
        ).map((state) => (
          <div key={state} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded border-2 ${PLANNING_VISUAL_STATE_COLORS[state].bg} ${PLANNING_VISUAL_STATE_COLORS[state].border}`}
            />
            <span className="text-sm">
              {PLANNING_VISUAL_STATE_LABELS[state]}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-red-500 border-red-700" />
          <span className="text-sm">Exceso real</span>
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
        {workerPlannings.map(({ worker, plannings }) => {
          const hasExceptional = plannings.some((p) => p.type === "external");
          return (
            <div key={worker.id} className="flex items-center gap-3">
              <div className="w-48 shrink-0">
                <h3 className="font-semibold text-sm">{worker.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {worker.specialty}
                </p>
              </div>

              <div className="flex-1">
                <div
                  className={`timeline-row relative rounded border ${
                    hasExceptional ? "h-32" : "h-20"
                  } ${
                    selectionMode
                      ? selectedWorkOrderId
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
                      : ""
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
                  onMouseLeave={() => {
                    if (selectionMode) {
                      setHoveredSlot(null);
                      setHoverTooltip(null);
                    }
                  }}
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

                  {/* Zona de horas pasadas (solo si es hoy) */}
                  {nowTimelinePosition !== null && nowTimelinePosition > 0 && (
                    <div
                      className="absolute top-0 bottom-0 bg-slate-400/20 border-r-2 border-slate-400/50 z-10 pointer-events-none"
                      style={{ left: 0, width: `${nowTimelinePosition}%` }}
                    />
                  )}

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
                  {plannings.map((planning) => {
                    const startPos = calculatePosition(
                      planning.planned_start_datetime!,
                    );
                    const width = calculateWidth(planning);
                    const isExternal = planning.type === "external";

                    // Calcular posición vertical: si hay excepcionales, separar en dos filas
                    // Internos: fila superior (~30%), Externos: fila inferior (~72%)
                    // Si no hay excepcionales: todos centrados en 50%
                    const verticalTop = hasExceptional
                      ? isExternal
                        ? "72%"
                        : "30%"
                      : "50%";

                    // Calcular overtime: tiempo real excedió el planificado
                    const hasOvertime =
                      planning.planned_end_datetime &&
                      planning.actual_end_datetime &&
                      parseISO(planning.actual_end_datetime) >
                        parseISO(planning.planned_end_datetime);
                    const overtimeStartPos = hasOvertime
                      ? calculatePosition(planning.planned_end_datetime!)
                      : 0;
                    const overtimeEndPos = hasOvertime
                      ? calculatePosition(planning.actual_end_datetime!)
                      : 0;
                    const overtimeWidth = hasOvertime
                      ? overtimeEndPos - overtimeStartPos
                      : 0;

                    const visibleEdit =
                      permissions?.canUpdate && planning.status === "planned";
                    const visibleDelete =
                      permissions?.canDelete && planning.status === "planned";

                    return (
                      <HoverCard key={planning.id} openDelay={150}>
                        <HoverCardTrigger asChild>
                          <div
                            className="absolute cursor-pointer"
                            style={{
                              left: `${startPos}%`,
                              width: `${width}%`,
                              top: verticalTop,
                              transform: "translateY(-50%)",
                            }}
                            onClick={() => onPlanningClick?.(planning)}
                          >
                            {/* Barra única - color según estado visual */}
                            <div
                              className={`h-5 rounded border-2 ${
                                isExternal
                                  ? "border-amber-500 bg-amber-200"
                                  : `${PLANNING_VISUAL_STATE_COLORS[getPlanningVisualState(planning)].border} ${PLANNING_VISUAL_STATE_COLORS[getPlanningVisualState(planning)].bg}`
                              }`}
                            ></div>

                            {/* Texto centrado */}
                            <div className="absolute top-0 left-0 right-0 h-5 flex items-center justify-center pointer-events-none z-10">
                              <div className="flex items-center gap-1 px-1">
                                <span
                                  className={`text-[10px] font-medium truncate ${isExternal ? "text-amber-900" : PLANNING_VISUAL_STATE_COLORS[getPlanningVisualState(planning)].text}`}
                                >
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

                            {/* Barra de tiempo excedido (overtime) - solo visual, no afecta interacción */}
                            {hasOvertime && overtimeWidth > 0 && (
                              <div
                                className="absolute top-0 h-5 pointer-events-none z-40"
                                style={{
                                  left: `${overtimeWidth > 0 ? ((overtimeStartPos - startPos) / width) * 100 : 0}%`,
                                  width: `${(overtimeWidth / width) * 100}%`,
                                }}
                              >
                                <div className="h-full bg-red-500 border-2 border-red-700 rounded-r opacity-80 flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-white px-0.5 truncate">
                                    +
                                    {Math.round(
                                      (parseISO(
                                        planning.actual_end_datetime!,
                                      ).getTime() -
                                        parseISO(
                                          planning.planned_end_datetime!,
                                        ).getTime()) /
                                        60000,
                                    )}
                                    m
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent
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
                                <p>
                                  {planning.estimated_hours != null
                                    ? formatDecimalHours(
                                        planning.estimated_hours,
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Real:
                                </span>
                                <p>
                                  {planning.actual_hours != null
                                    ? formatDecimalHours(planning.actual_hours)
                                    : "N/A"}
                                </p>
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
                              className={`${PLANNING_VISUAL_STATE_COLORS[getPlanningVisualState(planning)].bg} ${PLANNING_VISUAL_STATE_COLORS[getPlanningVisualState(planning)].text} hover:${PLANNING_VISUAL_STATE_COLORS[getPlanningVisualState(planning)].bg}`}
                            >
                              {
                                PLANNING_VISUAL_STATE_LABELS[
                                  getPlanningVisualState(planning)
                                ]
                              }
                            </Badge>
                            {(visibleEdit || visibleDelete) && (
                              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                                {visibleEdit && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onEdit?.(planning)}
                                    tooltip="Editar planificación"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {visibleDelete && (
                                  <DeleteButton
                                    onClick={() => onDelete?.(planning.id)}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
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
                              addWorkHours(hoveredSlot.time, estimatedHours),
                            ) - calculatePositionFromDate(hoveredSlot.time)
                          }%`,
                        }}
                      ></div>
                    )}

                  {/* Selección confirmada (con resize y división por almuerzo) */}
                  {selectionMode &&
                    selectedTime &&
                    selectedTime.workerId === worker.id &&
                    (() => {
                      const startMin =
                        selectedTime.time.getHours() * 60 +
                        selectedTime.time.getMinutes();
                      const endTime = addWorkHours(
                        selectedTime.time,
                        estimatedHours,
                      );
                      const endMin =
                        endTime.getHours() * 60 + endTime.getMinutes();
                      const crossesLunch =
                        startMin < LUNCH_START &&
                        endMin > WORK_SCHEDULE.LUNCH_END;

                      const startPos = calculatePositionFromDate(
                        selectedTime.time,
                      );
                      const endPos = calculatePositionFromDate(endTime);

                      if (crossesLunch) {
                        // Bloque mañana: inicio → almuerzo
                        const lunchStartDate = new Date(selectedTime.time);
                        lunchStartDate.setHours(
                          Math.floor(LUNCH_START / 60),
                          LUNCH_START % 60,
                          0,
                          0,
                        );
                        const lunchEndDate = new Date(selectedTime.time);
                        lunchEndDate.setHours(
                          Math.floor(WORK_SCHEDULE.LUNCH_END / 60),
                          WORK_SCHEDULE.LUNCH_END % 60,
                          0,
                          0,
                        );
                        const morningEndPos =
                          calculatePositionFromDate(lunchStartDate);
                        const afternoonStartPos =
                          calculatePositionFromDate(lunchEndDate);

                        return (
                          <>
                            {/* Segmento mañana */}
                            <div
                              className="absolute top-0 h-full bg-blue-500 opacity-50 border-2 border-primary z-30"
                              style={{
                                left: `${startPos}%`,
                                width: `${morningEndPos - startPos}%`,
                              }}
                            >
                              <div className="flex items-center justify-center h-full pointer-events-none">
                                <span className="text-xs font-bold text-black">
                                  {format(selectedTime.time, "HH:mm")} -{" "}
                                  {format(lunchStartDate, "HH:mm")}
                                </span>
                              </div>
                              {/* Botón mover */}
                              <button
                                className="absolute left-1 top-1/2 -translate-y-1/2 z-50 flex items-center gap-1 bg-white/90 hover:bg-white border border-primary text-primary rounded px-1.5 py-0.5 text-[10px] font-bold shadow cursor-pointer"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTime(null);
                                  setHoveredSlot(null);
                                }}
                              >
                                <MoveHorizontal className="h-3 w-3" />
                                Mover
                              </button>
                            </div>
                            {/* Segmento tarde */}
                            <div
                              className="absolute top-0 h-full bg-blue-500 opacity-50 border-2 border-primary z-30"
                              style={{
                                left: `${afternoonStartPos}%`,
                                width: `${endPos - afternoonStartPos}%`,
                                cursor: "ew-resize",
                              }}
                              ref={(el) => {
                                if (el) {
                                  (el as any)._timelineEl = el.closest(
                                    ".timeline-row",
                                  ) as HTMLDivElement;
                                }
                              }}
                            >
                              <div className="flex items-center justify-center h-full">
                                <span className="text-xs font-bold text-black">
                                  {format(lunchEndDate, "HH:mm")} -{" "}
                                  {format(endTime, "HH:mm")}
                                </span>
                              </div>
                              {/* Handle de resize */}
                              <div
                                className="absolute right-0 top-0 h-full w-3 cursor-ew-resize z-40 flex items-center justify-center hover:bg-primary/30"
                                onMouseDown={(e) => {
                                  const timelineEl = e.currentTarget.closest(
                                    ".timeline-row",
                                  ) as HTMLDivElement;
                                  if (timelineEl)
                                    handleResizeStart(e, timelineEl);
                                }}
                              >
                                <div className="w-1 h-6 bg-primary rounded-full" />
                              </div>
                            </div>
                          </>
                        );
                      }

                      // Caso overflow: parte dentro del día (azul) + parte fuera (naranja hasta el borde)
                      const overflowHours = getOverflowHours(
                        selectedTime.time,
                        estimatedHours,
                      );
                      const hasOverflow = overflowHours > 0;

                      // endPos clampado al 100% del timeline (18:00)
                      const clampedEndPos = Math.min(endPos, 100);
                      // posición de las 18:00 en el timeline
                      const afternoonEndPos = timeToPosition(18, 0);

                      if (hasOverflow) {
                        return (
                          <>
                            {/* Segmento dentro del horario (azul) */}
                            <div
                              className="absolute top-0 h-full bg-blue-500 opacity-50 border-2 border-primary z-30"
                              style={{
                                left: `${startPos}%`,
                                width: `${afternoonEndPos - startPos}%`,
                              }}
                            >
                              <div className="flex items-center justify-center h-full pointer-events-none">
                                <span className="text-xs font-bold text-black">
                                  {format(selectedTime.time, "HH:mm")} - 18:00
                                </span>
                              </div>
                              {/* Botón mover */}
                              <button
                                className="absolute left-1 top-1/2 -translate-y-1/2 z-50 flex items-center gap-1 bg-white/90 hover:bg-white border border-primary text-primary rounded px-1.5 py-0.5 text-[10px] font-bold shadow cursor-pointer"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTime(null);
                                  setHoveredSlot(null);
                                }}
                              >
                                <MoveHorizontal className="h-3 w-3" />
                                Mover
                              </button>
                            </div>
                            {/* Segmento overflow (naranja, hasta el borde del timeline) */}
                            <div
                              className="absolute top-0 h-full bg-orange-400 opacity-60 border-2 border-orange-600 border-dashed z-30"
                              style={{
                                left: `${afternoonEndPos}%`,
                                width: `${clampedEndPos - afternoonEndPos}%`,
                                cursor: "ew-resize",
                              }}
                            >
                              <div className="flex items-center justify-center h-full pointer-events-none">
                                <span className="text-[10px] font-bold text-orange-900 whitespace-nowrap">
                                  +{Math.round(overflowHours * 60)}min →
                                </span>
                              </div>
                              {/* Handle de resize */}
                              <div
                                className="absolute right-0 top-0 h-full w-3 cursor-ew-resize z-40 flex items-center justify-center hover:bg-orange-500/30"
                                onMouseDown={(e) => {
                                  const timelineEl = e.currentTarget.closest(
                                    ".timeline-row",
                                  ) as HTMLDivElement;
                                  if (timelineEl)
                                    handleResizeStart(e, timelineEl);
                                }}
                              >
                                <div className="w-1 h-6 bg-orange-600 rounded-full pointer-events-none" />
                              </div>
                            </div>
                          </>
                        );
                      }

                      return (
                        <div
                          className="absolute top-0 h-full bg-blue-500 opacity-50 border-2 border-primary z-30"
                          style={{
                            left: `${startPos}%`,
                            width: `${endPos - startPos}%`,
                          }}
                        >
                          <div className="flex items-center justify-center gap-2 h-full pointer-events-none">
                            <span className="text-xs font-bold text-black">
                              {format(selectedTime.time, "HH:mm")} -{" "}
                              {format(endTime, "HH:mm")}
                            </span>
                          </div>
                          {/* Botón mover */}
                          <button
                            className="absolute left-1 top-1/2 -translate-y-1/2 z-50 flex items-center gap-1 bg-white/90 hover:bg-white border border-primary text-primary rounded px-1.5 py-0.5 text-[10px] font-bold shadow cursor-pointer"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTime(null);
                              setHoveredSlot(null);
                            }}
                          >
                            <MoveHorizontal className="h-3 w-3" />
                            Mover
                          </button>
                          {/* Handle de resize */}
                          <div
                            className="absolute right-0 top-0 h-full w-3 cursor-ew-resize z-40 flex items-center justify-center hover:bg-primary/30"
                            onMouseDown={(e) => {
                              const timelineEl = e.currentTarget.closest(
                                ".timeline-row",
                              ) as HTMLDivElement;
                              if (timelineEl) handleResizeStart(e, timelineEl);
                            }}
                          >
                            <div className="w-1 h-6 bg-primary rounded-full pointer-events-none" />
                          </div>
                        </div>
                      );
                    })()}

                  {/* Botón flotante de confirmación, arriba y fuera del bloque azul,
                      para no tener que subir hasta el panel superior */}
                  {selectionMode &&
                    selectedTime &&
                    selectedTime.workerId === worker.id &&
                    (() => {
                      const confirmEndTime = addWorkHours(
                        selectedTime.time,
                        estimatedHours,
                      );
                      const confirmStartPos = calculatePositionFromDate(
                        selectedTime.time,
                      );
                      const confirmEndPos = Math.min(
                        calculatePositionFromDate(confirmEndTime),
                        100,
                      );
                      const confirmCenterPos =
                        (confirmStartPos + confirmEndPos) / 2;
                      const fmt = (d: Date) =>
                        `${format(d, "h")}${format(d, "a").toLowerCase()}`;

                      return (
                        <button
                          className={`absolute -top-9 z-50 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-lg whitespace-nowrap ${
                            canConfirm
                              ? "bg-primary text-white cursor-pointer animate-pulse hover:animate-none"
                              : "bg-slate-300 text-slate-500 cursor-not-allowed"
                          }`}
                          style={{ left: `${confirmCenterPos}%` }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canConfirm) handleConfirmSelection();
                          }}
                          disabled={!canConfirm}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Confirmar ({fmt(selectedTime.time)} -{" "}
                          {fmt(confirmEndTime)})
                        </button>
                      );
                    })()}

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
          );
        })}
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
      {isExceptionalCaseOpen && (
        <ExceptionalCaseSheet
          open={isExceptionalCaseOpen}
          onOpenChange={setIsExceptionalCaseOpen}
          sedeId={sedeId}
        />
      )}

      {/* Tooltip flotante que sigue al cursor antes de ubicar el bloque (preview) */}
      {hoverTooltip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-100 pointer-events-none px-3 py-1.5 rounded-lg shadow-lg border-2 border-blue-400 bg-white text-blue-600 text-sm font-bold whitespace-nowrap"
            style={{
              left: hoverTooltip.x + 16,
              top: hoverTooltip.y - 36,
            }}
          >
            {hoverTooltip.label}
          </div>,
          document.body,
        )}

      {/* Tooltip flotante que sigue al cursor mientras se arrastra el resize */}
      {resizeTooltip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-100 pointer-events-none px-3 py-1.5 rounded-lg shadow-lg border-2 border-primary bg-white text-primary text-sm font-bold whitespace-nowrap"
            style={{
              left: resizeTooltip.x + 16,
              top: resizeTooltip.y - 36,
            }}
          >
            {resizeTooltip.label}
          </div>,
          document.body,
        )}
    </>
  );
}
