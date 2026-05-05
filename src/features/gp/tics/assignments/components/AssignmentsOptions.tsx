"use client";

import SearchInput from "@/shared/components/SearchInput";

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export default function AssignmentsOptions({ search, setSearch }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar trabajador..."
      />
    </div>
  );
}
