import { X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import FilterWrapper from "@/shared/components/FilterWrapper";
import DatePicker from "@/shared/components/DatePicker";
import SearchInput from "@/shared/components/SearchInput";
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
    filters.search ||
    filters.date ||
    filters.date_from ||
    filters.date_to ||
    filters.emp_code ||
    filters.mark_type
  );

  return (
    <FilterWrapper>
      <SearchInput
        value={filters.search ?? ""}
        onChange={(v) => onFiltersChange({ search: v || undefined })}
        placeholder="Buscar..."
      />
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

      <DatePicker
        value={filters.date_from}
        onChange={(date) =>
          onFiltersChange({ date_from: toDateString(date), date: undefined })
        }
        placeholder="Desde"
      />

      <DatePicker
        value={filters.date_to}
        onChange={(date) =>
          onFiltersChange({ date_to: toDateString(date), date: undefined })
        }
        placeholder="Hasta"
      />

      <SearchableSelect
        options={MARK_TYPE_SELECT_OPTIONS}
        value={filters.mark_type ?? ""}
        onChange={(v) =>
          onFiltersChange({
            mark_type: (v as AttendanceFilters["mark_type"]) || undefined,
          })
        }
        placeholder="Tipo"
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="size-4" />
        </Button>
      )}
    </FilterWrapper>
  );
}
