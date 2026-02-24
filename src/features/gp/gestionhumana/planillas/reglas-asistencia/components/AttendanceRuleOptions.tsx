"use client";

import SearchInput from "@/shared/components/SearchInput";
import { ATTENDANCE_RULE } from "../lib/attendance-rule.constant";

const { MODEL } = ATTENDANCE_RULE;

export default function AttendanceRuleOptions({
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
