"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
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
  GanttToday,
  useGanttContext,
  type GanttFeature,
  type GanttStatus,
  type Range,
} from "@/components/ui/gantt";
import { ScrumSprintResource } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.interface";
import {
  ScrumItemResource,
  ScrumItemStatus,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";
import { updateScrumItem } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.actions";
import { STATUS_LABEL } from "@/features/gp/tics/pm/pm.constants";

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
    hasPredecessor: item.predecessor_id != null,
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
}

function GanttToolbar({
  range,
  zoom,
  onRangeChange,
  onZoomChange,
  onGoToToday,
  onGoToWeek,
  onGoToMonth,
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
  const [range, setRange] = useState<Range>("monthly");
  const [zoom, setZoom] = useState(100);

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
    }: {
      id: number;
      start_date: string;
      due_date: string;
    }) => updateScrumItem(id, { start_date, due_date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
      queryClient.invalidateQueries({ queryKey: ["scrumKanban"] });
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
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
      queryClient.invalidateQueries({ queryKey: ["scrumKanban"] });
    },
  });

  const removePredecessorMutation = useMutation({
    mutationFn: (id: number) => updateScrumItem(id, { predecessor_id: null }),
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
        const endAt = parseDate(item.due_date) ?? addDays(startAt, 1);
        map.set(item.id, toFeature(item, startAt, endAt));
        if (item.type !== "historia") cursor = endAt;
      }
    }
    return map;
  }, [sprints, sortedItemsBySprint]);

  const allFeatures = useMemo(() => Array.from(featuresByItemId.values()), [featuresByItemId]);

  // Junta, para un item que se movió `deltaDays`, los updates de todos sus
  // hijos directos (tareas de una historia) que también deben desplazarse
  // la misma cantidad de días. Muta `updates`/`movedIds` in-place para poder
  // encadenarse fácilmente entre la historia arrastrada y las historias que
  // vinieron con ella por selección múltiple.
  const collectChildShifts = useCallback(
    (
      parentId: number,
      deltaDays: number,
      updates: { id: number; start_date: string; due_date: string }[],
      movedIds: Set<number>,
    ) => {
      for (const child of items.filter((i) => i.parent_id === parentId)) {
        if (movedIds.has(child.id)) continue;
        const childStart = parseDate(child.start_date);
        const childDue = parseDate(child.due_date);
        if (!childStart || !childDue) continue;
        updates.push({
          id: child.id,
          start_date: format(addDays(childStart, deltaDays), "yyyy-MM-dd"),
          due_date: format(addDays(childDue, deltaDays), "yyyy-MM-dd"),
        });
        movedIds.add(child.id);
      }
    },
    [items],
  );

  const handleMove = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      if (!endAt) return;
      const itemId = parseInt(id);
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      const newStartDate = format(startAt, "yyyy-MM-dd");
      const newDueDate = format(endAt, "yyyy-MM-dd");
      const sameStart =
        item.start_date &&
        format(parseDate(item.start_date)!, "yyyy-MM-dd") === newStartDate;
      const sameDue =
        item.due_date &&
        format(parseDate(item.due_date)!, "yyyy-MM-dd") === newDueDate;
      if (sameStart && sameDue) return;

      const oldStart = parseDate(item.start_date) ?? startAt;
      const deltaDays = Math.round(
        (startAt.getTime() - oldStart.getTime()) / 86400000,
      );

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
          const otherStart = parseDate(other.start_date);
          const otherDue = parseDate(other.due_date);
          if (!otherStart || !otherDue) continue;
          updates.push({
            id: other.id,
            start_date: format(addDays(otherStart, deltaDays), "yyyy-MM-dd"),
            due_date: format(addDays(otherDue, deltaDays), "yyyy-MM-dd"),
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
    [updateMutation, bulkMoveMutation, items, selectedIds, collectChildShifts],
  );

  const handleLinkPredecessor = useCallback(
    (successorId: string, predecessorId: string) => {
      const id = parseInt(successorId);
      const predecessor_id = parseInt(predecessorId);
      const item = items.find((i) => i.id === id);
      if (item?.predecessor_id === predecessor_id) return;
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

  const scrollToDate = useCallback(
    (date: Date) => {
      const scrollEl = document.querySelector(".gantt") as HTMLElement | null;
      if (!scrollEl) return;
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
      let offset: number;
      if (range === "daily" || range === "weekly") {
        const days = Math.floor(
          (date.getTime() - timelineStart.getTime()) / 86400000,
        );
        offset = days * actualColW;
      } else {
        const months = differenceInMonths(
          startOfMonth(date),
          startOfMonth(timelineStart),
        );
        const daysInM = getDaysInMonth(date);
        offset = months * actualColW + (date.getDate() / daysInM) * actualColW;
      }
      scrollEl.scrollTo({
        left: Math.max(0, offset - scrollEl.clientWidth / 2),
        behavior: "smooth",
      });
    },
    [range, zoom],
  );

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
      />

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-primary/5 text-xs shrink-0">
          <span className="font-medium">
            {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} seleccionado
            {selectedIds.size !== 1 ? "s" : ""}
          </span>
          <span className="text-muted-foreground">
            — al arrastrar cualquiera de ellos, todos se mueven juntos
          </span>
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
                      />
                    );
                  })}
                </GanttSidebarGroup>
              );
            })}
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
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
