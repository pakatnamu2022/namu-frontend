"use client";

import { notFound } from "next/navigation";
import {
  deleteReceptionChecklist,
  updateReceptionChecklist,
} from "@/src/features/ap/configuraciones/vehiculos/checklist-recepcion/lib/receptionChecklist.actions";
import { useReceptionChecklist } from "@/src/features/ap/configuraciones/vehiculos/checklist-recepcion/lib/receptionChecklist.hook";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import TitleComponent from "@/src/shared/components/TitleComponent";
import ReceptionChecklistActions from "@/src/features/ap/configuraciones/vehiculos/checklist-recepcion/components/ReceptionChecklistActions";
import ReceptionChecklistTable from "@/src/features/ap/configuraciones/vehiculos/checklist-recepcion/components/ReceptionChecklistTable";
import { receptionChecklistColumns } from "@/src/features/ap/configuraciones/vehiculos/checklist-recepcion/components/ReceptionChecklistColumns";
import ReceptionChecklistOptions from "@/src/features/ap/configuraciones/vehiculos/checklist-recepcion/components/ReceptionChecklistOptions";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import ReceptionChecklistModal from "@/src/features/ap/configuraciones/vehiculos/checklist-recepcion/components/ReceptionChecklistModal";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { ITEM_RECEPTION } from "@/src/features/ap/configuraciones/vehiculos/checklist-recepcion/lib/receptionChecklist.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function ReceptionChecklistPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = ITEM_RECEPTION;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useReceptionChecklist({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateReceptionChecklist(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReceptionChecklist(deleteId);
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
          subtitle={"Items de Recepción"}
          icon={currentView.icon}
        />
        <ReceptionChecklistActions permissions={permissions} />
      </HeaderTableWrapper>
      <ReceptionChecklistTable
        isLoading={isLoading}
        columns={receptionChecklistColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ReceptionChecklistOptions search={search} setSearch={setSearch} />
      </ReceptionChecklistTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ReceptionChecklistModal
          id={updateId}
          title={"Actualizar Item de Recepción"}
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
