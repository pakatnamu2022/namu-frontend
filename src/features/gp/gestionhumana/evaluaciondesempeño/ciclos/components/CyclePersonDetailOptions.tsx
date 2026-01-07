"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { PositionResource } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.interface";
import { RootObject } from "../lib/cycle.actions";

export default function CyclePersonDetailOptions({
  search,
  setSearch,
  persons = [],
  personId,
  setPersonId,
  positions = [],
  positionId,
  setPositionId,
  categories = [],
  categoryId,
  setCategoryId,
  chiefs = [],
  chiefDni,
  setChiefDni,
}: {
  search: string;
  setSearch: (value: string) => void;
  persons: WorkerResource[];
  personId: string | null;
  setPersonId: (value: string | null) => void;
  positions: PositionResource[];
  positionId: string | null;
  setPositionId: (value: string | null) => void;
  categories: RootObject[];
  categoryId: string | null;
  setCategoryId: (value: string | null) => void;
  chiefs: WorkerResource[];
  chiefDni: string | null;
  setChiefDni: (value: string | null) => void;
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

      <SearchableSelect
        options={categories.map((category) => ({
          value: category.hierarchical_category_id.toString(),
          label: category.hierarchical_category,
        }))}
        value={categoryId?.toString() || ""}
        onChange={setCategoryId}
        placeholder="Seleccionar Categoría"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={chiefs.map((chief) => ({
          value: chief.id.toString(),
          label: chief.name,
        }))}
        value={chiefDni || ""}
        onChange={setChiefDni}
        placeholder="Seleccionar Jefe"
        classNameOption="text-xs"
      />
    </div>
  );
}
