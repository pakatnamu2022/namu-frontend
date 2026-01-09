"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { GENERAL_MASTERS } from "@/features/gp/maestros-generales/lib/generalMasters.constants";
import { useGeneralMasters } from "@/features/gp/maestros-generales/lib/generalMasters.hook";
import {
  deleteGeneralMasters,
  updateGeneralMasters,
} from "@/features/gp/maestros-generales/lib/generalMasters.actions";
import GeneralMastersActions from "@/features/gp/maestros-generales/components/GeneralMastersActions";
import { generalMastersColumns } from "@/features/gp/maestros-generales/components/GeneralMastersColumns";
import GeneralMastersTable from "@/features/gp/maestros-generales/components/GeneralMastersTable";
import GeneralMastersOptions from "@/features/gp/maestros-generales/components/GeneralMastersOptions";
import GeneralMastersModal from "@/features/gp/maestros-generales/components/GeneralMastersModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { SortingState } from "@tanstack/react-table";

export default function GeneralMastersPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = GENERAL_MASTERS;
  const permissions = useModulePermissions(ROUTE);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, sorting]);

  const { data, isLoading, refetch } = useGeneralMasters({
    params: {
      page,
      search,
      per_page,
      sort: sorting.map((s) => s.id).join(","),
      direction: sorting.map((s) => (s.desc ? "desc" : "asc")).join(","),
    },
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateGeneralMasters(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGeneralMasters(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Gestión de maestros generales del sistema"}
          icon={currentView.icon}
        />
        <GeneralMastersActions permissions={permissions} />
      </HeaderTableWrapper>

      <GeneralMastersTable
        isLoading={isLoading}
        columns={generalMastersColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting={true}
      >
        <GeneralMastersOptions search={search} setSearch={setSearch} />
      </GeneralMastersTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <GeneralMastersModal
          id={updateId}
          open={true}
          onClose={() => setUpdateId(null)}
          mode="update"
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
