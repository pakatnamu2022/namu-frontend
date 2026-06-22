"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import { useManualList } from "@/features/gp/tics/manuales/lib/manual.hook";
import { deleteManual } from "@/features/gp/tics/manuales/lib/manual.actions";
import { manualColumns } from "@/features/gp/tics/manuales/components/ManualColumns";
import ManualTable from "@/features/gp/tics/manuales/components/ManualTable";
import ManualActions from "@/features/gp/tics/manuales/components/ManualActions";
import ManualOptions from "@/features/gp/tics/manuales/components/ManualOptions";
import ManualModal from "@/features/gp/tics/manuales/components/ManualModal";

export default function GestionManualesPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useManualList({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteManual(deleteId);
      await refetch();
      successToast("Manual eliminado correctamente.");
    } catch {
      errorToast("No se pudo eliminar el manual.");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("gestion-manuales")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle="Gestión de Manuales"
          icon={currentView.icon}
        />
        <ManualActions />
      </HeaderTableWrapper>

      <ManualTable
        isLoading={isLoading}
        columns={manualColumns({
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
        })}
        data={data?.data ?? []}
      >
        <ManualOptions search={search} setSearch={setSearch} />
      </ManualTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ManualModal
          id={updateId}
          title="Actualizar Manual"
          open
          onClose={() => setUpdateId(null)}
          mode="update"
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
