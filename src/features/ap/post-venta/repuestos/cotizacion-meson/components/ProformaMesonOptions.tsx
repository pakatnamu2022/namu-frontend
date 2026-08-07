import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { FilterMultiSelect } from "@/shared/components/FilterMultiSelect";
import { ORDER_QUOTATION_STATUS_GROUP } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";

const STATUS_GROUP_OPTIONS = [
  { label: "Abiertas", value: ORDER_QUOTATION_STATUS_GROUP.ABIERTAS },
  { label: "Facturadas", value: ORDER_QUOTATION_STATUS_GROUP.FACTURADAS },
  { label: "Segmentadas", value: ORDER_QUOTATION_STATUS_GROUP.SEGMENTADAS },
  { label: "Descartadas", value: ORDER_QUOTATION_STATUS_GROUP.DESCARTADAS },
];

interface Props {
  search: string;
  setSearch: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  statusGroups?: string[];
  setStatusGroups?: (value: string[]) => void;
}

export default function OrderQuotationMesonOptions({
  search,
  setSearch,
  sedes = [],
  sedeId,
  setSedeId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  statusGroups,
  setStatusGroups,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar cotización..."
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
      {setStatusGroups && (
        <FilterMultiSelect
          options={STATUS_GROUP_OPTIONS}
          value={statusGroups || []}
          onChange={setStatusGroups}
          placeholder="Abiertas / Facturadas / Segmentadas"
          className="min-w-48"
        />
      )}
    </FilterWrapper>
  );
}
