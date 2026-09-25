"use client";

import { useMemo, useState, useCallback, useEffect, useRef, type DragEvent, type ReactNode } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  format,
  differenceInMonths,
  getDaysInMonth,
  startOfMonth,
} from "date-fns";
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureItem,
  GanttDependencyArrows,
  GanttToday,
  useGanttContext,
  GANTT_ROW_HEIGHT,
  type GanttFeature,
  type GanttStatus,
  type Range,
} from "@/components/ui/gantt";
import { ScrumSprintResource } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.interface";
import {
  ScrumItemResource,
  ScrumItemResponse,
  ScrumItemStatus,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";
import {
  updateScrumItem,
  reorderScrumItems,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.actions";
import { STATUS_LABEL } from "@/features/gp/tics/pm/pm.constants";
import { errorToast, successToast, getErrorMessage } from "@/core/core.function";
import { addWorkingDays, countWorkingDays, nextWorkingDay } from "../lib/workingHours";

const STATUS_HEX: Record<ScrumItemStatus, string> = {
  backlog: "#94a3b8",
  por_hacer: "#60a5fa",
  en_progreso: "#fbbf24",
  en_revision: "#c084fc",
  hecho: "#34d399",
};

function parseDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  const parts = s.split("T")[0].split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// El Gantt (gantt.tsx) calcula ancho de barra y duración con `endAt` como
// límite EXCLUSIVO (differenceInDays sin +1), pero due_date en nuestro
// dominio es el último día INCLUSIVE de trabajo. Sin esta conversión, una
// tarea de un solo día (start == due) se dibujaba con 0 días de ancho, y una
// de 2 días (28→29) se veía de solo 1 columna: la barra terminaba un día
// antes de lo que decían sus fechas. Toda lectura/escritura de endAt<->due_date
// pasa por este par de funciones para no reintroducir el desfase.
function dueDateToEndAt(due: Date): Date {
  return addDays(due, 1);
}

function endAtToDueDate(endAt: Date): Date {
  return addDays(endAt, -1);
}

// Calcula el nuevo orden de ids de un sprint tras soltar `draggedIds` justo
// antes/después de `targetId`. `draggedIds` puede traer varios ids (arrastre
// múltiple): se sacan de su posición actual y se insertan como bloque,
// conservando el orden relativo que ya traían entre ellos.
function computeReorderedIds(
  currentIds: number[],
  draggedIds: number[],
  targetId: number,
  position: "before" | "after",
): number[] {
  const draggedSet = new Set(draggedIds);
  const remaining = currentIds.filter((id) => !draggedSet.has(id));
  const targetIndex = remaining.indexOf(targetId);
  if (targetIndex === -1) return currentIds;
  const insertAt = position === "before" ? targetIndex : targetIndex + 1;
  const draggedInOriginalOrder = currentIds.filter((id) => draggedSet.has(id));
  return [
    ...remaining.slice(0, insertAt),
    ...draggedInOriginalOrder,
    ...remaining.slice(insertAt),
  ];
}

function makeGanttStatus(status: ScrumItemStatus): GanttStatus {
  return { id: status, name: STATUS_LABEL[status], color: STATUS_HEX[status] };
}

function toFeature(item: ScrumItemResource, startAt: Date, endAt: Date): GanttFeature {
  return {
    id: item.id.toString(),
    name: item.title,
    startAt,
    endAt,
    status: makeGanttStatus(item.status),
    itemType: item.type,
    parentId: item.parent_id != null ? item.parent_id.toString() : undefined,
    hasPredecessor: item.predecessor_id != null,
    predecessorId: item.predecessor_id != null ? item.predecessor_id.toString() : undefined,
  };
}

const RANGE_LABELS: Record<Range, string> = {
  daily: "Día",
  weekly: "Semana",
  monthly: "Mes",
  quarterly: "Trimestre",
  semiannual: "Semestre",
  yearly: "Año",
};

const RANGES: Range[] = ["daily", "weekly", "monthly", "quarterly", "semiannual", "yearly"];

interface GanttToolbarProps {
  range: Range;
  zoom: number;
  onRangeChange: (r: Range) => void;
  onZoomChange: (z: number) => void;
  onGoToToday: () => void;
  onGoToWeek: () => void;
  onGoToMonth: () => void;
  children?: ReactNode;
}

function GanttToolbar({
  range,
  zoom,
  onRangeChange,
  onZoomChange,
  onGoToToday,
  onGoToWeek,
  onGoToMonth,
  children,
}: GanttToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 border-b bg-background shrink-0 flex-wrap">
      <div className="flex items-center gap-0.5">
        <span className="text-xs text-muted-foreground mr-1">Escala:</span>
        {RANGES.map((r) => (
          <Button
            key={r}
            variant={range === r ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => onRangeChange(r)}
          >
            {RANGE_LABELS[r]}
          </Button>
        ))}
      </div>

      <div className="w-px h-5 bg-border" />

      <div className="flex items-center gap-0.5">
        <span className="text-xs text-muted-foreground mr-1">Zoom:</span>
        {[50, 100, 150].map((z) => (
          <Button
            key={z}
            variant={zoom === z ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => onZoomChange(z)}
          >
            {z}%
          </Button>
        ))}
      </div>

      <div className="w-px h-5 bg-border" />

      <div className="flex items-center gap-0.5">
        <span className="text-xs text-muted-foreground mr-1">Ir a:</span>
        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={onGoToToday}>
          Hoy
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={onGoToWeek}>
          Esta semana
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={onGoToMonth}>
          Este mes
        </Button>
      </div>

      {children && (
        <>
          <div className="w-px h-5 bg-border" />
          {children}
        </>
      )}
    </div>
  );
}

// Buscador que NO filtra la lista (perderías el contexto de sprint/orden):
// solo te dice dónde está una tarea/historia y te lleva ahí, resaltándola un
// momento.
function GanttSearchBox({
  features,
  onSelect,
}: {
  features: GanttFeature[];
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return features.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [features, query]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative flex items-center gap-1.5">
      <SearchIcon className="size-3.5 text-muted-foreground shrink-0" />
      <input
        className="h-7 w-48 rounded-md border bg-transparent px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
        placeholder="Buscar tarea o historia..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches.length > 0) handleSelect(matches[0].id);
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && query && (
        <div className="absolute top-full left-0 z-30 mt-1 w-64 max-h-64 overflow-auto rounded-md border bg-popover shadow-md">
          {matches.length === 0 ? (
            <div className="px-2.5 py-2 text-xs text-muted-foreground">Sin resultados</div>
          ) : (
            matches.map((f) => (
              <button
                key={f.id}
                type="button"
                className="block w-full truncate px-2.5 py-1.5 text-left text-xs hover:bg-muted"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(f.id)}
              >
                {f.itemType !== "historia" && "↳ "}
                {f.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Rendered inside GanttProvider to access scroll context
function GanttFocusHandler({
  allFeatures,
  focusItemId,
  onFocused,
}: {
  allFeatures: GanttFeature[];
  focusItemId?: number | null;
  onFocused?: () => void;
}) {
  const gantt = useGanttContext();

  useEffect(() => {
    if (!focusItemId) return;
    const feature = allFeatures.find((f) => f.id === focusItemId.toString());
    if (feature) {
      gantt.scrollToFeature?.(feature);
      onFocused?.();
    }
  }, [focusItemId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

interface Props {
  sprints: ScrumSprintResource[];
  items: ScrumItemResource[];
  isLoading: boolean;
  onItemClick: (id: number) => void;
  focusItemId?: number | null;
  onFocused?: () => void;
}

export function GanttView({
  sprints,
  items,
  isLoading,
  onItemClick,
  focusItemId,
  onFocused,
}: Props) {
  const queryClient = useQueryClient();
  const [range, setRange] = useState<Range>("daily");
  const [zoom, setZoom] = useState(150);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const handleToggleSelect = useCallback((id: string) => {
    const itemId = parseInt(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      start_date,
      due_date,
      predecessor_id,
      sprint_id,
    }: {
      id: number;
      start_date: string;
      due_date: string;
      predecessor_id?: number | null;
      sprint_id?: number;
    }) =>
      updateScrumItem(id, {
        start_date,
        due_date,
        ...(predecessor_id !== undefined ? { predecessor_id } : {}),
        ...(sprint_id !== undefined ? { sprint_id } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
      queryClient.invalidateQueries({ queryKey: ["scrumKanban"] });
    },
  });

  // Re-enlaza `predecessor_id` de uno o más items SIN tocar `due_date`, para
  // no disparar el cascadeo de fechas del backend
  // (ScrumItemService::cascadeDueDateShift) antes de que corresponda. Se usa
  // para "puentear" a terceros durante un swap de orden (ver
  // handleChangePredecessor) antes de mover las fechas de las dos historias
  // involucradas.
  const relinkMutation = useMutation({
    mutationFn: (updates: { id: number; predecessor_id: number | null }[]) =>
      Promise.all(
        updates.map((u) => updateScrumItem(u.id, { predecessor_id: u.predecessor_id })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
    },
  });

  // Mueve varios items a la vez (hijos de una historia arrastrada, o el
  // resto de la selección múltiple), todos desplazados el mismo delta de
  // días que el item que el usuario soltó.
  const bulkMoveMutation = useMutation({
    mutationFn: (updates: { id: number; start_date: string; due_date: string }[]) =>
      Promise.all(
        updates.map((u) =>
          updateScrumItem(u.id, { start_date: u.start_date, due_date: u.due_date }),
        ),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
      queryClient.invalidateQueries({ queryKey: ["scrumKanban"] });
    },
  });

  const linkPredecessorMutation = useMutation({
    mutationFn: ({ id, predecessor_id }: { id: number; predecessor_id: number }) =>
      updateScrumItem(id, { predecessor_id }),
    onSuccess: () => {
      successToast("Predecesora vinculada correctamente");
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
      queryClient.invalidateQueries({ queryKey: ["scrumKanban"] });
    },
    // Toda la validación de negocio (mismo tipo, misma historia, etc.) vive
    // en el backend (UpdateScrumItemRequest), que devuelve el motivo exacto
    // en errors.predecessor_id de un 422 — sin leerlo, el drag soltaba la
    // tarjeta y no pasaba nada, sin avisar por qué.
    onError: (error: unknown) => {
      const data = (
        error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      )?.response?.data;
      const fieldMessage = data?.errors?.predecessor_id?.[0];
      errorToast(fieldMessage ?? data?.message ?? "No se pudo vincular la predecesora");
    },
  });

  const removePredecessorMutation = useMutation({
    mutationFn: (id: number) => updateScrumItem(id, { predecessor_id: null }),
    onSuccess: () => {
      successToast("Predecesora eliminada");
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
      queryClient.invalidateQueries({ queryKey: ["scrumKanban"] });
    },
    onError: () => errorToast("No se pudo quitar la predecesora"),
  });

  // Actualiza el orden de forma optimista en la caché de React Query: sin
  // esto, el drag soltaba la fila pero se quedaba en su posición vieja hasta
  // que volvía la respuesta del servidor (invalidateQueries + refetch), lo
  // que se sentía como que "no se movía". Reescribimos el `order` en todas
  // las queries ["scrumItem", ...] que tengan forma de lista (useScrumItems),
  // ANTES de que la mutación termine, y revertimos si falla.
  const reorderMutation = useMutation({
    mutationFn: (payload: { project_id: number; sprint_id: number; items: number[] }) =>
      reorderScrumItems(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["scrumItem"] });
      const previous = queryClient.getQueriesData({ queryKey: ["scrumItem"] });
      const orderById = new Map(payload.items.map((id, index) => [id, index]));

      queryClient.setQueriesData(
        { queryKey: ["scrumItem"] },
        (old: ScrumItemResponse | undefined) => {
          if (!old || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((it) =>
              orderById.has(it.id) ? { ...it, order: orderById.get(it.id)! } : it,
            ),
          };
        },
      );

      return { previous };
    },
    onError: (_err, _payload, context) => {
      context?.previous.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
      queryClient.invalidateQueries({ queryKey: ["scrumKanban"] });
    },
  });

  const itemsBySprint = useMemo(() => {
    const map: Record<number, ScrumItemResource[]> = {};
    for (const it of items) {
      if (it.sprint_id) {
        if (!map[it.sprint_id]) map[it.sprint_id] = [];
        map[it.sprint_id].push(it);
      }
    }
    return map;
  }, [items]);

  const itemsById = useMemo(() => {
    const map = new Map<number, ScrumItemResource>();
    for (const it of items) map.set(it.id, it);
    return map;
  }, [items]);

  // Orden único de la cadena por sprint: la historia antes que sus tareas
  // (agrupadas por la historia dueña), y dentro de ese grupo por `order`.
  // Se usa tanto para calcular las fechas encadenadas como para pintar el
  // sidebar y las barras, así el orden visual y el orden temporal siempre
  // coinciden (si no, un item que termina a fin de mes podía listarse antes
  // que uno que empieza al inicio del sprint).
  const sortedItemsBySprint = useMemo(() => {
    const map: Record<number, ScrumItemResource[]> = {};
    for (const sprint of sprints) {
      const sprintItems = (itemsBySprint[sprint.id] ?? []).filter((i) => i.due_date);
      map[sprint.id] = [...sprintItems].sort((a, b) => {
        const parentA = a.parent_id ? itemsById.get(a.parent_id) : undefined;
        const parentB = b.parent_id ? itemsById.get(b.parent_id) : undefined;
        const groupOrderA = parentA?.order ?? a.order;
        const groupOrderB = parentB?.order ?? b.order;
        if (groupOrderA !== groupOrderB) return groupOrderA - groupOrderB;
        const rankA = a.type === "historia" ? -1 : a.order;
        const rankB = b.type === "historia" ? -1 : b.order;
        return rankA - rankB;
      });
    }
    return map;
  }, [sprints, itemsBySprint, itemsById]);

  // Cada item empieza justo donde termina el anterior en su misma cadena, en
  // vez de que todos partan del inicio del sprint: así el Gantt se ve en
  // escalera real, uno detrás de otro.
  const featuresByItemId = useMemo(() => {
    const map = new Map<number, GanttFeature>();
    for (const sprint of sprints) {
      const sorted = sortedItemsBySprint[sprint.id] ?? [];
      let cursor = parseDate(sprint.start_date) ?? new Date();
      for (const item of sorted) {
        // Si el item ya tiene start_date real, se usa directamente; si no,
        // se sigue encadenando desde donde terminó el anterior (compatibilidad
        // con items antiguos sin start_date persistido).
        const startAt = parseDate(item.start_date) ?? cursor;
        const parsedDue = parseDate(item.due_date);
        const endAt = parsedDue ? dueDateToEndAt(parsedDue) : addDays(startAt, 1);
        map.set(item.id, toFeature(item, startAt, endAt));
        if (item.type !== "historia") cursor = endAt;
      }
    }
    return map;
  }, [sprints, sortedItemsBySprint]);

  const allFeatures = useMemo(() => Array.from(featuresByItemId.values()), [featuresByItemId]);

  // Fila global (0-based) de cada feature, para que GanttDependencyArrows
  // pueda dibujar una flecha aunque la predecesora esté en otro sprint: sin
  // esto, cada grupo de sprint solo sabía dibujar flechas dentro de sí mismo
  // y una dependencia cruzada quedaba guardada pero invisible. El índice
  // imita el flujo real del layout (mismo orden que GanttSidebar/
  // GanttFeatureList): 1 fila por header de sprint + 1 fila por item, más el
  // hueco entre grupos (space-y-4 = 16px) expresado como fracción de fila.
  const GANTT_GROUP_GAP_PX = 16;
  const globalRowIndexById = useMemo(() => {
    const map = new Map<string, number>();
    let cumulativeRows = 0;
    sprints.forEach((sprint, sprintIndex) => {
      if (sprintIndex > 0) cumulativeRows += GANTT_GROUP_GAP_PX / GANTT_ROW_HEIGHT;
      cumulativeRows += 1; // header del grupo (nombre del sprint)
      const sprintItems = sortedItemsBySprint[sprint.id] ?? [];
      sprintItems.forEach((item, i) => {
        map.set(item.id.toString(), cumulativeRows + i);
      });
      cumulativeRows += sprintItems.length;
    });
    return map;
  }, [sprints, sortedItemsBySprint]);

  // Junta, para un item que se movió `deltaDays`, los updates de todos sus
  // hijos directos (tareas de una historia) que también deben desplazarse
  // la misma cantidad de días. Muta `updates`/`movedIds` in-place para poder
  // encadenarse fácilmente entre la historia arrastrada y las historias que
  // vinieron con ella por selección múltiple.
  //
  // Usa las fechas YA CALCULADAS por el Gantt (featuresByItemId), no las
  // crudas del item: muchos hijos nunca tuvieron start_date persistido y
  // solo se posicionan visualmente encadenados desde el sprint, así que
  // filtrar por item.start_date los dejaba fuera silenciosamente.
  const collectChildShifts = useCallback(
    (
      parentId: number,
      deltaDays: number,
      updates: { id: number; start_date: string; due_date: string }[],
      movedIds: Set<number>,
    ) => {
      for (const child of items.filter((i) => i.parent_id === parentId)) {
        if (movedIds.has(child.id)) continue;
        const childFeature = featuresByItemId.get(child.id);
        if (!childFeature) continue;
        updates.push({
          id: child.id,
          start_date: format(addDays(childFeature.startAt, deltaDays), "yyyy-MM-dd"),
          due_date: format(endAtToDueDate(addDays(childFeature.endAt, deltaDays)), "yyyy-MM-dd"),
        });
        movedIds.add(child.id);
      }
    },
    [items, featuresByItemId],
  );

  // Drag-and-drop para reordenar filas en el sidebar del Gantt: solo cambia
  // el `order` dentro del mismo sprint (reorderMutation), nunca fechas ni
  // predecesoras. El swap de orden entre historias se hace aparte,
  // seleccionando dos y usando el botón "Cambiar orden" (ver
  // handleChangePredecessor).
  const [dragInfo, setDragInfo] = useState<{ ids: number[]; sprintId: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: number; position: "before" | "after" } | null>(
    null,
  );

  const handleReorderDragStart = useCallback(
    (id: string, sprintId: number, event: DragEvent<HTMLDivElement>) => {
      const itemId = parseInt(id);
      const ids =
        selectedIds.has(itemId) && selectedIds.size > 1 ? Array.from(selectedIds) : [itemId];
      setDragInfo({ ids, sprintId });
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(itemId));
    },
    [selectedIds],
  );

  const handleReorderDragOver = useCallback(
    (id: string, sprintId: number, event: DragEvent<HTMLDivElement>) => {
      if (!dragInfo || dragInfo.sprintId !== sprintId) return;
      const itemId = parseInt(id);
      if (dragInfo.ids.includes(itemId)) return;
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const position: "before" | "after" =
        event.clientY < rect.top + rect.height / 2 ? "before" : "after";
      setDropTarget((prev) =>
        prev?.id === itemId && prev.position === position ? prev : { id: itemId, position },
      );
    },
    [dragInfo],
  );

  const handleReorderDrop = useCallback(
    (id: string, sprintId: number, event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const targetId = parseInt(id);
      const position = dropTarget?.id === targetId ? dropTarget.position : "before";

      if (dragInfo && dragInfo.sprintId === sprintId && !dragInfo.ids.includes(targetId)) {
        const currentIds = (sortedItemsBySprint[sprintId] ?? []).map((i) => i.id);
        const newIds = computeReorderedIds(currentIds, dragInfo.ids, targetId, position);
        const projectId = items.find((i) => i.id === targetId)?.project_id;
        if (projectId) {
          reorderMutation.mutate({ project_id: projectId, sprint_id: sprintId, items: newIds });
        }
      }
      setDragInfo(null);
      setDropTarget(null);
    },
    [dragInfo, dropTarget, sortedItemsBySprint, items, reorderMutation],
  );

  const handleReorderDragEnd = useCallback(() => {
    setDragInfo(null);
    setDropTarget(null);
  }, []);

  const handleMove = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      if (!endAt) return;
      const itemId = parseInt(id);
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const finalDueAt = endAtToDueDate(endAt);
      const newStartDate = format(startAt, "yyyy-MM-dd");
      const newDueDate = format(finalDueAt, "yyyy-MM-dd");
      const sameStart =
        item.start_date &&
        format(parseDate(item.start_date)!, "yyyy-MM-dd") === newStartDate;
      const sameDue =
        item.due_date &&
        format(parseDate(item.due_date)!, "yyyy-MM-dd") === newDueDate;
      if (sameStart && sameDue) return;

      const oldStart =
        featuresByItemId.get(itemId)?.startAt ?? parseDate(item.start_date) ?? startAt;
      const deltaDays = Math.round((startAt.getTime() - oldStart.getTime()) / 86400000);

      const updates: { id: number; start_date: string; due_date: string }[] = [
        { id: itemId, start_date: newStartDate, due_date: newDueDate },
      ];
      const movedIds = new Set<number>([itemId]);

      // Mover una historia arrastra a sus tareas (hijas) con ella.
      if (item.type === "historia" && deltaDays !== 0) {
        collectChildShifts(itemId, deltaDays, updates, movedIds);
      }

      // Si el item movido forma parte de una selección múltiple, el resto
      // de la selección (y las tareas de cada historia seleccionada) se
      // desplaza el mismo delta.
      if (selectedIds.has(itemId) && selectedIds.size > 1 && deltaDays !== 0) {
        for (const otherId of selectedIds) {
          if (movedIds.has(otherId)) continue;
          const other = items.find((i) => i.id === otherId);
          if (!other) continue;
          const otherFeature = featuresByItemId.get(otherId);
          if (!otherFeature) continue;
          updates.push({
            id: other.id,
            start_date: format(addDays(otherFeature.startAt, deltaDays), "yyyy-MM-dd"),
            due_date: format(endAtToDueDate(addDays(otherFeature.endAt, deltaDays)), "yyyy-MM-dd"),
          });
          movedIds.add(other.id);
          if (other.type === "historia") {
            collectChildShifts(other.id, deltaDays, updates, movedIds);
          }
        }
      }

      if (updates.length === 1) {
        updateMutation.mutate(updates[0]);
      } else {
        bulkMoveMutation.mutate(updates);
      }
    },
    [updateMutation, bulkMoveMutation, items, selectedIds, collectChildShifts, featuresByItemId],
  );

  // Intercambia el ORDEN de las DOS historias seleccionadas: la que va
  // después pasa a ocupar el lugar de la que va antes (y viceversa), con
  // todo lo que eso implica en la cadena de predecesoras:
  //   - la de ANTES (EARLIER) le cede su slot a la de DESPUÉS (LATER): LATER
  //     hereda la predecesora que tenía EARLIER, y arranca justo tras ella.
  //   - EARLIER pasa a ir justo después de LATER (su nueva sucesora es la
  //     que antes era su propia predecesora... en la posición, no en la
  //     entidad): EARLIER.predecessor_id = LATER.id.
  //   - Cualquier TERCERA historia que dependía de EARLIER ahora depende de
  //     LATER, y cualquiera que dependía de LATER ahora depende de EARLIER
  //     (se "sustituye" la identidad de una por la otra en todo el grafo).
  // Es, literalmente, un swap de posiciones: cada referencia a EARLIER se
  // reemplaza por LATER y cada referencia a LATER se reemplaza por EARLIER.
  const handleChangePredecessor = useCallback(async () => {
    const [idA, idB] = Array.from(selectedIds);
    const itemA = items.find((i) => i.id === idA);
    const itemB = items.find((i) => i.id === idB);
    if (!itemA || !itemB || itemA.type !== "historia" || itemB.type !== "historia") return;

    const startA = featuresByItemId.get(itemA.id)?.startAt ?? parseDate(itemA.start_date);
    const startB = featuresByItemId.get(itemB.id)?.startAt ?? parseDate(itemB.start_date);
    if (!startA || !startB) return;

    const [earlier, later] =
      startA.getTime() <= startB.getTime() ? [itemA, itemB] : [itemB, itemA];

    const sub = (id: number | null): number | null => {
      if (id === earlier.id) return later.id;
      if (id === later.id) return earlier.id;
      return id;
    };

    const oldPredEarlierId = earlier.predecessor_id ?? null;
    const oldPredLaterId = later.predecessor_id ?? null;

    // Terceras historias (ni earlier ni later) que dependían de una de las
    // dos: hay que puentearlas ANTES de tocar las fechas, para que el
    // cascadeo de due_date del backend no les caiga con datos viejos.
    const thirdPartyOfEarlier = items.filter(
      (i) => i.type === "historia" && i.predecessor_id === earlier.id && i.id !== later.id,
    );
    const thirdPartyOfLater = items.filter(
      (i) => i.type === "historia" && i.predecessor_id === later.id && i.id !== earlier.id,
    );
    const bridgeUpdates = [
      ...thirdPartyOfEarlier.map((i) => ({ id: i.id, predecessor_id: later.id })),
      ...thirdPartyOfLater.map((i) => ({ id: i.id, predecessor_id: earlier.id })),
    ];

    // LATER toma el slot de EARLIER: hereda su predecesora y arranca justo
    // después de ella (o conserva la fecha de EARLIER si esta no tenía
    // predecesora, por ser la primera de la cadena).
    const newPredOfLaterId = sub(oldPredEarlierId);
    const newPredOfLaterItem = newPredOfLaterId ? items.find((i) => i.id === newPredOfLaterId) : null;
    const newPredOfLaterDue = newPredOfLaterItem ? parseDate(newPredOfLaterItem.due_date) : null;

    const laterOldStart = parseDate(later.start_date);
    const laterOldDue = parseDate(later.due_date);
    const laterDuration = laterOldStart && laterOldDue ? countWorkingDays(laterOldStart, laterOldDue) : 1;

    const earlierOldStart = parseDate(earlier.start_date);
    const laterNewStart = newPredOfLaterDue
      ? nextWorkingDay(addDays(newPredOfLaterDue, 1))
      : (earlierOldStart ?? new Date());
    const laterNewDue = addWorkingDays(laterNewStart, laterDuration);

    // EARLIER pasa a ir justo después de LATER, conservando su propia
    // duración original.
    const earlierOldDue = parseDate(earlier.due_date);
    const earlierDuration = earlierOldStart && earlierOldDue ? countWorkingDays(earlierOldStart, earlierOldDue) : 1;
    const earlierNewStart = nextWorkingDay(addDays(laterNewDue, 1));
    const earlierNewDue = addWorkingDays(earlierNewStart, earlierDuration);
    const newPredOfEarlierId = sub(oldPredLaterId); // === later.id en el caso adyacente

    const laterOldStartForDelta = featuresByItemId.get(later.id)?.startAt ?? laterOldStart ?? laterNewStart;
    const laterDeltaDays = Math.round((laterNewStart.getTime() - laterOldStartForDelta.getTime()) / 86400000);
    const earlierOldStartForDelta =
      featuresByItemId.get(earlier.id)?.startAt ?? earlierOldStart ?? earlierNewStart;
    const earlierDeltaDays = Math.round(
      (earlierNewStart.getTime() - earlierOldStartForDelta.getTime()) / 86400000,
    );

    const childUpdates: { id: number; start_date: string; due_date: string }[] = [];
    const movedIds = new Set<number>([earlier.id, later.id]);
    if (laterDeltaDays !== 0) collectChildShifts(later.id, laterDeltaDays, childUpdates, movedIds);
    if (earlierDeltaDays !== 0) collectChildShifts(earlier.id, earlierDeltaDays, childUpdates, movedIds);

    try {
      if (bridgeUpdates.length > 0) {
        await relinkMutation.mutateAsync(bridgeUpdates);
      }
      await updateMutation.mutateAsync({
        id: later.id,
        start_date: format(laterNewStart, "yyyy-MM-dd"),
        due_date: format(laterNewDue, "yyyy-MM-dd"),
        predecessor_id: newPredOfLaterId,
      });
      await updateMutation.mutateAsync({
        id: earlier.id,
        start_date: format(earlierNewStart, "yyyy-MM-dd"),
        due_date: format(earlierNewDue, "yyyy-MM-dd"),
        predecessor_id: newPredOfEarlierId,
      });
      if (childUpdates.length === 1) {
        await updateMutation.mutateAsync(childUpdates[0]);
      } else if (childUpdates.length > 1) {
        await bulkMoveMutation.mutateAsync(childUpdates);
      }
      successToast(`${later.title} ahora va antes que ${earlier.title}.`);
      setSelectedIds(new Set());
    } catch (err) {
      errorToast(
        "No se pudo cambiar el orden.",
        getErrorMessage(err) ?? "Intenta de nuevo.",
      );
    }
  }, [selectedIds, items, featuresByItemId, collectChildShifts, updateMutation, bulkMoveMutation, relinkMutation]);

  const canChangePredecessor =
    selectedIds.size === 2 &&
    Array.from(selectedIds).every((id) => items.find((i) => i.id === id)?.type === "historia");

  const handleLinkPredecessor = useCallback(
    (successorId: string, predecessorId: string) => {
      const id = parseInt(successorId);
      const predecessor_id = parseInt(predecessorId);
      const item = items.find((i) => i.id === id);
      if (item?.predecessor_id === predecessor_id) return;
      // Las reglas de negocio (mismo tipo, misma historia, etc.) se validan
      // solo en el backend (UpdateScrumItemRequest): duplicarlas aquí con
      // datos del cliente que pueden estar stale generaba falsos negativos.
      // El backend responde 422 con el motivo exacto y el onError de abajo
      // lo muestra en un toast.
      linkPredecessorMutation.mutate({ id, predecessor_id });
    },
    [linkPredecessorMutation, items],
  );

  const handleRemovePredecessor = useCallback(
    (id: string) => {
      removePredecessorMutation.mutate(parseInt(id));
    },
    [removePredecessorMutation],
  );

  const computeDateOffset = useCallback(
    (date: Date) => {
      const colW =
        range === "daily"
          ? 50
          : range === "weekly"
            ? 24
            : range === "monthly"
              ? 150
              : range === "quarterly"
                ? 100
                : range === "semiannual"
                  ? 60
                  : 30;
      const actualColW = (zoom / 100) * colW;
      const timelineStartYear = new Date().getFullYear() - 1;
      const timelineStart = new Date(timelineStartYear, 0, 1);
      if (range === "daily" || range === "weekly") {
        const days = Math.floor(
          (date.getTime() - timelineStart.getTime()) / 86400000,
        );
        return days * actualColW;
      }
      const months = differenceInMonths(
        startOfMonth(date),
        startOfMonth(timelineStart),
      );
      const daysInM = getDaysInMonth(date);
      return months * actualColW + (date.getDate() / daysInM) * actualColW;
    },
    [range, zoom],
  );

  const scrollToDate = useCallback(
    (date: Date) => {
      const scrollEl = document.querySelector(".gantt") as HTMLElement | null;
      if (!scrollEl) return;
      const offset = computeDateOffset(date);
      scrollEl.scrollTo({
        left: Math.max(0, offset - scrollEl.clientWidth / 2),
        behavior: "smooth",
      });
    },
    [computeDateOffset],
  );

  const [highlightedItemId, setHighlightedItemId] = useState<number | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Buscador del Gantt: no filtra (perderías el orden/contexto de sprint),
  // solo centra la vista (horizontal por fecha, vertical por fila global) en
  // la tarjeta encontrada y la resalta un momento para que sea obvio dónde
  // quedó.
  const scrollToItem = useCallback(
    (id: string) => {
      const itemId = parseInt(id);
      const feature = featuresByItemId.get(itemId);
      const rowIndex = globalRowIndexById.get(id);
      const scrollEl = document.querySelector(".gantt") as HTMLElement | null;
      if (!feature || rowIndex === undefined || !scrollEl) return;

      const left = Math.max(0, computeDateOffset(feature.startAt) - scrollEl.clientWidth / 2);
      const rowTop = rowIndex * GANTT_ROW_HEIGHT;
      const top = Math.max(0, rowTop - scrollEl.clientHeight / 2);
      scrollEl.scrollTo({ left, top, behavior: "smooth" });

      setHighlightedItemId(itemId);
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => setHighlightedItemId(null), 2500);
    },
    [featuresByItemId, globalRowIndexById, computeDateOffset],
  );

  useEffect(() => () => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
  }, []);

  const hasScrolledToTodayRef = useRef(false);
  useEffect(() => {
    if (hasScrolledToTodayRef.current) return;
    if (isLoading || sprints.length === 0 || focusItemId) return;
    hasScrolledToTodayRef.current = true;
    const id = requestAnimationFrame(() => scrollToDate(new Date()));
    return () => cancelAnimationFrame(id);
  }, [isLoading, sprints.length, focusItemId, scrollToDate]);

  const goToToday = () => scrollToDate(new Date());
  const goToWeek = () => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    scrollToDate(d);
  };
  const goToMonth = () => {
    const now = new Date();
    scrollToDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (sprints.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        No hay sprints para mostrar en el gantt
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <GanttToolbar
        range={range}
        zoom={zoom}
        onRangeChange={setRange}
        onZoomChange={setZoom}
        onGoToToday={goToToday}
        onGoToWeek={goToWeek}
        onGoToMonth={goToMonth}
      >
        <GanttSearchBox features={allFeatures} onSelect={scrollToItem} />
      </GanttToolbar>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-primary/5 text-xs shrink-0">
          <span className="font-medium">
            {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} seleccionado
            {selectedIds.size !== 1 ? "s" : ""}
          </span>
          <span className="text-muted-foreground">
            — al arrastrar cualquiera de ellos, todos se mueven juntos
          </span>
          {canChangePredecessor && (
            <Button
              variant="secondary"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => void handleChangePredecessor()}
            >
              Cambiar orden
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs ml-auto"
            onClick={() => setSelectedIds(new Set())}
          >
            Deseleccionar
          </Button>
        </div>
      )}

      {/* Gantt */}
      <div className="flex-1 min-h-0">
        <GanttProvider
          range={range}
          zoom={zoom}
          className="h-full rounded-none border-0"
        >
          <GanttFocusHandler
            allFeatures={allFeatures}
            focusItemId={focusItemId}
            onFocused={onFocused}
          />
          <GanttSidebar>
            {sprints.map((sprint) => {
              const sprintItems = sortedItemsBySprint[sprint.id] ?? [];
              return (
                <GanttSidebarGroup key={sprint.id} name={sprint.name}>
                  {sprintItems.map((item) => {
                    const feature = featuresByItemId.get(item.id);
                    if (!feature) return null;
                    return (
                      <GanttSidebarItem
                        key={item.id}
                        feature={feature}
                        onSelectItem={(id) => onItemClick(parseInt(id))}
                        selected={selectedIds.has(item.id)}
                        onToggleSelect={handleToggleSelect}
                        reorderable
                        onReorderDragStart={(id, event) =>
                          handleReorderDragStart(id, sprint.id, event)
                        }
                        onReorderDragOver={(id, event) =>
                          handleReorderDragOver(id, sprint.id, event)
                        }
                        onReorderDrop={(id, event) => handleReorderDrop(id, sprint.id, event)}
                        onReorderDragEnd={handleReorderDragEnd}
                        dropIndicator={
                          dropTarget?.id === item.id ? dropTarget.position : undefined
                        }
                        highlighted={highlightedItemId === item.id}
                      />
                    );
                  })}
                </GanttSidebarGroup>
              );
            })}
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
            {/* Único overlay de flechas para TODO el gantt (no una por
                sprint): así una dependencia entre items de sprints distintos
                también se dibuja, usando el índice de fila global en vez de
                la posición local de cada grupo. Va como hermano de
                GanttFeatureList (no dentro) para no heredar el space-y-4 que
                ese contenedor aplica entre grupos, que desalinearía las filas. */}
            <GanttDependencyArrows features={allFeatures} rowIndexById={globalRowIndexById} />
            <GanttFeatureList>
              {sprints.map((sprint) => {
                const sprintItems = sortedItemsBySprint[sprint.id] ?? [];
                return (
                  <GanttFeatureListGroup key={sprint.id}>
                    {sprintItems.map((item) => {
                      const feature = featuresByItemId.get(item.id);
                      if (!feature) return null;
                      return (
                        <GanttFeatureItem
                          key={item.id}
                          onMove={handleMove}
                          onDoubleClick={(id) => onItemClick(parseInt(id))}
                          onLinkPredecessor={handleLinkPredecessor}
                          onRemovePredecessor={handleRemovePredecessor}
                          selected={selectedIds.has(item.id)}
                          highlighted={highlightedItemId === item.id}
                          {...feature}
                        />
                      );
                    })}
                  </GanttFeatureListGroup>
                );
              })}
            </GanttFeatureList>
            <GanttToday />
          </GanttTimeline>
        </GanttProvider>
      </div>
    </div>
  );
}
