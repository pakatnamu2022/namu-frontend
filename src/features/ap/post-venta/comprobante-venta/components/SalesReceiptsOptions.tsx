import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { DOCUMENT_STATUS } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  consolidationType?: string;
  setConsolidationType?: (value: string) => void;
  isAccounted?: string;
  setIsAccounted?: (value: string) => void;
}

const CONSOLIDATION_TYPE_OPTIONS = [
  { value: "massive", label: "Masivo" },
  { value: "simple", label: "Directo" },
];

const IS_ACCOUNTED_OPTIONS = [
  { value: "1", label: "Contabilizado" },
  { value: "0", label: "No contabilizado" },
];

export default function SalesReceiptsOptions({
  search,
  setSearch,
  sedes = [],
  sedeId,
  setSedeId,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  consolidationType,
  setConsolidationType,
  isAccounted,
  setIsAccounted,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por cliente, serie, número..."
      />
      <SearchableSelect
        options={sedes.map((item) => ({
          value: item.id.toString(),
          label: item.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Filtrar por sede"
        className="min-w-56"
        classNameOption="text-xs"
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

      {setStatusFilter && (
        <SearchableSelect
          onChange={setStatusFilter}
          value={statusFilter}
          className="min-w-44"
          placeholder="Seleccionar Estado"
          options={DOCUMENT_STATUS.map((status) => ({
            value: status.value,
            label: status.label,
          }))}
        />
      )}

      {setConsolidationType && (
        <SearchableSelect
          onChange={setConsolidationType}
          value={consolidationType ?? ""}
          className="min-w-24"
          placeholder="Tipo de consolidación"
          options={CONSOLIDATION_TYPE_OPTIONS}
        />
      )}

      {setIsAccounted && (
        <SearchableSelect
          onChange={setIsAccounted}
          value={isAccounted ?? ""}
          className="min-w-44"
          placeholder="Contabilización"
          options={IS_ACCOUNTED_OPTIONS}
        />
      )}
    </FilterWrapper>
  );
}
