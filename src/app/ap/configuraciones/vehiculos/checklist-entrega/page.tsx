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
import { useDeliveryChecklist } from "@/features/ap/configuraciones/vehiculos/checklist-entrega/lib/deliveryChecklist.hook";
import {
  deleteDeliveryChecklist,
  updateDeliveryChecklist,
} from "@/features/ap/configuraciones/vehiculos/checklist-entrega/lib/deliveryChecklist.actions";
import DeliveryChecklistActions from "@/features/ap/configuraciones/vehiculos/checklist-entrega/components/DeliveryChecklistActions";
import DeliveryChecklistTable from "@/features/ap/configuraciones/vehiculos/checklist-entrega/components/DeliveryChecklistTable";
import { deliveryChecklistColumns } from "@/features/ap/configuraciones/vehiculos/checklist-entrega/components/DeliveryChecklistColumns";
import DeliveryChecklistOptions from "@/features/ap/configuraciones/vehiculos/checklist-entrega/components/DeliveryChecklistOptions";
import DeliveryChecklistModal from "@/features/ap/configuraciones/vehiculos/checklist-entrega/components/DeliveryChecklistModal";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { ITEM_DELIVERY } from "@/features/ap/configuraciones/vehiculos/checklist-entrega/lib/deliveryChecklist.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";


export default function DeliveryChecklistPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = ITEM_DELIVERY;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useDeliveryChecklist({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateDeliveryChecklist(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDeliveryChecklist(deleteId);
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
          subtitle={"Items de Entrega"}
          icon={currentView.icon}
        />
        <DeliveryChecklistActions permissions={permissions} />
      </HeaderTableWrapper>
      <DeliveryChecklistTable
        isLoading={isLoading}
        columns={deliveryChecklistColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <DeliveryChecklistOptions search={search} setSearch={setSearch} />
      </DeliveryChecklistTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <DeliveryChecklistModal
          id={updateId}
          title={"Actualizar Item de entrega"}
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
