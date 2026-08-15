"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { EMPRESA_AP, MONTH_OPTIONS } from "@/core/core.constants";
import { generateYear } from "@/core/core.function";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { cn } from "@/lib/utils";

interface ObjectivesDashboardFiltersProps {
  year: number;
  month: number;
  sedeId: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onSedeChange: (sedeId: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function ObjectivesDashboardFilters({
  year,
  month,
  sedeId,
  onYearChange,
  onMonthChange,
  onSedeChange,
  onRefresh,
  isRefreshing = false,
}: ObjectivesDashboardFiltersProps) {
  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const YEAR_OPTIONS = generateYear().map((y) => ({
    value: y.toString(),
    label: y.toString(),
  }));

  return (
    <div className="flex flex-wrap items-end gap-2">
      <SearchableSelect
        label="Sede"
        value={sedeId}
        onChange={onSedeChange}
        options={sedes.map((item) => ({
          label: item.description,
          value: item.id.toString(),
        }))}
        placeholder={isLoadingSedes ? "Cargando..." : "Todas las sedes"}
        disabled={isLoadingSedes}
        buttonSize="sm"
        classNameDiv="min-w-[180px]"
      />

      <SearchableSelect
        label="Año"
        value={year.toString()}
        onChange={(value) => onYearChange(Number(value))}
        options={YEAR_OPTIONS}
        placeholder="Año"
        showSearch={false}
        allowClear={false}
        buttonSize="sm"
      />

      <SearchableSelect
        label="Mes"
        value={month.toString()}
        onChange={(value) => onMonthChange(Number(value))}
        options={MONTH_OPTIONS}
        placeholder="Mes"
        showSearch={false}
        allowClear={false}
        buttonSize="sm"
        classNameDiv="min-w-[150px]"
      />

      <Button
        size="sm"
        variant="outline"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw
          className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
        />
        Actualizar
      </Button>
    </div>
  );
}
