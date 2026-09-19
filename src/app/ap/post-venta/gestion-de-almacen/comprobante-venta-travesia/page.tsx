"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useScopedFilters } from "@/shared/hooks/useScopedFilters";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import {
  errorToast,
  successToast,
  getFirstDayOfMonth,
  getCurrentDayOfMonth,
  formatDateFilter,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
import { revertPurchaseTraverse } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import ElectronicDocumentTable from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentTable";
import { salesReceiptsTravesiaColumns } from "@/features/ap/post-venta/comprobante-venta/components/SalesReceiptsTravesiaColumns";
import { ElectronicDocumentDetailSheet } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentDetailSheet";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { ELECTRONIC_DOCUMENT_ALMACEN } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useElectronicDocumentsSimplified } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import SalesReceiptsActions from "@/features/ap/post-venta/comprobante-venta/components/SalesReceiptsActions";
import SalesReceiptsOptions from "@/features/ap/post-venta/comprobante-venta/components/SalesReceiptsOptions";
import {
  AREA_MESON,
  AREA_TALLER,
} from "@/features/ap/ap-master/lib/apMaster.constants";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useNavigate } from "react-router-dom";

export default function SalesReceiptsAlmacenPage() {
  const router = useNavigate();
  const { ROUTE, ABSOLUTE_ROUTE, ROUTE_ADD } = ELECTRONIC_DOCUMENT_ALMACEN;
  const permissions = useModulePermissions(ROUTE);
  const queryClient = useQueryClient();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentDate = new Date();

  const { values: filters, setFieldValue: setFilter } = useScopedFilters(
    ABSOLUTE_ROUTE,
    {
      search: "",
      sedeId: "",
      associatePurchaseTraverse: "",
      dateFrom: getFirstDayOfMonth(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1),
      ) as Date | undefined,
      dateTo: getCurrentDayOfMonth(currentDate) as Date | undefined,
    },
  );
  const { search, sedeId, associatePurchaseTraverse, dateFrom, dateTo } =
    filters;
  const setSearch = (value: string) => setFilter("search", value);
  const setSedeId = (value: string) => setFilter("sedeId", value);
  const setAssociatePurchaseTraverse = (value: string) =>
    setFilter("associatePurchaseTraverse", value);
  const setDateFrom = (value: Date | undefined) => setFilter("dateFrom", value);
  const setDateTo = (value: Date | undefined) => setFilter("dateTo", value);

  const { data, isLoading, isFetching, refetch } =
    useElectronicDocumentsSimplified({
      page,
      per_page,
      search,
      area_id: [AREA_TALLER, AREA_MESON], // Filtrar por ambas áreas
      has_product_traverse: 1,
      status: "accepted",
      associate_purchase_traverse: associatePurchaseTraverse
        ? parseInt(associatePurchaseTraverse)
        : undefined,
      fecha_de_emision:
        dateFrom && dateTo
          ? [formatDateFilter(dateFrom), formatDateFilter(dateTo)]
          : undefined,
      seriesModel$sede_id: sedeId ? parseInt(sedeId) : undefined,
    });

  const canLinkCrossingPurchase = permissions.canLinkCrossingPurchase || false;

  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  useEffect(() => {
    if (sedes.length > 0 && !sedeId) {
      setSedeId(sedes[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedes, setSedeId]);

  const revertPurchaseTraverseMutation = useMutation({
    mutationFn: revertPurchaseTraverse,
    onSuccess: () => {
      successToast("Asociación de compra revertida correctamente");
      refetch();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al revertir la compra: ${msg}`);
    },
  });

  const handleView = (document: ElectronicDocumentResource) => {
    setSelectedDocumentId(document.id);
    setSheetOpen(true);
  };

  const handleRevertPurchase = (document: ElectronicDocumentResource) => {
    revertPurchaseTraverseMutation.mutate(document.id);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["electronic-documents"] });
    refetch();
  };

  if (isLoadingModule || isLoadingSedes) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle="Gestión de Documentos Electrónicos (Facturas, Boletas, NC, ND)"
          icon={currentView.icon}
        />
        <SalesReceiptsActions
          onOtherSalesClick={() =>
            router(`${ROUTE_ADD}-otros`, { state: { sedeId } })
          }
          onRegularizeAdvancePaymentClick={() =>
            router(`${ROUTE_ADD}-regularizacion-anticipo`, {
              state: { sedeId },
            })
          }
          onRefresh={handleRefresh}
          isLoading={isFetching && !isLoading}
          permissions={permissions}
          enableAccounting={false}
        />
      </HeaderTableWrapper>

      <ElectronicDocumentTable
        isLoading={isLoading}
        columns={salesReceiptsTravesiaColumns({
          onView: handleView,
          onAssociatePurchase: canLinkCrossingPurchase
            ? (document) =>
                router(`${ABSOLUTE_ROUTE}/asociar-compra/${document.id}`)
            : undefined,
          onRevertPurchase: canLinkCrossingPurchase
            ? handleRevertPurchase
            : undefined,
          permissions: {
            canLinkCrossingPurchase,
          },
        })}
        data={data?.data || []}
      >
        <SalesReceiptsOptions
          search={search}
          setSearch={setSearch}
          sedes={sedes}
          sedeId={sedeId}
          setSedeId={setSedeId}
          associatePurchaseTraverse={associatePurchaseTraverse}
          setAssociatePurchaseTraverse={setAssociatePurchaseTraverse}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      </ElectronicDocumentTable>

      <ElectronicDocumentDetailSheet
        documentId={selectedDocumentId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onStatusUpdated={refetch}
      />

      <DataTablePagination
        page={page}
        totalPages={data?.meta.last_page || 1}
        totalData={data?.meta.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
