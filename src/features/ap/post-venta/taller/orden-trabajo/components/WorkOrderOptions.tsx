import SearchInput from "@/shared/components/SearchInput";
import { WORK_ORDER_STATUS_ID } from "../lib/workOrder.constants";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { TypesPlanningResource } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.interface";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import { CurrencyTypesResource } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.interface";

const STATUS_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "Recepcionado", value: String(WORK_ORDER_STATUS_ID.RECEPCIONADO) },
  { label: "En Trabajo", value: String(WORK_ORDER_STATUS_ID.EN_TRABAJO) },
  { label: "Terminado", value: String(WORK_ORDER_STATUS_ID.TERMINADO) },
];

interface Props {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  statusFilter?: string;
  setStatusFilter?: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  typesPlanning?: TypesPlanningResource[];
  typePlanningId?: string;
  setTypePlanningId?: (value: string) => void;
  typesCurrency?: CurrencyTypesResource[];
  typeCurrencyId?: string;
  setTypeCurrencyId?: (value: string) => void;
  allowClearTypePlanning?: boolean;
}

export default function WorkOrderOptions({
  search,
  setSearch,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  statusFilter,
  setStatusFilter,
  sedes = [],
  sedeId,
  setSedeId,
  typesPlanning = [],
  typePlanningId,
  setTypePlanningId,
  typesCurrency = [],
  typeCurrencyId,
  setTypeCurrencyId,
  allowClearTypePlanning = true,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar orden de trabajo..."
      />
      <SearchableSelect
        options={sedes.map((item) => ({
          value: item.id.toString(),
          label: item.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Filtrar por sede"
        className="min-w-48"
        classNameOption="text-xs"
        allowClear={false}
      />
      {typesPlanning && setTypePlanningId && (
        <SearchableSelect
          options={typesPlanning.map((item) => ({
            value: item.id.toString(),
            label: item.description,
          }))}
          value={typePlanningId!}
          onChange={setTypePlanningId}
          placeholder="Filtrar por tipo de planificación"
          className="min-w-72"
          classNameOption="text-xs"
          allowClear={allowClearTypePlanning}
        />
      )}
      {typesCurrency && setTypeCurrencyId && (
        <SearchableSelect
          options={typesCurrency?.map((item) => ({
            value: item.id.toString(),
            label: item.name,
          }))}
          value={typeCurrencyId!}
          onChange={setTypeCurrencyId}
          placeholder="Filtrar por tipo de moneda"
          className="min-w-48"
          classNameOption="text-xs"
          allowClear={false}
        />
      )}
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        className="w-auto min-w-56"
      />
      {setStatusFilter !== undefined && (
        <SearchableSelect
          options={STATUS_OPTIONS}
          value={statusFilter!}
          onChange={setStatusFilter}
          placeholder="Filtrar por estado"
          className="min-w-48"
          classNameOption="text-xs"
          allowClear={false}
        />
      )}
    </div>
  );
}
