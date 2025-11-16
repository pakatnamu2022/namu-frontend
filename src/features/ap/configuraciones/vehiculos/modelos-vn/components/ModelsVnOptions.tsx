import SearchInput from "@/src/shared/components/SearchInput";
import { SearchableSelect } from "@/src/shared/components/SearchableSelect";
import { BrandsResource } from "../../marcas/lib/brands.interface";

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
    <div className="flex items-center gap-2 flex-wrap">
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
    </div>
  );
}
