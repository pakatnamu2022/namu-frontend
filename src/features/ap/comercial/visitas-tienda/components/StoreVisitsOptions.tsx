import DatePicker from "@/src/shared/components/DatePicker";
import SearchInput from "@/src/shared/components/SearchInput";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
}

export default function StoreVisitsOptions({
  search,
  setSearch,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar cliente..."
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
        placeholder="Fecha Desde"
        showClearButton={false}
        captionLayout="dropdown"
      />
    </div>
  );
}
