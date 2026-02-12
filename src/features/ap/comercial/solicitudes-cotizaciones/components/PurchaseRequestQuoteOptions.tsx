import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";

export default function PurchaseRequestQuoteOptions({
  search,
  setSearch,
  dateFrom,
  dateTo,
  setDateRange,
  sedes,
  sedeId,
  setSedeId,
  canViewBranches,
}: {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  setDateRange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  canViewBranches: boolean;
}) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar solicitudes / cotizaciones..."
      />
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={setDateRange}
        placeholder="Seleccionar rango"
        dateFormat="d MMM yyyy"
        className="md:w-fit"
      />
      {canViewBranches && (
        <SearchableSelect
          value={sedeId}
          onChange={setSedeId}
          placeholder="Filtrar por sede"
          options={sedes.map((sede) => ({
            label: sede.abreviatura,
            value: sede.id.toString(),
          }))}
        />
      )}
    </FilterWrapper>
  );
}
