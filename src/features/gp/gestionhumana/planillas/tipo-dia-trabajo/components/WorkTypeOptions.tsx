"use client";

import SearchInput from "@/shared/components/SearchInput";
import { WORK_TYPE } from "../lib/work-type.constant";

const { MODEL } = WORK_TYPE;

export default function WorkTypeOptions({
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
