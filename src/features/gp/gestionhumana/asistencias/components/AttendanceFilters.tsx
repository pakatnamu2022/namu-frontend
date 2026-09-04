import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import SearchInput from "@/shared/components/SearchInput";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { MARK_TYPE_OPTIONS } from "../lib/attendance.constants";
import type { AttendanceFiltersProps } from "../lib/attendance.interface";

type OtherFilters = Omit<
  AttendanceFiltersProps,
  "date" | "date_from" | "date_to"
>;

interface Props {
  filters: OtherFilters;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onFiltersChange: (filters: Partial<OtherFilters>) => void;
}

const MARK_TYPE_SELECT_OPTIONS = MARK_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export default function AttendanceFilters({
  filters,
  dateRange,
  onDateRangeChange,
  onFiltersChange,
}: Props) {
  const { data: sedes = [] } = useAllSedes();

  const sedeOptions = useMemo(
    () =>
      sedes.map((sede) => ({
        value: String(sede.id),
        label: sede.abreviatura,
      })),
    [sedes],
  );

  return (
    <FilterWrapper>
      <SearchInput
        value={filters.search ?? ""}
        onChange={(v) => onFiltersChange({ search: v || undefined })}
        placeholder="Filtrar por nombre o código"
      />
      <DateRangePickerFilter
        dateFrom={dateRange?.from}
        dateTo={dateRange?.to}
        onDateChange={(from, to) => onDateRangeChange({ from, to })}
        placeholder="Filtrar por fecha"
      />
      <SearchableSelect
        options={MARK_TYPE_SELECT_OPTIONS}
        value={filters.mark_type ?? ""}
        onChange={(v) =>
          onFiltersChange({
            mark_type: (v as AttendanceFiltersProps["mark_type"]) || undefined,
          })
        }
        placeholder="Filtrar por tipo de marca"
      />
      <SearchableSelect
        options={sedeOptions}
        value={filters.person$sede_id ? String(filters.person$sede_id) : ""}
        onChange={(v) => onFiltersChange({ person$sede_id: v || undefined })}
        placeholder="Filtrar por sede"
      />
    </FilterWrapper>
  );
}
