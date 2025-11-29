"use client";

import { Calendar, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDailyDelivery, useExportDailyDelivery } from "../lib/daily-delivery.hook";
import DailySummaryCards from "./DailySummaryCards";
import HierarchyTree from "./HierarchyTree";

export default function DailyDeliveryDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const { data, isLoading, error } = useDailyDelivery(formattedDate);
  const { mutate: exportToExcel, isPending: isExporting } = useExportDailyDelivery();

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleExport = () => {
    exportToExcel(formattedDate);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-red-900 mb-1">
              Error al cargar datos
            </h3>
            <p className="text-xs text-red-600">
              {error instanceof Error
                ? error.message
                : "Ocurrió un error inesperado"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Dashboard de Entregas
          </h1>
          <p className="text-xs text-muted-foreground">
            Resumen de entregas y facturación del día
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            disabled={isExporting || isLoading}
            className="h-8 gap-1.5 text-xs"
            size="sm"
          >
            <FileSpreadsheet className="h-3 w-3" />
            {isExporting ? "Exportando..." : "Exportar"}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 gap-1.5 text-xs" size="sm">
                <Calendar className="h-3 w-3" />
                {format(selectedDate, "d MMM yyyy", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg border bg-muted/20 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-lg border bg-muted/20 animate-pulse" />
        </div>
      ) : data ? (
        <>
          <DailySummaryCards summary={data.summary} />
          <HierarchyTree hierarchy={data.hierarchy} />
        </>
      ) : null}
    </div>
  );
}
