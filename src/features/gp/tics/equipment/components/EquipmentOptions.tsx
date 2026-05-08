"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";

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
  sedeId,
  setSedeId,
  sedes = [],
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  useStatus: string;
  setUseStatus: (value: string) => void;
  sedeId: string;
  setSedeId: (value: string) => void;
  sedes?: SedeResource[];
}) {
  const sedeOptions = useMemo(
    () => [
      { value: "all", label: "Todas las sedes" },
      ...sedes.map((sede) => ({
        value: sede.id.toString(),
        label: sede.abreviatura,
      })),
    ],
    [sedes],
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar equipo..."
      />
      <SearchableSelect
        onChange={setSedeId}
        value={sedeId}
        options={sedeOptions}
        placeholder="Sede"
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
