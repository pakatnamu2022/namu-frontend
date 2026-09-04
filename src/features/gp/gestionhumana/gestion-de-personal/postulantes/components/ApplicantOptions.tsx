"use client";

import SearchInput from "@/shared/components/SearchInput";

export default function ApplicantOptions({
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
        placeholder="Buscar por nombre, documento o correo..."
      />
    </div>
  );
}
