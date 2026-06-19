"use client";

import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "activo", label: "Activo" },
  { value: "archivado", label: "Archivado" },
];

export default function ScrumProjectOptions({
  search,
  setSearch,
  status,
  setStatus,
}: {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar proyecto..." />
      <SearchableSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="Estado" />
    </div>
  );
}
