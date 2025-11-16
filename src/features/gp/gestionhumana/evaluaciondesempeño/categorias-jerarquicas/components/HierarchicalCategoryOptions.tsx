"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";

export default function HierarchicalCategoryOptions({
  search,
  setSearch,
  excluded_from_evaluation,
  setExcludedFromEvaluation,
  validation,
  setValidation,
}: {
  search: string;
  setSearch: (value: string) => void;
  excluded_from_evaluation: string;
  setExcludedFromEvaluation: (value: string) => void;
  validation: string;
  setValidation: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar categoría..."
      />
      <SearchableSelect
        options={[
          {
            label: "Todas",
            value: "all",
          },
          {
            label: "Excluidas",
            value: "1",
          },
          {
            label: "Incluidas",
            value: "0",
          },
        ]}
        value={excluded_from_evaluation}
        onChange={setExcludedFromEvaluation}
        placeholder="Estado en Evaluación"
      />
      <SearchableSelect
        options={[
          {
            label: "Todas",
            value: "all",
          },
          {
            label: "Válidas",
            value: "1",
          },
          {
            label: "Inválidas",
            value: "0",
          },
        ]}
        value={validation}
        onChange={setValidation}
        placeholder="Validación"
      />
    </div>
  );
}
