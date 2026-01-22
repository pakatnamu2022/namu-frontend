import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";
import { SearchableSelect } from "@/shared/components/SearchableSelect.tsx";
import SearchInput from "@/shared/components/SearchInput.tsx";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  warehouses: WarehouseResource[];
  warehouseId: string;
  setWarehouseId: (value: string) => void;
}

export default function InventoryOptions({
  search,
  setSearch,
  warehouses = [],
  warehouseId,
  setWarehouseId,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar producto..."
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
    </div>
  );
}
