"use client";

import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useScopedFilters } from "@/shared/hooks/useScopedFilters";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import {
  errorToast,
  successToast,
  getFirstDayOfMonth,
  getCurrentDayOfMonth,
} from "@/core/core.function.ts";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants.ts";
import {
  sendElectronicDocumentToSunat,
  cancelElectronicDocument,
  preCancelElectronicDocument,
  dispatchElectronicDocumentMigration,
  resetElectronicDocumentMigration,
  syncAccountingStatusById,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions.ts";
import ElectronicDocumentTable from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentTable.tsx";
import { electronicDocumentColumns } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentColumns.tsx";
import { ElectronicDocumentDetailSheet } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentDetailSheet.tsx";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { ELECTRONIC_DOCUMENT_CAJA } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants.ts";
import { useElectronicDocuments } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook.ts";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import SalesReceiptsActions from "@/features/ap/post-venta/comprobante-venta/components/SalesReceiptsActions.tsx";
import SalesReceiptsOptions from "@/features/ap/post-venta/comprobante-venta/components/SalesReceiptsOptions.tsx";
import {
  AREA_MESON,
  AREA_POSTVENTA,
  AREA_TALLER,
} from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook.ts";
import { useNavigate } from "react-router-dom";

export default function SalesReceiptsCajaPage() {
  const router = useNavigate();
  const { ROUTE, ABSOLUTE_ROUTE, ROUTE_ADD } = ELECTRONIC_DOCUMENT_CAJA;
  const permissions = useModulePermissions(ROUTE);
  const queryClient = useQueryClient();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [selectedDocument, setSelectedDocument] =
    useState<ElectronicDocumentResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentDate = new Date();

  const { values: filters, setFieldValue: setFilter } = useScopedFilters(
    ABSOLUTE_ROUTE,
    {
      search: "",
      sedeId: "",
      statusFilter: "",
      consolidationType: "",
      dateFrom: getFirstDayOfMonth(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1),
      ) as Date | undefined,
      dateTo: getCurrentDayOfMonth(currentDate) as Date | undefined,
    },
  );
  const { search, sedeId, statusFilter, consolidationType, dateFrom, dateTo } =
    filters;
  const setSearch = (value: string) => setFilter("search", value);
  const setSedeId = (value: string) => setFilter("sedeId", value);
  const setStatusFilter = (value: string) => setFilter("statusFilter", value);
  const setConsolidationType = (value: string) =>
    setFilter("consolidationType", value);
  const setDateFrom = (value: Date | undefined) => setFilter("dateFrom", value);
  const setDateTo = (value: Date | undefined) => setFilter("dateTo", value);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined;
  };

  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  useEffect(() => {
    if (sedes.length > 0 && !sedeId) {
      setSedeId(sedes[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedes, setSedeId]);

  const { data, isLoading, isFetching, refetch } = useElectronicDocuments({
    page,
    per_page,
    search,
    status: statusFilter,
    area_id: [AREA_TALLER, AREA_MESON, AREA_POSTVENTA], // Filtrar por ambas áreas
    fecha_de_emision:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    seriesModel$sede_id: sedeId ? parseInt(sedeId) : undefined,
    consolidation_type: consolidationType || undefined,
  });

  const canUpdate = permissions.canUpdate || false;
  const canAnnul = permissions.canAnnul || false;
  const canSend = permissions.canSend || false;
  const canCreateCreditNote = permissions.canCreate || false; // Usar mismo permiso que crear
  const canCreateDebitNote = permissions.canCreate || false;
  const canMigrate = permissions.canMigrate || false;

  const sendToSunatMutation = useMutation({
    mutationFn: sendElectronicDocumentToSunat,
    onSuccess: () => {
      successToast("Documento enviado a SUNAT correctamente");
      refetch();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al enviar a SUNAT: ${msg}`);
    },
  });

  const cancelDocumentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      cancelElectronicDocument(id, reason),
    onSuccess: () => {
      successToast("Documento cancelado en Nubefact correctamente");
      refetch();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al cancelar documento: ${msg}`);
    },
  });

  const handleView = (document: ElectronicDocumentResource) => {
    setSelectedDocument(document);
    setSheetOpen(true);
  };

  const handleSendToSunat = (id: number) => {
    sendToSunatMutation.mutate(id);
  };

  const handleCancel = (id: number, reason: string) => {
    cancelDocumentMutation.mutate({ id, reason });
  };

  const handlePreCancel = async (id: number) => {
    const result = await preCancelElectronicDocument(id);
    return result.annulled;
  };

  const migrateMutation = useMutation({
    mutationFn: dispatchElectronicDocumentMigration,
    onSuccess: () => {
      successToast("Migración despachada correctamente");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al despachar migración: ${msg}`);
    },
  });

  const resetMigrationMutation = useMutation({
    mutationFn: resetElectronicDocumentMigration,
    onSuccess: () => {
      successToast("Migración reiniciada correctamente");
      refetch();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al reiniciar migración: ${msg}`);
    },
  });

  const syncAccountingStatusMutation = useMutation({
    mutationFn: syncAccountingStatusById,
    onSuccess: (data) => {
      successToast(
        `Sincronizado: ${data.is_accounted ? "Contabilizado" : "No contabilizado"}${
          data.is_annulled ? " (Anulado)" : ""
        }`,
      );
      refetch();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al sincronizar contabilización: ${msg}`);
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["electronic-documents"] });
    refetch();
  };

  const documentExportFilters = {
    area_id: [AREA_TALLER, AREA_MESON, AREA_POSTVENTA],
    seriesModel$sede_id: sedeId ? parseInt(sedeId) : undefined,
    fecha_de_emision:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
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
          onHistoricalFinalSaleWithAdvanceClick={() =>
            router(`${ROUTE_ADD}-otros-historico`, { state: { sedeId } })
          }
          onRegularizeAdvancePaymentClick={() =>
            router(`${ROUTE_ADD}-regularizacion-anticipo`, {
              state: { sedeId },
            })
          }
          onRefresh={handleRefresh}
          isLoading={isFetching && !isLoading}
          permissions={permissions}
          filters={documentExportFilters}
          enableAccounting={false}
        />
      </HeaderTableWrapper>

      <ElectronicDocumentTable
        isLoading={isLoading}
        columns={electronicDocumentColumns({
          onView: handleView,
          onSendToSunat: handleSendToSunat,
          onAnnul: handleCancel,
          onPreCancel: handlePreCancel,
          onMigrate: (id) => migrateMutation.mutate(id),
          onResetMigration: (id) => resetMigrationMutation.mutate(id),
          onSyncAccountingStatus: (id) =>
            syncAccountingStatusMutation.mutate(id),
          permissions: {
            canUpdate,
            canAnnul,
            canSend,
            canCreateCreditNote,
            canCreateDebitNote,
            canMigrate,
            canResetMigration: permissions.canResetMigration || false,
          },
          routeAbsolute: ABSOLUTE_ROUTE,
        })}
        data={data?.data || []}
      >
        <SalesReceiptsOptions
          search={search}
          setSearch={setSearch}
          sedes={sedes}
          sedeId={sedeId}
          setSedeId={setSedeId}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          consolidationType={consolidationType}
          setConsolidationType={setConsolidationType}
        />
      </ElectronicDocumentTable>

      <ElectronicDocumentDetailSheet
        document={selectedDocument}
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
