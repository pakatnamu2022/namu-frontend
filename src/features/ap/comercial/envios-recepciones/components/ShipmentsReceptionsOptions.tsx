import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";

export default function ShipmentsReceptionsOptions({
  search,
  setSearch,
  dateFrom,
  dateTo,
  setDateRange,
  transferReasons,
  transferReasonId,
  setTransferReasonId,
}: {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  setDateRange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
  transferReasons: SunatConceptsResource[];
  transferReasonId: string;
  setTransferReasonId: (value: string) => void;
}) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar guía de remisión o traslado..."
      />
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={setDateRange}
        placeholder="Seleccionar rango"
        dateFormat="d MMM yyyy"
        className="md:w-fit"
      />
      <SearchableSelect
        options={transferReasons.map((reason) => ({
          value: reason.id.toString(),
          label: reason.description,
        }))}
        value={transferReasonId}
        onChange={setTransferReasonId}
        placeholder="Seleccionar motivo de traslado"
        className="md:w-fit"
      />
    </FilterWrapper>
  );
}
