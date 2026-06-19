"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ScrumItemResource,
  ScrumItemStatus,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";

const STATUS_DOT: Record<ScrumItemStatus, string> = {
  backlog: "bg-slate-400",
  por_hacer: "bg-blue-400",
  en_progreso: "bg-amber-400",
  en_revision: "bg-purple-400",
  hecho: "bg-emerald-400",
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface Props {
  items: ScrumItemResource[];
  isLoading: boolean;
  onItemClick: (id: number) => void;
}

export function CalendarView({ items, isLoading, onItemClick }: Props) {
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { year, month } = current;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const itemsByDate: Record<string, ScrumItemResource[]> = {};
  for (const item of items) {
    if (!item.due_date) continue;
    const key = item.due_date.slice(0, 10);
    if (!itemsByDate[key]) itemsByDate[key] = [];
    itemsByDate[key].push(item);
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const dayKey = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`;

  const selectedItems = selectedDay ? (itemsByDate[selectedDay] ?? []) : [];

  const prev = () =>
    setCurrent(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );

  const next = () =>
    setCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex-1 overflow-auto flex gap-4 p-2">
      {/* Calendar grid */}
      <div className="flex-1 min-w-0">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="size-7" onClick={prev}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold">
            {MONTHS[month]} {year}
          </span>
          <Button variant="ghost" size="icon" className="size-7" onClick={next}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="bg-background min-h-[60px]" />;
            }
            const key = dayKey(day);
            const dayItems = itemsByDate[key] ?? [];
            const isSelected = selectedDay === key;
            const isToday =
              new Date().toISOString().slice(0, 10) === key;

            return (
              <div
                key={key}
                onClick={() => setSelectedDay(isSelected ? null : key)}
                className={cn(
                  "bg-background min-h-[60px] p-1 cursor-pointer hover:bg-muted/50 transition-colors",
                  isSelected && "ring-2 ring-inset ring-primary",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium inline-flex size-5 items-center justify-center rounded-full",
                    isToday && "bg-primary text-primary-foreground",
                    !isToday && "text-foreground",
                  )}
                >
                  {day}
                </span>
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {dayItems.slice(0, 4).map((item) => (
                    <span
                      key={item.id}
                      className={cn(
                        "inline-block size-1.5 rounded-full",
                        STATUS_DOT[item.status],
                      )}
                    />
                  ))}
                  {dayItems.length > 4 && (
                    <span className="text-[9px] text-muted-foreground">+{dayItems.length - 4}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
          {(Object.entries(STATUS_DOT) as [ScrumItemStatus, string][]).map(([status, dot]) => (
            <div key={status} className="flex items-center gap-1">
              <span className={cn("size-2 rounded-full", dot)} />
              {status.replace("_", " ")}
            </div>
          ))}
        </div>
      </div>

      {/* Side panel: items for selected day */}
      {selectedDay && (
        <div className="w-72 shrink-0 border rounded-lg p-3 overflow-y-auto max-h-[calc(100vh-280px)]">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            {selectedDay} — {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}
          </p>
          {selectedItems.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin items este día</p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className="flex items-start gap-2 p-2 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", STATUS_DOT[item.status])} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium line-clamp-2">{item.title}</p>
                    {item.assignee && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.assignee.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
