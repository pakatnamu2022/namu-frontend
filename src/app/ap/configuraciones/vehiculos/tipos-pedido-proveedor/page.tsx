"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleComponent from "@/shared/components/TitleComponent";
import { useSupplierOrderType } from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/lib/supplierOrderType.hook";
import {
  deleteSupplierOrderType,
  updateSupplierOrderType,
} from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/lib/supplierOrderType.actions";
import SupplierOrderTypeActions from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/components/SupplierOrderTypeActions";
import SupplierOrderTypeTable from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/components/SupplierOrderTypeTable";
import { supplierOrderTypeColumns } from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/components/SupplierOrderTypeColumns";
import SupplierOrderTypeOptions from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/components/SupplierOrderTypeOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import SupplierOrderTypeModal from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/components/SupplierOrderTypeModal";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { SUPPLIER_ORDER_TYPE } from "@/features/ap/configuraciones/vehiculos/tipos-pedido-proveedor/lib/supplierOrderType.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function SupplierOrderTypePage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = SUPPLIER_ORDER_TYPE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useSupplierOrderType({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateSupplierOrderType(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSupplierOrderType(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Tipos de pedido proveedor de Vehículos"}
          icon={currentView.icon}
        />
        <SupplierOrderTypeActions permissions={permissions} />
      </HeaderTableWrapper>
      <SupplierOrderTypeTable
        isLoading={isLoading}
        columns={supplierOrderTypeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <SupplierOrderTypeOptions search={search} setSearch={setSearch} />
      </SupplierOrderTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <SupplierOrderTypeModal
          id={updateId}
          title={"Actualizar Tipo de Pedido Proveedor"}
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
