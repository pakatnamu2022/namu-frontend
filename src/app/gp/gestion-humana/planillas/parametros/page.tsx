"use client";

import { useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGeneralMasters } from "@/features/gp/maestros-generales/lib/generalMasters.hook";
import {
  deleteGeneralMasters,
  updateGeneralMasters,
} from "@/features/gp/maestros-generales/lib/generalMasters.actions";
import GeneralMastersTable from "@/features/gp/maestros-generales/components/GeneralMastersTable";
import { generalMastersColumns } from "@/features/gp/maestros-generales/components/GeneralMastersColumns";
import GeneralMastersModal from "@/features/gp/maestros-generales/components/GeneralMastersModal";
import GeneralMastersOptions from "@/features/gp/maestros-generales/components/GeneralMastersOptions";
import {
  PAYROLL_CONSTANTS,
  PAYROLL_CONSTANTS_TYPE,
} from "@/features/gp/maestros-generales/lib/generalMasters.constants";

export default function PayrollParameterPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE } = PAYROLL_CONSTANTS;
  const permissions = useModulePermissions(ROUTE);

  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, refetch } = useGeneralMasters({
    params: {
      page,
      search,
      per_page,
      type: PAYROLL_CONSTANTS_TYPE,
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
      successToast(
        SUCCESS_MESSAGE(
          { name: "Constante", plural: "Constantes", gender: false },
          "delete",
        ),
      );
      await refetch();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(
        ERROR_MESSAGE(
          { name: "Constante", plural: "Constantes", gender: false },
          "delete",
          msg,
        ),
      );
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
          subtitle="Variables de planilla"
          icon={currentView.icon}
        />
        {permissions.canCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Constante
          </Button>
        )}
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

      {showCreate && (
        <GeneralMastersModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          mode="create"
          defaultType={PAYROLL_CONSTANTS_TYPE}
          lockedType={true}
        />
      )}

      {updateId !== null && (
        <GeneralMastersModal
          id={updateId}
          open={true}
          onClose={() => setUpdateId(null)}
          mode="update"
          defaultType={PAYROLL_CONSTANTS_TYPE}
          lockedType={true}
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
