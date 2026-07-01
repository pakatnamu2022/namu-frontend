"use client";

import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { ATTENDANCE_EXCLUSION } from "../lib/attendance-exclusion.constants";

const { MODEL } = ATTENDANCE_EXCLUSION;

interface Props {
  search: string;
  setSearch: (value: string) => void;
  active: string;
  setActive: (value: string) => void;
}

export default function AttendanceExclusionOptions({
  search,
  setSearch,
  active,
  setActive,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={`Buscar ${MODEL.plural}...`}
      />
      <SearchableSelect
        options={[
          { value: "1", label: "Activo" },
          { value: "0", label: "Inactivo" },
        ]}
        value={active}
        onChange={setActive}
        placeholder="Seleccionar Estado"
        className="min-w-40"
        classNameOption="text-xs"
      />
    </div>
  );
}
