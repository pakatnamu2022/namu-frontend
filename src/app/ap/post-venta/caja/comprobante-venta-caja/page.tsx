"use client";

import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { errorToast, successToast } from "@/core/core.function.ts";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants.ts";
import {
  sendElectronicDocumentToSunat,
  cancelElectronicDocument,
  preCancelElectronicDocument,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions.ts";
import ElectronicDocumentTable from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentTable.tsx";
import { electronicDocumentColumns } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentColumns.tsx";
import { ElectronicDocumentDetailSheet } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentDetailSheet.tsx";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { ELECTRONIC_DOCUMENT_CAJA } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants.ts";
import { useElectronicDocuments } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook.ts";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook.ts";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants.ts";
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
  const [sedeId, setSedeId] = useState<string>("");
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [consolidationType, setConsolidationType] = useState("");
  const [selectedDocument, setSelectedDocument] =
    useState<ElectronicDocumentResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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
    sunat_concept_document_type_id: documentTypeFilter
      ? parseInt(documentTypeFilter)
      : undefined,
    seriesModel$sede_id: sedeId ? parseInt(sedeId) : undefined,
    consolidation_type: consolidationType || undefined,
  });

  const canUpdate = permissions.canUpdate || false;
  const canAnnul = permissions.canAnnul || false;
  const canSend = permissions.canSend || false;
  const canCreateCreditNote = permissions.canCreate || false; // Usar mismo permiso que crear
  const canCreateDebitNote = permissions.canCreate || false;

  const { data: documentTypes } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE],
  });

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
          onOtherSalesClick={() => router(`${ROUTE_ADD}-otros`)}
          onRefresh={handleRefresh}
          isLoading={isFetching && !isLoading}
        />
      </HeaderTableWrapper>

      <ElectronicDocumentTable
        isLoading={isLoading}
        columns={electronicDocumentColumns({
          onView: handleView,
          onSendToSunat: handleSendToSunat,
          onAnnul: handleCancel,
          onPreCancel: handlePreCancel,
          permissions: {
            canUpdate,
            canAnnul,
            canSend,
            canCreateCreditNote,
            canCreateDebitNote,
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
          documentTypeFilter={documentTypeFilter}
          setDocumentTypeFilter={setDocumentTypeFilter}
          documentTypes={documentTypes || []}
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
