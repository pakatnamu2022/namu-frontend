"use client";

import SearchInput from "@/src/shared/components/SearchInput";
import { POSITION } from "../lib/position.constant";

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
