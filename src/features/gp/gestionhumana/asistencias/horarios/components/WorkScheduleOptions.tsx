"use client";

import SearchInput from "@/shared/components/SearchInput";
import { WORK_SCHEDULE } from "../lib/work-schedule.constants";

const { MODEL } = WORK_SCHEDULE;

export default function WorkScheduleOptions({
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
