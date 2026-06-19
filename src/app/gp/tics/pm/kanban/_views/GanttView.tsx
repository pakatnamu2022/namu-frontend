"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ScrumSprintResource } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.interface";
import { ScrumItemResource, ScrumItemStatus } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";

const STATUS_COLOR: Record<ScrumItemStatus, string> = {
  backlog: "bg-slate-300",
  por_hacer: "bg-blue-400",
  en_progreso: "bg-amber-400",
  en_revision: "bg-purple-400",
  hecho: "bg-emerald-400",
};

const SPRINT_STATUS_COLOR = {
  planeado: "bg-slate-400",
  activo: "bg-blue-500",
  cerrado: "bg-emerald-500",
};

function parseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function daysFrom(start: Date, d: Date) {
  return Math.round((d.getTime() - start.getTime()) / 86400000);
}

interface Props {
  sprints: ScrumSprintResource[];
  items: ScrumItemResource[];
  isLoading: boolean;
  onItemClick: (id: number) => void;
}

export function GanttView({ sprints, items, isLoading, onItemClick }: Props) {
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
    // pad a bit
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 7);

    const totalDays = Math.max(daysFrom(minDate, maxDate), 14);

    // Generate month headers
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

  const DAY_W = 28; // px per day
  const LABEL_W = 220; // left label column
  const timelineW = totalDays * DAY_W;

  function bar(start: string | undefined, end: string | undefined, color: string, label: string, onClick?: () => void) {
    const sd = parseDate(start);
    const ed = parseDate(end);
    if (!sd || !ed) return null;
    const left = Math.max(0, daysFrom(minDate, sd)) * DAY_W;
    const width = Math.max(DAY_W, daysFrom(sd, ed) * DAY_W);
    return (
      <div
        className="absolute top-1/2 -translate-y-1/2 h-5 rounded-full flex items-center px-2 text-white text-[10px] font-medium overflow-hidden whitespace-nowrap shadow-sm cursor-pointer"
        style={{ left, width, backgroundColor: "transparent" }}
      >
        <div
          className={cn("absolute inset-0 rounded-full", color)}
          onClick={onClick}
          title={label}
        />
        <span className="relative truncate">{label}</span>
      </div>
    );
  }

  function todayMarker() {
    const today = new Date();
    if (today < minDate || today > maxDate) return null;
    const left = daysFrom(minDate, today) * DAY_W;
    return (
      <div
        className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
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

  const itemsBySprint: Record<number, ScrumItemResource[]> = {};
  for (const it of items) {
    if (it.sprint_id) {
      if (!itemsBySprint[it.sprint_id]) itemsBySprint[it.sprint_id] = [];
      itemsBySprint[it.sprint_id].push(it);
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex min-w-0">
        {/* Labels column */}
        <div style={{ width: LABEL_W, minWidth: LABEL_W }} className="shrink-0 border-r z-10 bg-background">
          {/* header */}
          <div className="h-8 border-b flex items-center px-3 text-xs font-semibold text-muted-foreground">
            Sprint / Tarea
          </div>
          {sprints.map((sprint) => {
            const sprintItems = itemsBySprint[sprint.id] ?? [];
            return (
              <div key={sprint.id}>
                <div className="h-9 border-b flex items-center px-3 gap-2 bg-muted/30">
                  <span className={cn("size-2 rounded-full shrink-0", SPRINT_STATUS_COLOR[sprint.status])} />
                  <span className="text-xs font-semibold truncate">{sprint.name}</span>
                </div>
                {sprintItems.map((it) => (
                  <div
                    key={it.id}
                    className="h-8 border-b flex items-center px-5 gap-2 hover:bg-muted/30 cursor-pointer"
                    onClick={() => onItemClick(it.id)}
                  >
                    <span className={cn("size-1.5 rounded-full shrink-0", STATUS_COLOR[it.status])} />
                    <span className="text-xs truncate text-muted-foreground">{it.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Timeline column */}
        <div className="overflow-x-auto flex-1">
          <div style={{ width: timelineW }}>
            {/* Month headers */}
            <div className="h-8 border-b flex relative">
              {months.map((m) => (
                <div
                  key={m.label}
                  className="border-r text-[10px] text-muted-foreground flex items-center px-2 shrink-0 overflow-hidden"
                  style={{ width: m.span * DAY_W }}
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
                      {/* grid lines */}
                      {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 w-px bg-border/60"
                          style={{ left: i * 7 * DAY_W }}
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
                            style={{ left: i * 7 * DAY_W }}
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
