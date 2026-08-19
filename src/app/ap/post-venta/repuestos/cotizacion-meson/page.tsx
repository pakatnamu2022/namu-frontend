"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useScopedFilters } from "@/shared/hooks/useScopedFilters";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  getCurrentDayOfMonth,
  getFirstDayOfMonth,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_MEDIUM_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { useNavigate } from "react-router-dom";
import {
  ORDER_QUOTATION_MESON,
  ORDER_QUOTATION_STATUS_GROUP,
  ORDER_QUOTATION_STATUS_GROUP_IDS,
  type OrderQuotationStatusGroup,
} from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import { deleteOrderQuotation } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions";
import { useOrderQuotations } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.hook";
import OrderQuotationMesonTable from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/ProformaMesonTable";
import OrderQuotationMesonActions from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/ProformaMesonActions";
import OrderQuotationMesonOptions from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/ProformaMesonOptions";
import { orderQuotationMesonColumns } from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/ProformaMesonColumns";
import { OrderQuotationDeliverySheet } from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/OrderQuotationDeliverySheet";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { AREA_MESON } from "@/features/ap/ap-master/lib/apMaster.constants";

export default function OrderQuotationMesonPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_MEDIUM_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
    null,
  );
  const [isDeliverySheetOpen, setIsDeliverySheetOpen] = useState(false);
  const { MODEL, ROUTE, ROUTE_UPDATE, ABSOLUTE_ROUTE } = ORDER_QUOTATION_MESON;
  const permissions = useModulePermissions(ROUTE);
  const router = useNavigate();
  const currentDate = new Date();

  const { values: filters, setFieldValue: setFilter } = useScopedFilters(
    ABSOLUTE_ROUTE,
    {
      search: "",
      sedeId: "",
      statusGroups: [ORDER_QUOTATION_STATUS_GROUP.ABIERTAS] as string[],
      dateFrom: getFirstDayOfMonth(currentDate) as Date | undefined,
      dateTo: getCurrentDayOfMonth(currentDate) as Date | undefined,
    },
  );
  const { search, sedeId, statusGroups, dateFrom, dateTo } = filters;
  const setSearch = (value: string) => setFilter("search", value);
  const setSedeId = (value: string) => setFilter("sedeId", value);
  const setStatusGroups = (value: string[]) => setFilter("statusGroups", value);
  const setDateFrom = (value: Date | undefined) => setFilter("dateFrom", value);
  const setDateTo = (value: Date | undefined) => setFilter("dateTo", value);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateTo(dateFrom);
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const statusIds = statusGroups.flatMap(
    (group) =>
      ORDER_QUOTATION_STATUS_GROUP_IDS[group as OrderQuotationStatusGroup],
  );

  const orderQuotationFilters = {
    page,
    search,
    per_page,
    quotation_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    area_id: AREA_MESON.toString(),
    sede_id: sedeId,
    status_id: statusIds.length > 0 ? statusIds : undefined,
  };

  const { data, isLoading, refetch } = useOrderQuotations(
    orderQuotationFilters,
    !!sedeId,
  );

  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  useEffect(() => {
    if (sedes.length > 0 && !sedeId) {
      setSedeId(sedes[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedes, setSedeId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOrderQuotation(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdate = (id: number) => {
    router(`${ROUTE_UPDATE}/${id}`);
  };

  const handleRequestDiscount = (id: number) => {
    router(`${ABSOLUTE_ROUTE}/solicitar-descuento/${id}`);
  };

  const handleApprove = (id: number) => {
    router(`${ABSOLUTE_ROUTE}/aprobar/${id}`);
  };

  const handleViewBilling = (orderQuotation: { id: number }) => {
    router(`${ABSOLUTE_ROUTE}/detalle/${orderQuotation.id}`);
  };

  const handleManage = (id: number) => {
    router(`${ABSOLUTE_ROUTE}/gestionar/${id}`);
  };

  const handleViewDelivery = (orderQuotation: { id: number }) => {
    setSelectedDeliveryId(orderQuotation.id);
    setIsDeliverySheetOpen(true);
  };

  const handleCloseDeliverySheet = () => {
    setIsDeliverySheetOpen(false);
    setSelectedDeliveryId(null);
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
        <OrderQuotationMesonActions
          permissions={permissions}
          filters={orderQuotationFilters}
        />
      </HeaderTableWrapper>

      <OrderQuotationMesonTable
        isLoading={isLoading}
        columns={orderQuotationMesonColumns({
          onDelete: setDeleteId,
          onUpdate: handleUpdate,
          onViewBilling: handleViewBilling,
          onViewDelivery: handleViewDelivery,
          onManage: handleManage,
          onRequestDiscount: handleRequestDiscount,
          onApprove: handleApprove,
          onRefresh: refetch,
          permissions,
        })}
        data={data?.data || []}
      >
        <OrderQuotationMesonOptions
          search={search}
          setSearch={setSearch}
          sedes={sedes}
          sedeId={sedeId}
          setSedeId={setSedeId}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          statusGroups={statusGroups}
          setStatusGroups={setStatusGroups}
        />
      </OrderQuotationMesonTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <OrderQuotationDeliverySheet
        orderQuotationId={selectedDeliveryId}
        open={isDeliverySheetOpen}
        onClose={handleCloseDeliverySheet}
        onRefresh={refetch}
      />
    </div>
  );
}
