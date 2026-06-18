"use client";

import SearchInput from "@/shared/components/SearchInput.tsx";
import { AREA } from "../lib/area.constant";

const { MODEL } = AREA;

export default function AreaOptions({
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
