"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/core/core.function";
import { notFound } from "@/shared/hooks/useNotFound";
import { useState } from "react";

import { useScrumSprints } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.hook";
import {
  deleteScrumSprint,
  activateScrumSprint,
  closeScrumSprint,
} from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.actions";
import { scrumSprintColumns } from "@/features/gp/tics/pm/scrumSprint/components/ScrumSprintColumns";
import ScrumSprintTable from "@/features/gp/tics/pm/scrumSprint/components/ScrumSprintTable";
import ScrumSprintActions from "@/features/gp/tics/pm/scrumSprint/components/ScrumSprintActions";
import ScrumSprintOptions from "@/features/gp/tics/pm/scrumSprint/components/ScrumSprintOptions";
import { useScrumProjects } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.hook";

export default function ScrumSprintPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: projectsData } = useScrumProjects({ per_page: 100 });
  const projects = projectsData?.data ?? [];

  const resolvedProjectId = projectId === "all" ? null : Number(projectId);

  const {
    data: sprints = [],
    isLoading,
    refetch,
  } = useScrumSprints(resolvedProjectId);

  const filtered = sprints.filter((s) => {
    const matchSearch =
      !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" || s.status === status;
    const matchProject =
      resolvedProjectId == null || s.project_id === resolvedProjectId;
    return matchSearch && matchStatus && matchProject;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteScrumSprint(deleteId);
      await refetch();
      successToast("Sprint eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el sprint.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activateScrumSprint(id);
      await refetch();
      successToast("Sprint activado correctamente.");
    } catch {
      errorToast("Error al activar el sprint.");
    }
  };

  const handleClose = async (id: number) => {
    try {
      await closeScrumSprint(id);
      await refetch();
      successToast("Sprint cerrado correctamente.");
    } catch {
      errorToast("Error al cerrar el sprint.");
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("sprints")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ScrumSprintActions />
      </HeaderTableWrapper>

      <ScrumSprintTable
        isLoading={isLoading}
        columns={scrumSprintColumns({
          onDelete: setDeleteId,
          onActivate: handleActivate,
          onClose: handleClose,
        })}
        data={filtered}
      >
        <ScrumSprintOptions
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          projectId={projectId}
          setProjectId={setProjectId}
          projects={projects}
        />
      </ScrumSprintTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
