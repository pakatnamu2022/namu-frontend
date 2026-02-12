"use client";

import { CheckCircle2, CircleMinus } from "lucide-react";
import type { CalendarDayData } from "@/shared/components/CalendarGrid";
import { Badge } from "@/components/ui/badge";

interface CalendarDayProps {
  dayData: CalendarDayData;
  agendaMap: Map<string, any>;
  selectedDate: string | null;
  onClick?: (dayData: CalendarDayData) => void;
}

export default function CalendarDay({
  dayData,
  agendaMap,
  selectedDate,
  onClick,
}: CalendarDayProps) {
  const now = new Date();
  const dateStr = dayData.date.toISOString().split("T")[0];
  const dayAgenda = agendaMap.get(dateStr);
  const isToday = dateStr === now.toISOString().split("T")[0];
  const isSelected = selectedDate === dateStr;

  const positiveCount = dayAgenda?.count_positive_result || 0;
  const negativeCount = dayAgenda?.count_negative_result || 0;
  const totalCount = dayAgenda?.count || 0;

  return (
    <div
      className={`relative h-full w-full p-1 md:p-2 cursor-pointer border-l-2 transition-all hover:bg-muted min-h-[100px] ${
        isToday
          ? "border-l-blue-500 bg-blue-50 dark:bg-blue-900/30"
          : isSelected
            ? "border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
            : "border-l-transparent"
      } ${!dayData.isCurrentMonth ? "opacity-50 bg-muted" : ""}`}
      onClick={() => onClick?.(dayData)}
    >
      <div
        className={`font-medium text-xs md:text-sm mb-2 ${
          isToday ? "text-blue-700" : isSelected ? "text-indigo-700" : ""
        }`}
      >
        {dayData.day}
        {isToday && <span className="ml-1 text-blue-500">•</span>}
      </div>

      {dayData.isCurrentMonth && totalCount > 0 && (
        <div className="flex flex-row gap-1">
          {/* Acciones exitosas */}
          {positiveCount > 0 && (
            <Badge color="blue" icon={CheckCircle2} variant="outline">
              <span>{positiveCount}</span>
            </Badge>
          )}
          {/* Acciones sin resultado */}
          {negativeCount > 0 && (
            <Badge color="red" icon={CircleMinus} variant="outline">
              <span>{negativeCount}</span>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
