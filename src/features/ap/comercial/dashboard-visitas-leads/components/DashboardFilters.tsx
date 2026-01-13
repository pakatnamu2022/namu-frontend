"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import { errorToast, successToast } from "@/core/core.function";
import { downloadDashboardFile } from "../lib/dashboard.actions";
import ExportButtons from "@/shared/components/ExportButtons";

interface DashboardFiltersProps {
  dashboardType: "VISITA" | "LEADS";
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDashboardTypeChange: (type: "VISITA" | "LEADS") => void;
  onDateChange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
}

export default function DashboardFilters({
  dashboardType,
  dateFrom,
  dateTo,
  onDashboardTypeChange,
  onDateChange,
}: DashboardFiltersProps) {
  const formatDate = (date: Date | undefined) => {
    return date ? date.toISOString().split("T")[0] : "";
  };

  const handleExcelDownload = async () => {
    if (!dateFrom || !dateTo) {
      errorToast("Por favor seleccione un rango de fechas");
      return;
    }

    try {
      await downloadDashboardFile({
        date_from: formatDate(dateFrom),
        date_to: formatDate(dateTo),
        type: dashboardType,
      });
      successToast("Archivo Excel descargado exitosamente");
    } catch (error: any) {
      errorToast(
        "Error al descargar el Excel. Por favor, intente nuevamente.",
        error.response.data?.message?.toString()
      );
    }
  };

  const handlePDFDownload = async () => {
    if (!dateFrom || !dateTo) {
      errorToast("Por favor seleccione un rango de fechas");
      return;
    }

    try {
      await downloadDashboardFile({
        date_from: formatDate(dateFrom),
        date_to: formatDate(dateTo),
        type: dashboardType,
        format: "pdf",
      });
      successToast("Archivo PDF descargado exitosamente");
    } catch (error: any) {
      errorToast(
        "Error al descargar el PDF. Por favor, intente nuevamente.",
        error.response.data?.message?.toString()
      );
    }
  };

  return (
    <div className="flex flex-row gap-2 md:gap-4 items-center flex-wrap">
      {/* Export Buttons */}
      <ExportButtons
        onExcelDownload={handleExcelDownload}
        onPdfDownload={handlePDFDownload}
        disableExcel={!dateFrom || !dateTo}
        disablePdf={!dateFrom || !dateTo}
        variant="grouped"
      />

      {/* Type ButtonGroup */}
      <ButtonGroup>
        <Button
          size="sm"
          variant={dashboardType === "LEADS" ? "default" : "outline"}
          onClick={() => onDashboardTypeChange("LEADS")}
        >
          Leads
        </Button>
        <Button
          size="sm"
          variant={dashboardType === "VISITA" ? "default" : "outline"}
          onClick={() => onDashboardTypeChange("VISITA")}
        >
          Visitas
        </Button>
      </ButtonGroup>

      {/* Date Range Filter */}
      <div className="flex-1 min-w-[300px]">
        <DateRangePickerFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={onDateChange}
          placeholder="Selecciona un rango de fechas"
        />
      </div>
    </div>
  );
}
