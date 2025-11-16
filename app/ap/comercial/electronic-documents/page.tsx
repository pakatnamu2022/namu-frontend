"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import {
  sendElectronicDocumentToSunat,
  cancelElectronicDocument,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import ElectronicDocumentTable from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentTable";
import { electronicDocumentColumns } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentColumns";
import ElectronicDocumentOptions from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentOptions";
import { ElectronicDocumentDetailSheet } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentDetailSheet";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { ELECTRONIC_DOCUMENT } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useElectronicDocuments } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import ElectronicDocumentActions from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentActions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from "@/app/not-found";


export default function ElectronicDocumentsPage() {
  
  const { ROUTE } = ELECTRONIC_DOCUMENT;
  const permissions = useModulePermissions(ROUTE);
  const queryClient = useQueryClient();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [selectedDocument, setSelectedDocument] =
    useState<ElectronicDocumentResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, statusFilter, moduleFilter, documentTypeFilter]);

  const { data, isLoading, isFetching, refetch } = useElectronicDocuments({
    page,
    per_page,
    search,
    status: statusFilter,
    origin_module: moduleFilter,
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["electronic-documents"] });
    refetch();
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle="Gestión de Documentos Electrónicos (Facturas, Boletas, NC, ND)"
          icon={currentView.icon}
        />
        <ElectronicDocumentActions
          onRefresh={handleRefresh}
          isLoading={isFetching && !isLoading}
          permissions={{
            canCreate: true, // TODO: Implementar verificación de permisos
          }}
        />
      </HeaderTableWrapper>

      <ElectronicDocumentTable
        isLoading={isLoading}
        columns={electronicDocumentColumns({
          onView: handleView,
          onSendToSunat: handleSendToSunat,
          onAnnul: handleCancel,
          permissions: {
            canUpdate,
            canAnnul,
            canSend,
            canCreateCreditNote,
            canCreateDebitNote,
          },
        })}
        data={data?.data || []}
      >
        <ElectronicDocumentOptions
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          moduleFilter={moduleFilter}
          setModuleFilter={setModuleFilter}
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
