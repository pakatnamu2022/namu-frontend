"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { PositionResource } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.interface";
import FilterWrapper from "@/shared/components/FilterWrapper";

export default function EvaluationPersonOptions({
  search,
  setSearch,
  persons = [],
  personId,
  setPersonId,
  positions = [],
  positionId,
  setPositionId,
  bosses = [],
  bossDni,
  setBossDni,
}: {
  search: string;
  setSearch: (value: string) => void;
  persons: WorkerResource[];
  personId: string | null;
  setPersonId: (value: string | null) => void;
  positions: PositionResource[];
  positionId: string | null;
  setPositionId: (value: string | null) => void;
  bosses: WorkerResource[];
  bossDni: string | null;
  setBossDni: (value: string | null) => void;
}) {
  return (
    <FilterWrapper>
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
      <SearchableSelect
        options={bosses.map((boss) => ({
          value: boss.document,
          label: boss.name,
        }))}
        value={bossDni || ""}
        onChange={setBossDni}
        placeholder="Seleccionar Jefe"
        classNameOption="text-xs"
      />
    </FilterWrapper>
  );
}
