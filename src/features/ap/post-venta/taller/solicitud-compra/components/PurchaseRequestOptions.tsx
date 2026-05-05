import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";

interface PurchaseRequestOptionsProps {
  search: string;
  setSearch: (search: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  warehouses: WarehouseResource[];
  warehouseId: string;
  setWarehouseId: (value: string) => void;
}

export default function PurchaseRequestOptions({
  search,
  setSearch,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  warehouses = [],
  warehouseId,
  setWarehouseId,
}: PurchaseRequestOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar solicitud de compra..."
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
        allowClear={false}
      />
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        className="w-auto min-w-56"
      />
    </div>
  );
}
