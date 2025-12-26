"use client";

import {
  CalendarProvider,
  CalendarDate,
  CalendarDatePicker,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePagination,
  CalendarHeader,
  CalendarBody,
  type CalendarDayData,
  useCalendarMonth,
  useCalendarYear,
} from "@/shared/components/CalendarGrid";
import CalendarDay from "./CalendarDay";
import { useEffect } from "react";

interface AgendaCalendarCardProps {
  agendaMap: Map<string, any>;
  selectedDate: string | null;
  onDayClick: (dayData: CalendarDayData) => void;
  setSelectedDate: (date: string | null) => void;
}

function CalendarSync({
  selectedDate,
}: {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}) {
  const [month, setMonth] = useCalendarMonth();
  const [year, setYear] = useCalendarYear();

  // Sync calendar view to match selected date when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const newMonth = date.getMonth();
      const newYear = date.getFullYear();

      // Only update calendar view if it doesn't match the selected date
      if (month !== newMonth || year !== newYear) {
        setMonth(newMonth as any);
        setYear(newYear);
      }
    }
  }, [selectedDate, month, year, setMonth, setYear]);

  return null;
}

export default function AgendaCalendarCard({
  agendaMap,
  selectedDate,
  onDayClick,
  setSelectedDate,
}: AgendaCalendarCardProps) {
  return (
    <div className="lg:col-span-2 flex flex-col gap-4">
      <div>
        <CalendarProvider
          locale="es-ES"
          startDay={1}
          className="w-full border rounded-lg bg-background"
        >
          <CalendarSync
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <CalendarDate>
            <CalendarDatePicker>
              <CalendarMonthPicker className="w-fit text-xs sm:text-sm font-bold text-primary" />
              <CalendarYearPicker
                className="w-fit text-xs sm:text-sm font-bold text-primary"
                start={2024}
                end={2030}
              />
            </CalendarDatePicker>
            <CalendarDatePagination />
          </CalendarDate>

          <CalendarHeader />

          <CalendarBody
            onDayClick={onDayClick}
            renderDay={({ dayData, onClick }) => (
              <CalendarDay
                dayData={dayData}
                agendaMap={agendaMap}
                selectedDate={selectedDate}
                onClick={onClick}
              />
            )}
          />
        </CalendarProvider>
      </div>
    </div>
  );
}
