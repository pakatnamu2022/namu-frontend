"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import DataTablePagination from "@/shared/components/DataTablePagination";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useState } from "react";

import { useScrumProjects } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.hook";
import { deleteScrumProject } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.actions";
import { scrumProjectColumns } from "@/features/gp/tics/pm/scrumProject/components/ScrumProjectColumns";
import ScrumProjectTable from "@/features/gp/tics/pm/scrumProject/components/ScrumProjectTable";
import ScrumProjectActions from "@/features/gp/tics/pm/scrumProject/components/ScrumProjectActions";
import ScrumProjectOptions from "@/features/gp/tics/pm/scrumProject/components/ScrumProjectOptions";

export default function ScrumProjectPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => { setPage(1); }, [search, per_page, status]);

  const { data, isLoading, refetch } = useScrumProjects({
    page,
    per_page,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteScrumProject(deleteId);
      await refetch();
      successToast("Proyecto eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el proyecto.");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("proyectos")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ScrumProjectActions />
      </HeaderTableWrapper>

      <ScrumProjectTable
        isLoading={isLoading}
        columns={scrumProjectColumns({ onDelete: setDeleteId })}
        data={data?.data ?? []}
      >
        <ScrumProjectOptions
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />
      </ScrumProjectTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page ?? 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total ?? 0}
      />
    </div>
  );
}
