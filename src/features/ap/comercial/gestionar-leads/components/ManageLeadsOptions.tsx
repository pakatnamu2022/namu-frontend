import DatePicker from "@/shared/components/DatePicker";
import SearchInput from "@/shared/components/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONDITION_OPTIONS,
  STATUS_OPTIONS,
} from "../../visitas-tienda/lib/storeVisits.constants";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";

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
  statusFilter?: string;
  setStatusFilter: (value: string) => void;
  conditionFilter?: string;
  setConditionFilter: (value: string) => void;
}

export default function ManageLeadsOptions({
  search,
  setSearch,
  sedes = [],
  sedeId,
  setSedeId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  statusFilter = "all",
  setStatusFilter,
  conditionFilter = "all",
  setConditionFilter,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar ..."
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
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="Estado de validación" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={conditionFilter} onValueChange={setConditionFilter}>
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="Condición" />
        </SelectTrigger>
        <SelectContent>
          {CONDITION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
