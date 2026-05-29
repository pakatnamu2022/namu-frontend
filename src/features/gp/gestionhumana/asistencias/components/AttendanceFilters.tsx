import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { MARK_TYPE_OPTIONS } from "../lib/attendance.constants";
import type { AttendanceFilters } from "../lib/attendance.interface";

interface Props {
  filters: AttendanceFilters;
  onFiltersChange: (filters: Partial<AttendanceFilters>) => void;
  onReset: () => void;
}

const MARK_TYPE_SELECT_OPTIONS = MARK_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export default function AttendanceFiltersBar({
  filters,
  onFiltersChange,
  onReset,
}: Props) {
  const hasActiveFilters = !!(
    filters.date ||
    filters.date_from ||
    filters.date_to ||
    filters.emp_code ||
    filters.mark_type
  );

  return (
    <div className="flex flex-wrap gap-2 items-center w-full">
      {/* Código de empleado */}
      <Input
        value={filters.emp_code ?? ""}
        onChange={(e) => onFiltersChange({ emp_code: e.target.value || undefined })}
        placeholder="Código empleado..."
        className="h-9 w-[160px]"
      />

      <FilterWrapper>
        {/* Fecha exacta */}
        <div className="flex items-center gap-1">
          <Input
            type="date"
            value={filters.date ?? ""}
            onChange={(e) =>
              onFiltersChange({
                date: e.target.value || undefined,
                date_from: undefined,
                date_to: undefined,
              })
            }
            className="h-9 w-[150px]"
            title="Fecha exacta"
          />
        </div>

        {/* Rango de fechas */}
        <Input
          type="date"
          value={filters.date_from ?? ""}
          onChange={(e) =>
            onFiltersChange({ date_from: e.target.value || undefined, date: undefined })
          }
          className="h-9 w-[150px]"
          title="Desde"
        />
        <Input
          type="date"
          value={filters.date_to ?? ""}
          onChange={(e) =>
            onFiltersChange({ date_to: e.target.value || undefined, date: undefined })
          }
          className="h-9 w-[150px]"
          title="Hasta"
        />

        {/* Tipo de marcación */}
        <SearchableSelect
          options={MARK_TYPE_SELECT_OPTIONS}
          value={filters.mark_type ?? ""}
          onChange={(v) =>
            onFiltersChange({ mark_type: (v as AttendanceFilters["mark_type"]) || undefined })
          }
          placeholder="Tipo"
          className="w-[170px]"
          classNameDiv="w-[170px]"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
            <X className="size-4" />
            Limpiar
          </Button>
        )}
      </FilterWrapper>
    </div>
  );
}
