import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import FilterWrapper from "@/shared/components/FilterWrapper";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
}

export default function PurchaseOrderWarehouseOptions({
  search,
  setSearch,
  sedeId,
  sedes,
  setSedeId,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar ..."
      />

      <SearchableSelect
        options={sedes.map((item) => ({
          value: item.id.toString(),
          label: item.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Seleccionar sede"
        className="min-w-[250px]"
        classNameOption="text-xs"
      />
    </FilterWrapper>
  );
}
