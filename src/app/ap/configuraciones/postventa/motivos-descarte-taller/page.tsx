"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useState } from "react";
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
import { REASONS_DISCARDING_TALLER } from "@/features/ap/configuraciones/postventa/motivos-descarte-taller/lib/reasonDiscardingTaller.constants";
import { useReasonDiscardingTaller } from "@/features/ap/configuraciones/postventa/motivos-descarte-taller/lib/reasonDiscardingTaller.hook";
import ReasonDiscardingTallerActions from "@/features/ap/configuraciones/postventa/motivos-descarte-taller/components/ReasonDiscardingTallerActions";
import { reasonDiscardingTallerColumns } from "@/features/ap/configuraciones/postventa/motivos-descarte-taller/components/ReasonDiscardingTallerColumns";
import ReasonDiscardingTallerModal from "@/features/ap/configuraciones/postventa/motivos-descarte-taller/components/ReasonDiscardingTallerModel";
import ReasonDiscardingTallerOptions from "@/features/ap/configuraciones/postventa/motivos-descarte-taller/components/ReasonDiscardingTallerOptions";
import ReasonDiscardingTallerTable from "@/features/ap/configuraciones/postventa/motivos-descarte-taller/components/ReasonDiscardingTallerTable";
import {
  updateReasonDiscardingTaller,
  deleteReasonDiscardingTaller,
} from "@/features/ap/configuraciones/postventa/motivos-descarte-taller/lib/reasonDiscardingTaller.actions";

export default function ReasonDiscardingTallerPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = REASONS_DISCARDING_TALLER;
  const permissions = useModulePermissions(ROUTE);

  const { data, isLoading, refetch } = useReasonDiscardingTaller({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateReasonDiscardingTaller(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReasonDiscardingTaller(deleteId);
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
          subtitle={"Motivos de Ajuste de Taller"}
          icon={currentView.icon}
        />
        <ReasonDiscardingTallerActions permissions={permissions} />
      </HeaderTableWrapper>
      <ReasonDiscardingTallerTable
        isLoading={isLoading}
        columns={reasonDiscardingTallerColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ReasonDiscardingTallerOptions search={search} setSearch={setSearch} />
      </ReasonDiscardingTallerTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ReasonDiscardingTallerModal
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
