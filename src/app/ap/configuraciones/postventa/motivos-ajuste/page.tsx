"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { REASONS_ADJUSTMENT } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.constants.ts";
import { useReasonsAdjustment } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.hook.ts";
import {
  deleteReasonsAdjustment,
  updateReasonsAdjustment,
} from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.actions.ts";
import { reasonsAdjustmentColumns } from "@/features/ap/configuraciones/postventa/motivos-ajuste/components/ReasonsAdjustmentColumns.tsx";
import ReasonsAdjustmentTable from "@/features/ap/configuraciones/postventa/motivos-ajuste/components/ReasonsAdjustmentTable.tsx";
import ReasonsAdjustmentActions from "@/features/ap/configuraciones/postventa/motivos-ajuste/components/ReasonsAdjustmentActions.tsx";
import ReasonsAdjustmentOptions from "@/features/ap/configuraciones/postventa/motivos-ajuste/components/ReasonsAdjustmentOptions.tsx";
import ReasonsAdjustmentModal from "@/features/ap/configuraciones/postventa/motivos-ajuste/components/ReasonsAdjustmentModel.tsx";

export default function ReasonsAdjustmentPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = REASONS_ADJUSTMENT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useReasonsAdjustment({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateReasonsAdjustment(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReasonsAdjustment(deleteId);
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
          subtitle={"Motivos de Ajuste"}
          icon={currentView.icon}
        />
        <ReasonsAdjustmentActions permissions={permissions} />
      </HeaderTableWrapper>
      <ReasonsAdjustmentTable
        isLoading={isLoading}
        columns={reasonsAdjustmentColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ReasonsAdjustmentOptions search={search} setSearch={setSearch} />
      </ReasonsAdjustmentTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ReasonsAdjustmentModal
          id={updateId}
          title={"Actualizar Motivo"}
          open={true}
          onClose={() => {
            setUpdateId(null);
          }}
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
