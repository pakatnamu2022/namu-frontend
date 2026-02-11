"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { PositionResource } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.interface";
import { RootObject } from "../lib/cycle.actions";
import { SearchableSelectAsync } from "@/shared/components/SearchableSelectAsync";
import { useObjectives } from "../../objetivos/lib/objective.hook";
import { ObjectiveResource } from "../../objetivos/lib/objective.interface";
import { usePersonsInCycle } from "../lib/cycle.hook";

export default function CyclePersonDetailOptions({
  idCycle,
  search,
  setSearch,
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
  objectiveId,
  setObjectiveId,
}: {
  idCycle: number;
  search: string;
  setSearch: (value: string) => void;
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
  objectiveId: string | null;
  setObjectiveId: (value: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar..."
      />
      <SearchableSelectAsync
        useQueryHook={usePersonsInCycle}
        additionalParams={{ idCycle }}
        mapOptionFn={(person: WorkerResource) => ({
          value: person.id.toString(),
          label: person.name,
        })}
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
      <SearchableSelectAsync
        useQueryHook={useObjectives}
        mapOptionFn={(objective: ObjectiveResource) => ({
          value: objective.id.toString(),
          label: objective.name,
          description: objective.description,
        })}
        value={objectiveId?.toString() || ""}
        onChange={(objectiveId) =>
          setObjectiveId && setObjectiveId(objectiveId)
        }
        placeholder="Seleccionar Objetivo"
        classNameOption="text-xs"
      />
    </div>
  );
}
