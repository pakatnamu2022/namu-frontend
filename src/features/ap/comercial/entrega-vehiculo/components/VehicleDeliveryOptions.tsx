import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput";

export default function VehicleDeliveryOptions({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar entrega de vehículo..."
      />
      <DateRangePickerFilter
        onDateChange={() => {}}
        placeholder="Filtrar por fecha"
      />
    </FilterWrapper>
  );
}
