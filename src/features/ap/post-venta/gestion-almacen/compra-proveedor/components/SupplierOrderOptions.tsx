import SearchInput from "@/shared/components/SearchInput.tsx";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface.ts";
import { SearchableSelect } from "@/shared/components/SearchableSelect.tsx";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";

interface SupplierOrderOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
}

export default function SupplierOrderOptions({
  search,
  setSearch,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  sedes = [],
  sedeId,
  setSedeId,
}: SupplierOrderOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por número de pedido, proveedor..."
      />
      <SearchableSelect
        options={sedes.map((item) => ({
          value: item.id.toString(),
          label: item.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Filtrar por sede"
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
