import { MonthOption } from "@/core/core.interface";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";

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

export default function AssignBrandConsultantOptions({
  search,
  setSearch,
  years = [],
  year,
  setYear,
  months = [],
  month,
  setMonth,
}: Props) {
  const YEAR_OPTIONS = years.map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar ..."
      />
      <SearchableSelect
        options={YEAR_OPTIONS}
        value={year.toString()}
        onChange={setYear}
        placeholder="Filtrar por Año"
      />
      <SearchableSelect
        options={months.map((month) => ({
          value: month.value.toString(),
          label: month.label.toString(),
        }))}
        value={month.toString()}
        onChange={setMonth}
        placeholder="Filtrar por Mes"
      />
    </div>
  );
}
