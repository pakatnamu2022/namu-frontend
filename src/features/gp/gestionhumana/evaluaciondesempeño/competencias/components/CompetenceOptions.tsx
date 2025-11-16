"use client";

import SearchInput from "@/src/shared/components/SearchInput";
import { COMPETENCE } from "../lib/competence.constans";

const { MODEL } = COMPETENCE;

export default function CompetenceOptions({
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
        placeholder={`Buscar ${MODEL.name}...`}
      />
    </div>
  );
}
