import { Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import FilterWrapper from "@/shared/components/FilterWrapper";
import DatePicker from "@/shared/components/DatePicker";
import SearchInput from "@/shared/components/SearchInput";

interface Props {
  dateFrom?: string;
  dateTo?: string;
  search: string;
  onDateFromChange: (value: string | undefined) => void;
  onDateToChange: (value: string | undefined) => void;
  onSearchChange: (value: string) => void;
  onLoad: () => void;
  canLoad: boolean;
  isLoading: boolean;
}

function toStr(d: Date | undefined): string | undefined {
  return d ? format(d, "yyyy-MM-dd") : undefined;
}

export default function AttendanceReportFilterBar({
  dateFrom,
  dateTo,
  search,
  onDateFromChange,
  onDateToChange,
  onSearchChange,
  onLoad,
  canLoad,
  isLoading,
}: Props) {
  return (
    <FilterWrapper>
      <DatePicker
        value={dateFrom}
        onChange={(d) => onDateFromChange(toStr(d))}
        placeholder="Desde"
      />
      <DatePicker
        value={dateTo}
        onChange={(d) => onDateToChange(toStr(d))}
        placeholder="Hasta"
      />
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar colaborador..."
      />
      <Button
        size="sm"
        variant="outline"
        disabled={!canLoad || isLoading}
        onClick={onLoad}
      >
        <Search className="size-4 mr-1.5" />
        Cargar
      </Button>
    </FilterWrapper>
  );
}
