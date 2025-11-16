"use client";

import SearchInput from "@/shared/components/SearchInput";
import { EXCLUDED } from "../lib/excluded.constants";

const { MODEL } = EXCLUDED;

export default function ExcludedOptions({
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
        placeholder={`Buscar ${MODEL.plural}...`}
      />
    </div>
  );
}
