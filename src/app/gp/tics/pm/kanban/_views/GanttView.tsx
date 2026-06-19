"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrumSprintResource } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.interface";
import { ScrumItemResource, ScrumItemStatus } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";

const STATUS_COLOR: Record<ScrumItemStatus, string> = {
  backlog: "bg-muted-foreground/40",
  por_hacer: "bg-muted-foreground/40",
  en_progreso: "bg-muted-foreground/40",
  en_revision: "bg-muted-foreground/40",
  hecho: "bg-muted-foreground/40",
};

const SPRINT_STATUS_COLOR = {
  planeado: "bg-foreground/20",
  activo: "bg-foreground/20",
  cerrado: "bg-foreground/20",
};

// Row heights (must match Tailwind classes below)
const SPRINT_ROW_H = 36; // h-9
const ITEM_ROW_H = 32;   // h-8
const HEADER_H = 32;     // h-8

type ZoomLevel = "dia" | "semana" | "mes";
const ZOOM_DAY_W: Record<ZoomLevel, number> = { dia: 56, semana: 28, mes: 14 };

function parseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function daysFrom(start: Date, d: Date) {
  return Math.round((d.getTime() - start.getTime()) / 86400000);
}

function startOfWeek(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1)); // Monday
  return result;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

interface Props {
  sprints: ScrumSprintResource[];
  items: ScrumItemResource[];
  isLoading: boolean;
  onItemClick: (id: number) => void;
  focusItemId?: number | null;
  onFocused?: () => void;
}

