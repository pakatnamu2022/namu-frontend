"use client";

import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, isWeekend } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  canModify = true,
}: WorkScheduleCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

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
      .filter((s) => s.worker.id === workerId)
      .forEach((schedule) => {
        const dateKey = format(new Date(schedule.work_date), "yyyy-MM-dd");
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

    if (schedule) {
      const statusOption = getStatusOption(schedule.status);
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-full h-full min-h-16 p-1 rounded-md cursor-pointer transition-all",
                statusOption?.color || "bg-gray-100",
                "hover:ring-2 hover:ring-primary"
              )}
              onClick={() => canModify && onEditSchedule(schedule)}
              onMouseEnter={() => setHoveredDay(dateKey)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div className="text-xs font-medium">{format(day, "d")}</div>
              <div className="text-[10px] font-medium truncate">
                {schedule.work_type.code}
              </div>
              <div className="text-[10px]">
                {schedule.total_hours}h
                {schedule.extra_hours > 0 && (
                  <span className="text-orange-600 ml-1">+{schedule.extra_hours}</span>
                )}
              </div>
              {isHovered && canModify && (
                <div className="absolute top-1 right-1 flex gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
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
                    className="h-5 w-5 text-destructive"
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
              <p className="font-medium">{schedule.work_type.name}</p>
              <p>Horas: {schedule.hours_worked} | Extra: {schedule.extra_hours}</p>
              <p>Total: {schedule.total_hours}h</p>
              {schedule.notes && <p className="text-xs italic">{schedule.notes}</p>}
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
          canModify && "hover:bg-muted cursor-pointer"
        )}
        onClick={() => canModify && onAddSchedule(day)}
        onMouseEnter={() => setHoveredDay(dateKey)}
        onMouseLeave={() => setHoveredDay(null)}
      >
        <div className={cn(
          "text-xs font-medium",
          isSunday && "text-red-600",
          isSaturday && "text-orange-600"
        )}>
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
      <div className="bg-muted px-4 py-2 border-b">
        <h3 className="font-semibold text-sm">{workerName}</h3>
      </div>

      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={cn(
              "text-center text-xs font-medium py-2 border-r last:border-r-0",
              index === 0 && "text-red-600 bg-red-50/50",
              index === 6 && "text-orange-600 bg-orange-50/50"
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDayOffset }).map((_, index) => (
          <div key={`empty-${index}`} className="min-h-16 border-r border-b bg-muted/20" />
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
