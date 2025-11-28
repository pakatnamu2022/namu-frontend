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
import { TYPE_OPERACTION_APPOINTMENT } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.constants.ts";
import { useTypesOperationsAppointment } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.hook.ts";
import {
  deleteTypesOperationsAppointment,
  updateTypesOperationsAppointment,
} from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.actions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import TypesOperationsAppointmentActions from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/components/TypesOperationsAppointmentActions.tsx";
import { TypesOperationsAppointmentColumns } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/components/TypesOperationsAppointmentColumns.tsx";
import TypesOperationsAppointmentTable from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/components/TypesOperationsAppointmentTable.tsx";
import TypesOperationsAppointmentOptions from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/components/TypesOperationsAppointmentOptions.tsx";
import TypesOperationsAppointmentModal from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/components/TypesOperationsAppointmentModal.tsx";

export default function TypesOperationsAppointmentPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = TYPE_OPERACTION_APPOINTMENT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useTypesOperationsAppointment({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateTypesOperationsAppointment(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTypesOperationsAppointment(deleteId);
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
          subtitle={"Tipos de Operación de Post Venta"}
          icon={currentView.icon}
        />
        <TypesOperationsAppointmentActions permissions={permissions} />
      </HeaderTableWrapper>
      <TypesOperationsAppointmentTable
        isLoading={isLoading}
        columns={TypesOperationsAppointmentColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <TypesOperationsAppointmentOptions
          search={search}
          setSearch={setSearch}
        />
      </TypesOperationsAppointmentTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <TypesOperationsAppointmentModal
          id={updateId}
          title={"Actualizar Tipo de Operación"}
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
