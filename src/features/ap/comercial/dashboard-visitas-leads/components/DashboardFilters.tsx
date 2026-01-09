"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";

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
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      {/* Type ButtonGroup */}
      <ButtonGroup>
        <Button
          variant={dashboardType === "LEADS" ? "default" : "outline"}
          onClick={() => onDashboardTypeChange("LEADS")}
        >
          Leads
        </Button>
        <Button
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
          className="h-10"
        />
      </div>
    </div>
  );
}
