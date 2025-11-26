"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllTypesOperation } from "@/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.hook";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { PARENT_WAREHOUSE } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.constants";
import { useParentWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.hook";
import {
  deleteParentWarehouse,
  updateParentWarehouse,
} from "@/features/ap/configuraciones/maestros-general/almacenes-padre/lib/parentWarehouse.actions";
import ParentWarehouseActions from "@/features/ap/configuraciones/maestros-general/almacenes-padre/components/ParentWarehouseActions";
import ParentWarehouseTable from "@/features/ap/configuraciones/maestros-general/almacenes-padre/components/ParentWarehouseTable";
import { parentWarehouseColumns } from "@/features/ap/configuraciones/maestros-general/almacenes-padre/components/ParentWarehouseColumns";
import ParentWarehouseOptions from "@/features/ap/configuraciones/maestros-general/almacenes-padre/components/ParentWarehouseOptions";

export default function ParentWarehousePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sedeId, setSedeId] = useState<string>("");
  const [typeOperation, setTypeOperationId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isReceived, setIsReceived] = useState<string>("");
  const { MODEL, ROUTE } = PARENT_WAREHOUSE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, sedeId, typeOperation, status, isReceived]);

  const { data, isLoading, refetch } = useParentWarehouse({
    page,
    search,
    per_page,
    sede_id: sedeId,
    type_operation_id: typeOperation,
    status: status,
    is_received: isReceived,
  });

  const { data: sedes = [] } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });
  const { data: typesOperation = [] } = useAllTypesOperation();

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateParentWarehouse(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteParentWarehouse(deleteId);
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
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ParentWarehouseActions permissions={permissions} />
      </HeaderTableWrapper>
      <ParentWarehouseTable
        isLoading={isLoading}
        columns={parentWarehouseColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ParentWarehouseOptions
          search={search}
          setSearch={setSearch}
          sedes={sedes}
          sedeId={sedeId}
          setSedeId={setSedeId}
          typesOperation={typesOperation}
          typeOperationId={typeOperation}
          setTypeOperationId={setTypeOperationId}
          status={status}
          setStatus={setStatus}
          isReceived={isReceived}
          setIsReceived={setIsReceived}
        />
      </ParentWarehouseTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
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
