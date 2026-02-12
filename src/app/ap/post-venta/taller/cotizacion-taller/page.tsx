"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import {
  ERROR_MESSAGE,
  errorToast,
  getCurrentDayOfMonth,
  getFirstDayOfMonth,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { useNavigate } from "react-router-dom";
import { ORDER_QUOTATION_TALLER } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants.ts";
import OrderQuotationActions from "@/features/ap/post-venta/taller/cotizacion/components/ProformaActions.tsx";
import { orderQuotationColumns } from "@/features/ap/post-venta/taller/cotizacion/components/ProformaColumns.tsx";
import OrderQuotationTable from "@/features/ap/post-venta/taller/cotizacion/components/ProformaTable.tsx";
import OrderQuotationOptions from "@/features/ap/post-venta/taller/cotizacion/components/ProformaOptions.tsx";
import { deleteOrderQuotation } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions.ts";
import { useOrderQuotations } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.hook.ts";
import { AREA_PM_ID } from "@/features/ap/ap-master/lib/apMaster.constants.ts";

export default function OrderQuotationPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE, ROUTE_UPDATE, ABSOLUTE_ROUTE } = ORDER_QUOTATION_TALLER;
  const permissions = useModulePermissions(ROUTE);
  const router = useNavigate();
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    getFirstDayOfMonth(currentDate),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    getCurrentDayOfMonth(currentDate),
  );

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateTo(dateFrom);
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
  }, [dateFrom, dateTo]);

  const { data, isLoading, refetch } = useOrderQuotations({
    page,
    search,
    per_page,
    quotation_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    area_id: AREA_PM_ID.TALLER,
  });

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

  const handleManage = (id: number) => {
    router(`${ABSOLUTE_ROUTE}/gestionar/${id}`);
  };

  const handleApprove = (id: number) => {
    router(`${ABSOLUTE_ROUTE}/aprobar/${id}`);
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
        <OrderQuotationActions permissions={permissions} />
      </HeaderTableWrapper>

      <OrderQuotationTable
        isLoading={isLoading}
        columns={orderQuotationColumns({
          onDelete: setDeleteId,
          onUpdate: handleUpdate,
          onManage: handleManage,
          onApprove: handleApprove,
          permissions,
        })}
        data={data?.data || []}
      >
        <OrderQuotationOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      </OrderQuotationTable>

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
    </div>
  );
}
