import SearchInput from "@/shared/components/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountingAccountPlanOptions({
  search,
  setSearch,
  detractionFilter,
  setDetractionFilter,
}: {
  search: string;
  setSearch: (value: string) => void;
  detractionFilter: string;
  setDetractionFilter: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar plan de cuenta contable..."
      />
      <Select value={detractionFilter} onValueChange={setDetractionFilter}>
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="Detracción" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Con detracción</SelectItem>
          <SelectItem value="false">Sin detracción</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
