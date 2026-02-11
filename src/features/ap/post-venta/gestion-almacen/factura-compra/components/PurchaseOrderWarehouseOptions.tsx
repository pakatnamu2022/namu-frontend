import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import ResponsiveFilters from "@/shared/components/ResponsiveFilters";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";

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
    <ResponsiveFilters
      title="Filtros"
      description="Filtra las órdenes de compra de vehículos"
      breakpoint="lg"
    >
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
    </ResponsiveFilters>
  );
}
