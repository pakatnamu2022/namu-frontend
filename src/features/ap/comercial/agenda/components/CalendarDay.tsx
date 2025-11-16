"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { CalendarDayData } from "@/src/shared/components/CalendarGrid";

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
          ? "border-l-blue-500 bg-blue-50"
          : isSelected
          ? "border-l-indigo-500 bg-indigo-50"
          : "border-l-transparent"
      } ${!dayData.isCurrentMonth ? "opacity-50 bg-gray-50" : ""}`}
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
        <div className="space-y-1">
          {/* Acciones exitosas */}
          {positiveCount > 0 && (
            <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 md:py-1 rounded">
              <CheckCircle2 className="size-2 md:size-3" />
              <span>{positiveCount}</span>
            </div>
          )}
          {/* Acciones sin resultado */}
          {negativeCount > 0 && (
            <div className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 md:py-1 rounded">
              <Circle className="size-2 md:size-3" />
              <span>{negativeCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
