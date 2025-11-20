"use client";

import SearchInput from "@/shared/components/SearchInput";
import { WORKER } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.constant";

const { MODEL } = WORKER;

export default function ParEvaluatorOptions({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={`Buscar ${MODEL.name}`}
      />
    </div>
  );
}
