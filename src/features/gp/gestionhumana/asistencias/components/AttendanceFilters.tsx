import { X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import FilterWrapper from "@/shared/components/FilterWrapper";
import DatePicker from "@/shared/components/DatePicker";
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

function toDateString(date: Date | undefined): string | undefined {
  return date ? format(date, "yyyy-MM-dd") : undefined;
}

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
        <div className="w-40">
          <DatePicker
            value={filters.date}
            onChange={(date) =>
              onFiltersChange({
                date: toDateString(date),
                date_from: undefined,
                date_to: undefined,
              })
            }
            placeholder="Fecha exacta"
          />
        </div>

        {/* Rango desde */}
        <div className="w-[150px]">
          <DatePicker
            value={filters.date_from}
            onChange={(date) =>
              onFiltersChange({ date_from: toDateString(date), date: undefined })
            }
            placeholder="Desde"
          />
        </div>

        {/* Rango hasta */}
        <div className="w-[150px]">
          <DatePicker
            value={filters.date_to}
            onChange={(date) =>
              onFiltersChange({ date_to: toDateString(date), date: undefined })
            }
            placeholder="Hasta"
          />
        </div>

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
