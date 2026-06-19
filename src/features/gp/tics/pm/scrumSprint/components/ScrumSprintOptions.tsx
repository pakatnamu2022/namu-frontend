"use client";

import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { ScrumProjectResource } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.interface";
import { useMemo } from "react";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "planeado", label: "Planeado" },
  { value: "activo", label: "Activo" },
  { value: "cerrado", label: "Cerrado" },
];

export default function ScrumSprintOptions({
  search,
  setSearch,
  status,
  setStatus,
  projectId,
  setProjectId,
  projects = [],
}: {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  projectId: string;
  setProjectId: (v: string) => void;
  projects?: ScrumProjectResource[];
}) {
  const projectOptions = useMemo(
    () => [
      { value: "all", label: "Todos los proyectos" },
      ...projects.map((p) => ({ value: p.id.toString(), label: p.name })),
    ],
    [projects],
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar sprint..." />
      <SearchableSelect value={projectId} onChange={setProjectId} options={projectOptions} placeholder="Proyecto" />
      <SearchableSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="Estado" />
    </div>
  );
}
