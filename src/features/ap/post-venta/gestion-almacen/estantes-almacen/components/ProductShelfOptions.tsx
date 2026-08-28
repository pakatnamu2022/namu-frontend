import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput.tsx";
import { SHELF_STATUS_OPTIONS } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.constants.ts";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  warehouses: WarehouseResource[];
  warehouseId: string;
  setWarehouseId: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}

export default function ProductShelfOptions({
  search,
  setSearch,
  warehouses = [],
  warehouseId,
  setWarehouseId,
  status,
  setStatus,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar estante..."
      />
      <SearchableSelect
        options={warehouses.map((item) => ({
          value: item.id.toString(),
          label: item.dyn_code,
        }))}
        value={warehouseId}
        onChange={setWarehouseId}
        placeholder="Filtrar por almacén"
        className="min-w-72"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={[{ label: "Todos", value: "" }, ...SHELF_STATUS_OPTIONS]}
        value={status}
        onChange={setStatus}
        placeholder="Todos los estados"
        className="sm:max-w-[180px]"
      />
    </FilterWrapper>
  );
}
