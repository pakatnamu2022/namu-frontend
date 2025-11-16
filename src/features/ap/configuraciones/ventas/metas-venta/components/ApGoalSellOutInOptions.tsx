import { MonthOption } from "@/src/core/core.interface";
import { SearchableSelect } from "@/src/shared/components/SearchableSelect";
import SearchInput from "@/src/shared/components/SearchInput";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  years: number[];
  year: string;
  setYear: (value: string) => void;
  months: MonthOption[];
  month: string;
  setMonth: (value: string) => void;
}

export default function ApGoalSellOutInOptions({
  search,
  setSearch,
  years = [],
  year,
  setYear,
  months = [],
  month,
  setMonth,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar ..."
      />
      <SearchableSelect
        options={years.map((year) => ({
          value: year.toString(),
          label: year.toString(),
        }))}
        value={year.toString()}
        onChange={setYear}
        placeholder="Filtrar por Año"
        className="min-w-72"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={months.map((month) => ({
          value: month.value.toString(),
          label: month.label.toString(),
        }))}
        value={month.toString()}
        onChange={setMonth}
        placeholder="Filtrar por Mes"
        className="min-w-72"
        classNameOption="text-xs"
      />
    </div>
  );
}
