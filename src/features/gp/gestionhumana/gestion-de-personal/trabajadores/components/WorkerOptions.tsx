"use client";

import SearchInput from "@/shared/components/SearchInput.tsx";
import { WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.constant.ts";

const { MODEL } = WORKER;

export default function WorkerOptions({
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
