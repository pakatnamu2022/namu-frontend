import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { MonthOption } from "@/core/core.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  years: number[];
  year: string;
  setYear: (value: string) => void;
  months: MonthOption[];
  month: string;
  setMonth: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
}

export default function CampaignScheduleOptions({
  search,
  setSearch,
  years = [],
  year,
  setYear,
  months = [],
  month,
  setMonth,
  sedes = [],
  sedeId,
  setSedeId,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar cronograma..."
      />
      <SearchableSelect
        options={years.map((year) => ({
          value: year.toString(),
          label: year.toString(),
        }))}
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
        allowClear={true}
      />
    </div>
  );
}
