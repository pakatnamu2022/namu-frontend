import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput";

export default function ShipmentsReceptionsOptions({
  search,
  setSearch,
  dateFrom,
  dateTo,
  setDateRange,
}: {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  setDateRange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
}) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar guía de remisión o traslado..."
      />
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={setDateRange}
        placeholder="Seleccionar rango"
        dateFormat="d MMM yyyy"
        className="md:w-fit"
      />
    </FilterWrapper>
  );
}
