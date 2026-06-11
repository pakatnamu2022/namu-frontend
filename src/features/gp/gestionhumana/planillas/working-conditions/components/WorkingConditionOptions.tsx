"use client";

import SearchInput from "@/shared/components/SearchInput";
import { WORKING_CONDITION } from "../lib/working-condition.constant";

const { MODEL } = WORKING_CONDITION;

export default function WorkingConditionOptions({
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
