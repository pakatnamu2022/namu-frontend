"use client";

import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isWeekend,
  parseISO,
  isBefore,
  isAfter,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { WorkScheduleResource } from "../lib/work-schedule.interface";
import { getStatusOption } from "../lib/work-schedule.constant";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkScheduleCalendarProps {
  year: number;
  month: number;
  schedules: WorkScheduleResource[];
  workerId: number;
  workerName: string;
  periodStartDate?: string;
  periodEndDate?: string;
  onAddSchedule: (date: Date) => void;
  onEditSchedule: (schedule: WorkScheduleResource) => void;
  onDeleteSchedule: (scheduleId: number) => void;
  canModify?: boolean;
}

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function WorkScheduleCalendar({
  year,
  month,
  schedules,
  workerId,
  workerName,
  periodStartDate,
  periodEndDate,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  canModify = true,
}: WorkScheduleCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const periodStart = useMemo(
    () => (periodStartDate ? parseISO(periodStartDate) : null),
    [periodStartDate],
  );
  const periodEnd = useMemo(
    () => (periodEndDate ? parseISO(periodEndDate) : null),
    [periodEndDate],
  );

  const isDayOutsidePeriod = (day: Date): boolean => {
    if (!periodStart || !periodEnd) return false;
    return isBefore(day, periodStart) || isAfter(day, periodEnd);
  };

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    return eachDayOfInterval({ start, end });
  }, [year, month]);

  const firstDayOffset = useMemo(() => {
    return getDay(startOfMonth(new Date(year, month - 1)));
  }, [year, month]);

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, WorkScheduleResource>();
    schedules
      .filter((s) => (s.worker_id ?? s.worker?.id) === workerId)
      .forEach((schedule) => {
        if (!schedule.work_date) return;
        // work_date puede venir como ISO completo "2026-02-02T05:00:00.000000Z"
        // o como fecha sola "2026-02-02". Extraemos solo la parte yyyy-MM-dd.
        const dateKey = schedule.work_date.slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
        map.set(dateKey, schedule);
      });
    return map;
  }, [schedules, workerId]);

  const getScheduleForDay = (day: Date): WorkScheduleResource | undefined => {
    const dateKey = format(day, "yyyy-MM-dd");
    return schedulesByDate.get(dateKey);
  };

  const renderDayContent = (day: Date) => {
    const schedule = getScheduleForDay(day);
    const dateKey = format(day, "yyyy-MM-dd");
    const isHovered = hoveredDay === dateKey;
    const isSunday = getDay(day) === 0;
    const isSaturday = getDay(day) === 6;
    const isOutsidePeriod = isDayOutsidePeriod(day);

    if (isOutsidePeriod) {
      return (
        <div
          className="w-full h-full min-h-16 p-1 rounded-md bg-muted/50 opacity-40 cursor-not-allowed"
          title="Fuera del rango del período"
        >
          <div className="text-xs font-medium text-muted-foreground">
            {format(day, "d")}
          </div>
        </div>
      );
    }

    if (schedule) {
      const statusOption = getStatusOption(schedule.status);
      const isAbsent = schedule.code === "F" || schedule.hours_worked === 0;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-full h-full min-h-16 p-1 rounded-md cursor-pointer transition-all",
                isAbsent ? "bg-red-200 text-red-900" : (statusOption?.color || "bg-gray-100"),
                "hover:ring-2 hover:ring-primary",
                isAbsent && "ring-2 ring-red-500",
              )}
              onClick={() => canModify && onEditSchedule(schedule)}
              onMouseEnter={() => setHoveredDay(dateKey)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium">{format(day, "d")}</div>
                {isAbsent && (
                  <span className="text-[8px] font-bold text-white bg-red-500 rounded px-1 leading-tight">
                    FALTÓ
                  </span>
                )}
              </div>
              <div className="text-[10px] font-bold truncate">
                {schedule.code}
              </div>
              <div className="text-[10px] truncate opacity-75">
                {statusOption?.label}
              </div>
              {!!schedule.extra_hours && (
                <div className="text-[9px] font-semibold text-amber-700">
                  +{schedule.extra_hours}h extra
                </div>
              )}
              {isHovered && canModify && (
                <div className="absolute top-1 right-1 flex gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    color="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSchedule(schedule);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSchedule(schedule.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Código: {schedule.code}</p>
              <p>Estado: {statusOption?.label}</p>
              {schedule.hours_worked != null && (
                <p>Horas trabajadas: {schedule.hours_worked}h</p>
              )}
              {!!schedule.extra_hours && (
                <p>Horas extra: {schedule.extra_hours}h</p>
              )}
              {schedule.notes && (
                <p className="text-xs italic">{schedule.notes}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <div
        className={cn(
          "w-full h-full min-h-16 p-1 rounded-md transition-all relative group",
          isSunday && "bg-red-50",
          isSaturday && "bg-orange-50",
          !isWeekend(day) && "bg-muted/30",
          canModify && "hover:bg-muted cursor-pointer",
        )}
        onClick={() => canModify && onAddSchedule(day)}
        onMouseEnter={() => setHoveredDay(dateKey)}
        onMouseLeave={() => setHoveredDay(null)}
      >
        <div
          className={cn(
            "text-xs font-medium",
            isSunday && "text-red-600",
            isSaturday && "text-orange-600",
          )}
        >
          {format(day, "d")}
        </div>
        {canModify && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="bg-muted px-4 py-2 border-b flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">{workerName}</h3>
        {periodStart && periodEnd && (
          <span className="text-xs text-muted-foreground shrink-0">
            Período:{" "}
            <span className="font-medium text-foreground">
              {format(periodStart, "d MMM", { locale: es })}
            </span>
            {" – "}
            <span className="font-medium text-foreground">
              {format(periodEnd, "d MMM yyyy", { locale: es })}
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={cn(
              "text-center text-xs font-medium py-2 border-r last:border-r-0",
              index === 0 && "text-red-600 bg-red-50/50",
              index === 6 && "text-orange-600 bg-orange-50/50",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDayOffset }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="min-h-16 border-r border-b bg-muted/20"
          />
        ))}

        {daysInMonth.map((day) => (
          <div
            key={day.toISOString()}
            className="border-r border-b last:border-r-0 relative"
          >
            {renderDayContent(day)}
          </div>
        ))}
      </div>
    </div>
  );
}
