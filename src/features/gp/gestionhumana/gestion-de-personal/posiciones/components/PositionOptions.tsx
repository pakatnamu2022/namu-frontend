"use client";

import SearchInput from "@/shared/components/SearchInput.tsx";
import { POSITION } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant.ts";

const { MODEL } = POSITION;

export default function PositionOptions({
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
