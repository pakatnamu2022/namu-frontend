import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { BrandsResource } from "../../marcas/lib/brands.interface";
import FilterWrapper from "@/shared/components/FilterWrapper";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  brands: BrandsResource[];
  brandId: string;
  setBrandId: (value: string) => void;
}

export default function ModelsVnOptions({
  search,
  setSearch,
  brands = [],
  brandId,
  setBrandId,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar modelo VN..."
      />
      <SearchableSelect
        options={brands.map((brand) => ({
          value: brand.id.toString(),
          label: brand.name,
        }))}
        value={brandId}
        onChange={setBrandId}
        placeholder="Filtrar por marca"
        className="min-w-72"
        classNameOption="text-xs"
      />
    </FilterWrapper>
  );
}
