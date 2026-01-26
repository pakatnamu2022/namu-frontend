"use client";

import SearchInput from "@/shared/components/SearchInput";
import { WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.constant";
import FilterWrapper from "@/shared/components/FilterWrapper";

const { MODEL } = WORKER;

export default function ParEvaluatorOptions({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={`Buscar ${MODEL.name}`}
      />
    </FilterWrapper>
  );
}
