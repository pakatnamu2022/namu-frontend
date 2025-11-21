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

interface Props {
  search: string;
  setSearch: (value: string) => void;
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
