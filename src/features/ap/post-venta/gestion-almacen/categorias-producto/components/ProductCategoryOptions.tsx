import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput.tsx";

export default function ProductCategoryOptions({
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
        placeholder="Buscar categoría de producto..."
      />
    </FilterWrapper>
  );
}
