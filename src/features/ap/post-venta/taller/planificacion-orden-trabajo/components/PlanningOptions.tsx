import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";

interface PlanningOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  workers: WorkerResource[];
  workerId: string;
  setWorkerId: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
}

export default function PlanningOptions({
  search,
  setSearch,
  workers,
  workerId,
  setWorkerId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: PlanningOptionsProps) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar orden de trabajo..."
      />

      <SearchableSelect
        options={workers.map((worker) => ({
          label: worker.name,
          value: String(worker.id),
        }))}
        value={workerId}
        onChange={(value) => setWorkerId(value === "all" ? "" : value)}
        placeholder="Filtrar por trabajador"
        className="min-w-72"
        classNameOption="text-xs"
      />

      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        className="w-auto min-w-56"
      />
    </FilterWrapper>
  );
}
