import DatePicker from "@/src/shared/components/DatePicker";
import SearchInput from "@/src/shared/components/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  statusFilter?: string;
  setStatusFilter: (value: string) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "VALIDADO", label: "Validado" },
  { value: "ERRADO", label: "Errado" },
  { value: "NO_ENCONTRADO", label: "No Encontrado" },
];

export default function ManageLeadsOptions({
  search,
  setSearch,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  statusFilter = "all",
  setStatusFilter,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar ..."
      />
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
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[200px]">
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
    </div>
  );
}
