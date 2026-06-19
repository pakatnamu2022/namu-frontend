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
} from "./Gantt";
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

function makeGanttFeature(
  item: ScrumItemResource,
  sprint: ScrumSprintResource,
): GanttFeature {
  const startAt =
    parseDate(sprint.start_date) ?? parseDate(item.due_date) ?? new Date();
  const endAt = parseDate(item.due_date) ?? addDays(startAt, 7);
  return {
    id: item.id.toString(),
    name: item.title,
    startAt,
    endAt,
    status: makeGanttStatus(item.status),
  };
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

  const updateMutation = useMutation({
    mutationFn: ({ id, due_date }: { id: number; due_date: string }) =>
      updateScrumItem(id, { due_date }),
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

  const allFeatures = useMemo(() => {
    const features: GanttFeature[] = [];
    for (const sprint of sprints) {
      for (const item of itemsBySprint[sprint.id] ?? []) {
        if (item.due_date) features.push(makeGanttFeature(item, sprint));
      }
    }
    return features;
  }, [sprints, itemsBySprint]);

  const handleMove = useCallback(
    (id: string, _startAt: Date, endAt: Date | null) => {
      if (!endAt) return;
      const itemId = parseInt(id);
      const item = items.find((i) => i.id === itemId);
      const newDueDate = format(endAt, "yyyy-MM-dd");
      if (
        item?.due_date &&
        format(parseDate(item.due_date)!, "yyyy-MM-dd") === newDueDate
      )
        return;
      updateMutation.mutate({ id: itemId, due_date: newDueDate });
    },
    [updateMutation, items],
  );

  const scrollToDate = useCallback(
    (date: Date) => {
      const scrollEl = document.querySelector(".gantt") as HTMLElement | null;
      if (!scrollEl) return;
      const colW = range === "daily" ? 50 : range === "monthly" ? 150 : 100;
      const actualColW = (zoom / 100) * colW;
      const timelineStartYear = new Date().getFullYear() - 1;
      const timelineStart = new Date(timelineStartYear, 0, 1);
      let offset: number;
      if (range === "daily") {
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

  const RANGE_LABELS: Record<Range, string> = {
    daily: "Día",
    monthly: "Mes",
    quarterly: "Trimestre",
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-3 py-2 border-b bg-background shrink-0 flex-wrap">
        <div className="flex items-center gap-0.5">
          <span className="text-xs text-muted-foreground mr-1">Escala:</span>
          {(["daily", "monthly", "quarterly"] as Range[]).map((r) => (
            <Button
              key={r}
              variant={range === r ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setRange(r)}
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
              variant={zoom === z ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setZoom(z)}
            >
              {z}%
            </Button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center gap-0.5">
          <span className="text-xs text-muted-foreground mr-1">Ir a:</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={goToToday}
          >
            Hoy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={goToWeek}
          >
            Esta semana
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={goToMonth}
          >
            Este mes
          </Button>
        </div>
      </div>

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
              const sprintItems = (itemsBySprint[sprint.id] ?? []).filter(
                (i) => i.due_date,
              );
              return (
                <GanttSidebarGroup key={sprint.id} name={sprint.name}>
                  {sprintItems.map((item) => (
                    <GanttSidebarItem
                      key={item.id}
                      feature={makeGanttFeature(item, sprint)}
                      onSelectItem={(id) => onItemClick(parseInt(id))}
                    />
                  ))}
                </GanttSidebarGroup>
              );
            })}
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              {sprints.map((sprint) => {
                const sprintItems = (itemsBySprint[sprint.id] ?? []).filter(
                  (i) => i.due_date,
                );
                return (
                  <GanttFeatureListGroup key={sprint.id}>
                    {sprintItems.map((item) => (
                      <GanttFeatureItem
                        key={item.id}
                        onMove={handleMove}
                        {...makeGanttFeature(item, sprint)}
                      />
                    ))}
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
