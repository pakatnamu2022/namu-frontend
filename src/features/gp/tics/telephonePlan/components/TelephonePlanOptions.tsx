"use client";

import SearchInput from "@/shared/components/SearchInput";

interface TelephonePlanOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function TelephonePlanOptions({
  search,
  setSearch,
}: TelephonePlanOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre o descripción..."
      />
    </div>
  );
}
