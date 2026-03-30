import DatePicker from "@/shared/components/DatePicker";
import SearchInput from "@/shared/components/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WORK_ORDER_STATUS_ID } from "../lib/workOrder.constants";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { TypesPlanningResource } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.interface";

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
        className="min-w-72"
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
          allowClear
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
      {setStatusFilter !== undefined && (
        <Select value={statusFilter ?? "all"} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
