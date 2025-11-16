"use client";

import SearchInput from "@/src/shared/components/SearchInput";

export default function UserOptions({
  search,
  setSearch,
  role,
  setRole,
}: {
  search: string;
  setSearch: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar usuario..."
      />
      <SearchInput
        value={role}
        onChange={setRole}
        placeholder="Buscar rol..."
      />
    </div>
  );
}