export function GanttView({ sprints, items, isLoading, onItemClick, focusItemId, onFocused }: Props) {
  const [zoom, setZoom] = useState<ZoomLevel>("semana");
  const dayW = ZOOM_DAY_W[zoom];

  const scrollContainerRef = useRef<HTMLDivElement>(null); // outer scrollable div
  const timelineRef = useRef<HTMLDivElement>(null);        // timeline column (horizontal scroll)
  const labelsRef = useRef<HTMLDivElement>(null);          // labels column (vertical sync)

  const { minDate, maxDate, totalDays, months } = useMemo(() => {
    const dates: Date[] = [];
    for (const s of sprints) {
      const sd = parseDate(s.start_date);
      const ed = parseDate(s.end_date);
      if (sd) dates.push(sd);
      if (ed) dates.push(ed);
    }
    for (const it of items) {
      const d = parseDate(it.due_date);
      if (d) dates.push(d);
    }

    if (dates.length === 0) {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 2);
      dates.push(now, end);
    }

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 7);

    const totalDays = Math.max(daysFrom(minDate, maxDate), 14);

    const months: { label: string; startDay: number; span: number }[] = [];
    let cur = new Date(minDate);
    cur.setDate(1);
    while (cur <= maxDate) {
      const label = cur.toLocaleString("es", { month: "short", year: "2-digit" });
      const monthStart = new Date(cur);
      const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
      const startDay = Math.max(0, daysFrom(minDate, monthStart));
      const endDay = Math.min(totalDays, daysFrom(minDate, monthEnd));
      months.push({ label, startDay, span: endDay - startDay + 1 });
      cur.setMonth(cur.getMonth() + 1);
    }

    return { minDate, maxDate, totalDays, months };
  }, [sprints, items]);

  const timelineW = totalDays * dayW;

  // Group items by sprint
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

  // Scroll timeline to a given day offset (horizontal)
  const scrollToDay = useCallback((day: number) => {
    const el = timelineRef.current;
    if (!el) return;
    const target = day * dayW - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [dayW, timelineRef]);

  // Navigation shortcuts
  const goToToday = () => scrollToDay(daysFrom(minDate, new Date()));
  const goToWeek = () => scrollToDay(daysFrom(minDate, startOfWeek(new Date())));
  const goToMonth = () => scrollToDay(daysFrom(minDate, startOfMonth(new Date())));

  // Focus item from list view
  useEffect(() => {
    if (!focusItemId) return;
    // Calculate vertical position
    let topOffset = HEADER_H;
    let found = false;
    let horizontalDay = 0;
    outer: for (const sprint of sprints) {
      topOffset += SPRINT_ROW_H;
      const sprintItems = itemsBySprint[sprint.id] ?? [];
      for (const it of sprintItems) {
        if (it.id === focusItemId) {
          found = true;
          const barStart = parseDate(sprint.start_date ?? it.due_date);
          if (barStart) horizontalDay = daysFrom(minDate, barStart);
          break outer;
        }
        topOffset += ITEM_ROW_H;
      }
    }

    if (!found) return;

    // Vertical scroll on outer container
    const outer = scrollContainerRef.current;
    if (outer) {
      outer.scrollTo({ top: topOffset - 80, behavior: "smooth" });
    }
    // Horizontal scroll on timeline
    scrollToDay(horizontalDay);

    onFocused?.();
  }, [focusItemId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync vertical scroll between labels and timeline columns
  const syncScroll = useCallback((source: "labels" | "timeline") => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = (e.target as HTMLDivElement).scrollTop;
      if (source === "labels" && timelineRef.current) {
        timelineRef.current.scrollTop = scrollTop;
      } else if (source === "timeline" && labelsRef.current) {
        labelsRef.current.scrollTop = scrollTop;
      }
    };
  }, []);

  function bar(
    start: string | undefined,
    end: string | undefined,
    color: string,
    label: string,
    onClick?: () => void,
  ) {
    const sd = parseDate(start);
    const ed = parseDate(end);
    if (!sd || !ed) return null;
    const left = Math.max(0, daysFrom(minDate, sd)) * dayW;
    const width = Math.max(dayW, daysFrom(sd, ed) * dayW);
    return (
      <div
        className="absolute top-1/2 -translate-y-1/2 h-5 rounded flex items-center px-2 text-foreground text-[10px] font-medium overflow-hidden whitespace-nowrap"
        style={{ left, width }}
      >
        <div
          className={cn("absolute inset-0 rounded-full cursor-pointer", color)}
          onClick={onClick}
          title={label}
        />
        <span className="relative truncate pointer-events-none">{label}</span>
      </div>
    );
  }

  function todayMarker() {
    const today = new Date();
    if (today < minDate || today > maxDate) return null;
    const left = daysFrom(minDate, today) * dayW;
    return (
      <div
        className="absolute top-0 bottom-0 w-px bg-red-400 z-10 pointer-events-none"
        style={{ left }}
        title="Hoy"
      />
    );
  }

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

  const LABEL_W = 220;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-3 py-2 border-b bg-background shrink-0 flex-wrap">
        {/* Zoom */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Zoom:</span>
          {(["dia", "semana", "mes"] as ZoomLevel[]).map((z) => (
            <Button
              key={z}
              variant={zoom === z ? "default" : "outline"}
              size="sm"
              className="h-7 px-2.5 text-xs capitalize"
              onClick={() => setZoom(z)}
            >
              {z === "dia" ? "Día" : z === "semana" ? "Semana" : "Mes"}
            </Button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Ir a:</span>
          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={goToWeek}>
            Esta semana
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={goToMonth}>
            Este mes
          </Button>
        </div>
      </div>

      {/* Gantt body */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto flex min-w-0">
        {/* Labels column */}
        <div
          ref={labelsRef}
          style={{ width: LABEL_W, minWidth: LABEL_W }}
          className="shrink-0 border-r z-10 bg-background overflow-y-auto"
          onScroll={syncScroll("labels")}
        >
          <div className="h-8 border-b flex items-center px-3 text-xs font-semibold text-muted-foreground sticky top-0 bg-background z-10">
            Sprint / Tarea
          </div>
          {sprints.map((sprint) => {
            const sprintItems = itemsBySprint[sprint.id] ?? [];
            return (
              <div key={sprint.id}>
                <div className="h-9 border-b flex items-center px-3 gap-2 bg-muted/30">
                  <span className="size-2 rounded-full shrink-0 bg-muted-foreground/40" />
                  <span className="text-xs font-semibold truncate">{sprint.name}</span>
                </div>
                {sprintItems.map((it) => (
                  <div
                    key={it.id}
                    className="h-8 border-b flex items-center px-5 gap-2 hover:bg-muted/30 cursor-pointer"
                    onClick={() => onItemClick(it.id)}
                  >
                    <span className="size-1.5 rounded-full shrink-0 bg-muted-foreground/50" />
                    <span className="text-xs truncate text-muted-foreground">{it.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Timeline column */}
        <div
          ref={timelineRef}
          className="overflow-auto flex-1"
          onScroll={syncScroll("timeline")}
        >
          <div style={{ width: timelineW }}>
            {/* Month headers */}
            <div className="h-8 border-b flex sticky top-0 bg-background z-10">
              {months.map((m) => (
                <div
                  key={m.label}
                  className="border-r text-[10px] text-muted-foreground flex items-center px-2 shrink-0 overflow-hidden"
                  style={{ width: m.span * dayW }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Sprint rows */}
            <div className="relative">
              {todayMarker()}
              {sprints.map((sprint) => {
                const sprintItems = itemsBySprint[sprint.id] ?? [];
                return (
                  <div key={sprint.id}>
                    {/* Sprint bar row */}
                    <div className="h-9 border-b relative" style={{ width: timelineW }}>
                      {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 w-px bg-border/60"
                          style={{ left: i * 7 * dayW }}
                        />
                      ))}
                      {bar(sprint.start_date, sprint.end_date, SPRINT_STATUS_COLOR[sprint.status], sprint.name)}
                    </div>
                    {/* Item rows */}
                    {sprintItems.map((it) => (
                      <div key={it.id} className="h-8 border-b relative" style={{ width: timelineW }}>
                        {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 w-px bg-border/40"
                            style={{ left: i * 7 * dayW }}
                          />
                        ))}
                        {it.due_date && bar(
                          sprint.start_date ?? it.due_date,
                          it.due_date,
                          STATUS_COLOR[it.status],
                          it.title,
                          () => onItemClick(it.id),
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
