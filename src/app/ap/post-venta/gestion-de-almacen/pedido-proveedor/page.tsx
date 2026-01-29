"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  getMonday,
  getSunday,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { useSupplierOrder } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.hook.ts";
import { deleteSupplierOrder } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.actions.ts";
import SupplierOrderActions from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/components/SupplierOrderActions.tsx";
import SupplierOrderTable from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/components/SupplierOrderTable.tsx";
import { supplierOrderColumns } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/components/SupplierOrderColumns.tsx";
import SupplierOrderOptions from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/components/SupplierOrderOptions.tsx";
import { SUPPLIER_ORDER } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.constants.ts";
import { SupplierOrderViewSheet } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/components/SupplierOrderViewSheet.tsx";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";

export default function SupplierOrderPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [sedeId, setSedeId] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewOrderId, setViewOrderId] = useState<number | null>(null);
  const { MODEL, ROUTE, ROUTE_ADD, ROUTE_UPDATE, ABSOLUTE_ROUTE } =
    SUPPLIER_ORDER;
  const permissions = useModulePermissions(ROUTE);
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    getMonday(currentDate),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    getSunday(currentDate),
  );

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  // Obtener mis almacenes físicos de postventa
  const { data: mySedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  useEffect(() => {
    if (mySedes.length > 0 && !sedeId) {
      setSedeId(mySedes[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySedes]);

  const { data, isLoading, refetch } = useSupplierOrder({
    page,
    search,
    per_page,
    order_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    sede_id: sedeId || undefined,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSupplierOrder(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleView = (id: number) => {
    setViewOrderId(id);
  };

  if (isLoadingModule || isLoadingSedes) return <PageSkeleton />;
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
        <SupplierOrderActions permissions={permissions} routeAdd={ROUTE_ADD} />
      </HeaderTableWrapper>
      <SupplierOrderTable
        isLoading={isLoading}
        columns={supplierOrderColumns({
          onDelete: setDeleteId,
          onView: handleView,
          permissions,
          routeUpdate: ROUTE_UPDATE,
          routeInvoice: `${ABSOLUTE_ROUTE}/facturar`,
        })}
        data={data?.data || []}
      >
        <SupplierOrderOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          sedes={mySedes}
          sedeId={sedeId}
          setSedeId={setSedeId}
        />
      </SupplierOrderTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <SupplierOrderViewSheet
        open={viewOrderId !== null}
        onOpenChange={(open) => !open && setViewOrderId(null)}
        orderId={viewOrderId}
      />

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
