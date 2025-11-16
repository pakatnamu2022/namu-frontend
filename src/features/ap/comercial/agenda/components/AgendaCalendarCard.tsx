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
} from "@/src/shared/components/CalendarGrid";
import CalendarDay from "./CalendarDay";

interface AgendaCalendarCardProps {
  agendaMap: Map<string, any>;
  selectedDate: string | null;
  onDayClick: (dayData: CalendarDayData) => void;
}

export default function AgendaCalendarCard({
  agendaMap,
  selectedDate,
  onDayClick,
}: AgendaCalendarCardProps) {
  return (
    <div className="lg:col-span-2 flex flex-col gap-4">
      <div>
        <CalendarProvider
          locale="es-ES"
          startDay={1}
          className="w-full border rounded-lg bg-background"
        >
          <CalendarDate>
            <CalendarDatePicker>
              <CalendarMonthPicker className="w-fit text-xs sm:text-sm font-bold text-primary" />
              <CalendarYearPicker
                className="w-fit text-xs sm:text-sm font-bold text-primary"
                start={2020}
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
