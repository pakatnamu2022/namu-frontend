import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useMyShops } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { Option } from "@/core/core.interface";
import { useMemo } from "react";

export default function VehicleDeliveryOptions({
  search,
  setSearch,
  dateFrom,
  dateTo,
  setDateRange,
  sedeId = "all",
  setSedeId,
  statusDelivery = "all",
  setStatusDelivery,
  annulled = "all",
  setAnnulled,
}: {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  setDateRange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
  sedeId?: string;
  setSedeId: (value: string) => void;
  statusDelivery?: string;
  setStatusDelivery: (value: string) => void;
  annulled?: string;
  setAnnulled: (value: string) => void;
}) {
  const { data: availableSedes = [] } = useMyShops();

  const sedeOptions = useMemo<Option[]>(
    () =>
      availableSedes.map((shop) => ({
        value: shop.id.toString(),
        label: shop.description,
      })),
    [availableSedes],
  );

  const getStatusDelivery = [
    { value: "all",       label: "Todos" },
    { value: "pending",   label: "Pendientes" },
    { value: "delivered", label: "Entregados" },
    { value: "cancelled", label: "Anulados" },
  ];

  const annulledOptions = [
    { value: "all", label: "Activas e Inactivas" },
    { value: "0", label: "Solo activas" },
    { value: "1", label: "Solo anuladas" },
  ];

  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar entrega de vehículo..."
      />
      <SearchableSelect
        options={sedeOptions}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Seleccionar sede"
        className="w-fit"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={getStatusDelivery}
        value={statusDelivery}
        onChange={setStatusDelivery}
        placeholder="Seleccionar estado"
        className="w-fit"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={annulledOptions}
        value={annulled}
        onChange={setAnnulled}
        placeholder="Guías anuladas"
        className="w-fit"
        classNameOption="text-xs"
      />
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={setDateRange}
        placeholder="Seleccionar rango"
        dateFormat="d MMM yyyy"
        className="w-fit"
      />
    </FilterWrapper>
  );
}
