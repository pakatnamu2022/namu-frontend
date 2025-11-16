"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";
import { PositionResource } from "../../../personal/posiciones/lib/position.interface";

export default function EvaluationPersonOptions({
  search,
  setSearch,
  persons = [],
  personId,
  setPersonId,
  positions = [],
  positionId,
  setPositionId,
}: {
  search: string;
  setSearch: (value: string) => void;
  persons: WorkerResource[];
  personId: string | null;
  setPersonId: (value: string | null) => void;
  positions: PositionResource[];
  positionId: string | null;
  setPositionId: (value: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar..."
      />
      <SearchableSelect
        options={persons.map((person) => ({
          value: person.id.toString(),
          label: person.name,
        }))}
        value={personId?.toString() || ""}
        onChange={setPersonId}
        placeholder="Seleccionar Colaborador"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={positions.map((position) => ({
          value: position.id.toString(),
          label: position.name,
          description: position.area,
        }))}
        value={positionId?.toString() || ""}
        onChange={setPositionId}
        placeholder="Seleccionar Posición"
        classNameOption="text-xs"
      />
    </div>
  );
}
