"use client";

import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  useDailyDelivery,
  useExportDailyDelivery,
} from "../lib/daily-delivery.hook";
import DailySummaryCards from "./DailySummaryCards";
import HierarchyTree from "./HierarchyTree";
import BrandReport from "./BrandReport";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";

export default function DailyDeliveryDashboard() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("hierarchy");

  const formattedDateFrom = dateFrom ? format(dateFrom, "yyyy-MM-dd") : "";
  const formattedDateTo = dateTo ? format(dateTo, "yyyy-MM-dd") : "";

  const { data, isLoading, error } = useDailyDelivery(
    formattedDateFrom,
    formattedDateTo
  );
  const { mutate: exportToExcel, isPending: isExporting } =
    useExportDailyDelivery();

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleExport = () => {
    exportToExcel({ dateFrom: formattedDateFrom, dateTo: formattedDateTo });
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

          <DateRangePickerFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={handleDateChange}
            placeholder="Seleccionar rango"
            dateFormat="d MMM yyyy"
            className="h-8 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-lg border bg-muted/20 animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 rounded-lg border bg-muted/20 animate-pulse" />
        </div>
      ) : data ? (
        <>
          <DailySummaryCards
            summary={data.summary}
            hierarchy={data.hierarchy}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="hierarchy">Por Jerarquía</TabsTrigger>
              <TabsTrigger value="brands">Por Marcas</TabsTrigger>
            </TabsList>

            <TabsContent value="hierarchy" className="mt-4">
              <HierarchyTree hierarchy={data.hierarchy} />
            </TabsContent>

            <TabsContent value="brands" className="mt-4">
              <BrandReport brandReport={data.brand_report} />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
