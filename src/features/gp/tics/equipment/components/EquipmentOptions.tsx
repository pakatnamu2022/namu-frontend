"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "29", label: "Asignado" },
  { value: "28", label: "No asignado" },
];

const USO_STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "USADO", label: "Usado" },
  { value: "NUEVO", label: "Nuevo" },
];

export default function EquipmentOptions({
  search,
  setSearch,
  status,
  setStatus,
  useStatus,
  setUseStatus,
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  useStatus: string;
  setUseStatus: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar equipo..."
      />
      <SearchableSelect
        onChange={setStatus}
        value={status}
        options={STATUS_OPTIONS}
        placeholder="Estado"
      />
      <SearchableSelect
        onChange={setUseStatus}
        value={useStatus}
        options={USO_STATUS_OPTIONS}
        placeholder="Estado de Uso"
      />
    </div>
  );
}
