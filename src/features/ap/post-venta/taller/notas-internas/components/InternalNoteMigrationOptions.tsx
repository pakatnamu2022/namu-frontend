import SearchInput from "@/shared/components/SearchInput";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
}

export default function InternalNoteMigrationOptions({
  search,
  setSearch,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar nota interna..."
      />
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        className="w-auto min-w-56"
      />
    </FilterWrapper>
  );
}
