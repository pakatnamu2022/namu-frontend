import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";
import DatePicker from "@/shared/components/DatePicker.tsx";
import { SearchableSelect } from "@/shared/components/SearchableSelect.tsx";
import SearchInput from "@/shared/components/SearchInput.tsx";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  warehouses?: WarehouseResource[];
  warehouseId?: string;
  setWarehouseId?: (value: string) => void;
}

export default function InventoryMovementsOptions({
  search,
  setSearch,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  warehouses = [],
  warehouseId,
  setWarehouseId,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar movimientos..."
      />
      {setWarehouseId && (
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
      )}
      <DatePicker
        value={dateFrom}
        onChange={setDateFrom}
        placeholder="Fecha Desde"
        showClearButton={false}
        captionLayout="dropdown"
      />
      <DatePicker
        value={dateTo}
        onChange={setDateTo}
        placeholder="Fecha Hasta"
        showClearButton={false}
        captionLayout="dropdown"
      />
    </div>
  );
}
