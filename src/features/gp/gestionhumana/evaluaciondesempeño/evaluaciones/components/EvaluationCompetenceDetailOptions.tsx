"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { CompetenceResource } from "../../competencias/lib/competence.interface";
import { EVALUATOR_TYPES } from "../lib/evaluation.constans";

export default function EvaluationCompetenceDetailOptions({
  search,
  setSearch,
  persons = [],
  personId,
  setPersonId,
  competences = [],
  competenceId,
  setCompetenceId,
  evaluatorType,
  setEvaluatorType,
}: {
  search: string;
  setSearch: (value: string) => void;
  persons: WorkerResource[];
  personId: string | null;
  setPersonId: (value: string | null) => void;
  competences: CompetenceResource[];
  competenceId: string | null;
  setCompetenceId: (value: string | null) => void;
  evaluatorType: string | null;
  setEvaluatorType: (value: string | null) => void;
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
        options={competences.map((competence) => ({
          value: competence.id.toString(),
          label: competence.nombre,
        }))}
        value={competenceId?.toString() || ""}
        onChange={setCompetenceId}
        placeholder="Seleccionar Competencia"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={EVALUATOR_TYPES}
        value={evaluatorType?.toString() || ""}
        onChange={setEvaluatorType}
        placeholder="Tipo de Evaluador"
        classNameOption="text-xs"
      />
    </div>
  );
}
