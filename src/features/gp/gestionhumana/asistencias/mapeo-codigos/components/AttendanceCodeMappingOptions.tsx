"use client";

import SearchInput from "@/shared/components/SearchInput";
import { ATTENDANCE_CODE_MAPPING } from "../lib/attendance-code-mapping.constants";

const { MODEL } = ATTENDANCE_CODE_MAPPING;

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export default function AttendanceCodeMappingOptions({
  search,
  setSearch,
}: Props) {
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
