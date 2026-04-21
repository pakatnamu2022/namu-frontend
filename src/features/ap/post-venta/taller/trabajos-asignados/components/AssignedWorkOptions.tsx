"use client";
import { type WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface AssignedWorkOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  workers: WorkerResource[];
  workerId: string;
  setWorkerId: (value: string) => void;
  isWorkerLocked: boolean;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
}

export default function AssignedWorkOptions({
  search,
  setSearch,
  workers,
  workerId,
  setWorkerId,
  isWorkerLocked,
  sedes,
  sedeId,
  setSedeId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: AssignedWorkOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar correlativo..."
      />
      <SearchableSelect
        options={workers.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        }))}
        value={workerId}
        onChange={setWorkerId}
        placeholder="Filtrar por trabajador"
        className="min-w-72"
        classNameOption="text-xs"
        disabled={isWorkerLocked}
      />
      <SearchableSelect
        options={sedes.map((item) => ({
          value: item.id.toString(),
          label: item.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Filtrar por sede"
        className="min-w-72"
        classNameOption="text-xs"
        allowClear={false}
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
    </div>
  );
}
