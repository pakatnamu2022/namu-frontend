import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput";

interface VehicleOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function VehicleOptions({
  search,
  setSearch,
}: VehicleOptionsProps) {
  return (
    <FilterWrapper>
      <SearchInput
        placeholder="Buscar por VIN, modelo..."
        value={search}
        onChange={setSearch}
      />
    </FilterWrapper>
  );
}
