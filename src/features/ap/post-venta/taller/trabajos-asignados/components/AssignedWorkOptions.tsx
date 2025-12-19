"use client";
import { type WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface AssignedWorkOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  workers: WorkerResource[];
  workerId: string;
  setWorkerId: (value: string) => void;
}

export default function AssignedWorkOptions({
  search,
  setSearch,
  workers,
  workerId,
  setWorkerId,
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
      />
    </div>
  );
}
