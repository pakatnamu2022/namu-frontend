import { SearchableSelect } from "@/shared/components/SearchableSelect";
import FilterWrapper from "@/shared/components/FilterWrapper";
import DatePicker from "@/shared/components/DatePicker";
import SearchInput from "@/shared/components/SearchInput";
import { MARK_TYPE_OPTIONS } from "../lib/attendance.constants";
import type { AttendanceFiltersProps } from "../lib/attendance.interface";

type OtherFilters = Omit<
  AttendanceFiltersProps,
  "date" | "date_from" | "date_to"
>;

interface Props {
  filters: OtherFilters;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  onFiltersChange: (filters: Partial<OtherFilters>) => void;
}

const MARK_TYPE_SELECT_OPTIONS = MARK_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export default function AttendanceFilters({
  filters,
  date,
  setDate,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onFiltersChange,
}: Props) {
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
            mark_type: (v as AttendanceFiltersProps["mark_type"]) || undefined,
          })
        }
        placeholder="Tipo"
      />
    </FilterWrapper>
  );
}
