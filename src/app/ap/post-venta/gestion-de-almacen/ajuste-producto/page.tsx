"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  getCurrentDayOfMonth,
  getFirstDayOfMonth,
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
import {
  deleteAdjustmentsProduct,
  findAdjustmentsProductById,
} from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.actions.ts";
import AdjustmentsProductActions from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/components/AdjustmentsProductActions.tsx";
import AdjustmentsProductTable from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/components/AdjustmentsProductTable.tsx";
import { adjustmentsProductColumns } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/components/AdjustmentsProductColumns.tsx";
import AdjustmentsProductOptions from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/components/AdjustmentsProductOptions.tsx";
import { ADJUSTMENT } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.constants.ts";
import { useAdjustmentsProduct } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.hook.ts";
import { AdjustmentsProductDetailSheet } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/components/AdjustmentsProductDetailSheet.tsx";
import { AdjustmentsProductResource } from "@/features/ap/post-venta/gestion-almacen/ajuste-producto/lib/adjustmentsProduct.interface.ts";

export default function AdjustmentsProductPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<AdjustmentsProductResource | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const { MODEL, ROUTE } = ADJUSTMENT;
  const permissions = useModulePermissions(ROUTE);
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

  const { data, isLoading, refetch } = useAdjustmentsProduct({
    page,
    search,
    per_page,
    movement_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdjustmentsProduct(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleViewDetail = async (id: number) => {
    setIsLoadingDetail(true);
    setIsSheetOpen(true);
    try {
      const data = await findAdjustmentsProductById(id);
      setSelectedAdjustment(data);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "fetch", msg));
      setIsSheetOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedAdjustment(null);
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
        <AdjustmentsProductActions permissions={permissions} />
      </HeaderTableWrapper>
      <AdjustmentsProductTable
        isLoading={isLoading}
        columns={adjustmentsProductColumns({
          onDelete: setDeleteId,
          onView: handleViewDetail,
          permissions,
        })}
        data={data?.data || []}
      >
        <AdjustmentsProductOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      </AdjustmentsProductTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <AdjustmentsProductDetailSheet
        open={isSheetOpen}
        onOpenChange={handleCloseSheet}
        data={selectedAdjustment}
        isLoading={isLoadingDetail}
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
