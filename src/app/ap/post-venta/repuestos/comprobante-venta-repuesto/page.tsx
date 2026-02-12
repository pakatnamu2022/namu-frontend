"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { errorToast, successToast } from "@/core/core.function";
import { AREA_MESON, DEFAULT_PER_PAGE } from "@/core/core.constants";
import {
  sendElectronicDocumentToSunat,
  cancelElectronicDocument,
  preCancelElectronicDocument,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import ElectronicDocumentTable from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentTable";
import { electronicDocumentColumns } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentColumns";
import { ElectronicDocumentDetailSheet } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentDetailSheet";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { ELECTRONIC_DOCUMENT_REPUESTOS } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useElectronicDocuments } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import SalesReceiptsActions from "@/features/ap/post-venta/comprobante-venta/components/SalesReceiptsActions";
import SalesReceiptsOptions from "@/features/ap/post-venta/comprobante-venta/components/SalesReceiptsOptions";

export default function SalesReceiptsRepuestoPage() {
  const { ROUTE } = ELECTRONIC_DOCUMENT_REPUESTOS;
  const permissions = useModulePermissions(ROUTE);
  const queryClient = useQueryClient();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [selectedDocument, setSelectedDocument] =
    useState<ElectronicDocumentResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, per_page, statusFilter, documentTypeFilter]);

  const { data, isLoading, isFetching, refetch } = useElectronicDocuments({
    page,
    per_page,
    search,
    status: statusFilter,
    area_id: AREA_MESON.toString(),
    sunat_concept_document_type_id: documentTypeFilter
      ? parseInt(documentTypeFilter)
      : undefined,
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
    if (!result.annulled) {
      throw new Error(
        "El documento no está anulado en Dynamics. No se puede anular en Nubefact.",
      );
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["electronic-documents"] });
    refetch();
  };

  if (isLoadingModule) return <PageSkeleton />;
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
          onRefresh={handleRefresh}
          isLoading={isFetching && !isLoading}
        />
      </HeaderTableWrapper>

      {/* <pre>
        <code>{JSON.stringify(permissions, null, 2)}</code>
      </pre> */}

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
          module: "REPUESTOS",
        })}
        data={data?.data || []}
      >
        <SalesReceiptsOptions
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          documentTypeFilter={documentTypeFilter}
          setDocumentTypeFilter={setDocumentTypeFilter}
          documentTypes={documentTypes || []}
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
