import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import FilterWrapper from "@/shared/components/FilterWrapper";
import DatePicker from "@/shared/components/DatePicker";
import SearchInput from "@/shared/components/SearchInput";
import { MARK_TYPE_OPTIONS } from "../lib/attendance.constants";
import type { AttendanceFilters } from "../lib/attendance.interface";

type OtherFilters = Omit<AttendanceFilters, "date" | "date_from" | "date_to">;

interface Props {
  filters: OtherFilters;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  onFiltersChange: (filters: Partial<OtherFilters>) => void;
  onReset: () => void;
}

const MARK_TYPE_SELECT_OPTIONS = MARK_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export default function AttendanceFiltersBar({
  filters,
  date,
  setDate,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onFiltersChange,
  onReset,
}: Props) {
  const hasActiveFilters = !!(
    filters.search ||
    date ||
    dateFrom ||
    dateTo ||
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
        value={date}
        onChange={(d) => {
          setDate(d);
          setDateFrom(undefined);
          setDateTo(undefined);
        }}
        placeholder="Fecha exacta"
      />
      <DatePicker
        value={dateFrom}
        onChange={(d) => {
          setDateFrom(d);
          setDate(undefined);
        }}
        placeholder="Desde"
      />
      <DatePicker
        value={dateTo}
        onChange={(d) => {
          setDateTo(d);
          setDate(undefined);
        }}
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
