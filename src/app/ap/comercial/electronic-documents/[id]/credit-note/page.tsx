"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { createCreditNote } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { ELECTRONIC_DOCUMENT } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { CreditNoteSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { CreditNoteForm } from "@/features/ap/facturacion/electronic-documents/components/forms/CreditNoteForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddCreditNotePage() {
  const { ROUTE, ABSOLUTE_ROUTE } = ELECTRONIC_DOCUMENT;
  const params = useParams();
  const router = useNavigate();
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();
  const documentId = parseInt(params.id as string);

  // Fetch original document data
  const {
    data: originalDocument,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useElectronicDocument(documentId);

  /**
   * Transforms CreditNoteSchema data to match backend API requirements
   */
  function enrichCreditNotePayload(data: CreditNoteSchema) {
    return {
      original_document_id: documentId,
      sunat_concept_credit_note_type_id: data.sunat_concept_credit_note_type_id,
      series: data.series,
      fecha_de_emision: originalDocument!.fecha_de_emision,
      observaciones: data.observaciones,
      enviar_automaticamente_a_la_sunat: data.enviar_automaticamente_a_la_sunat,
      enviar_automaticamente_al_cliente: data.enviar_automaticamente_al_cliente,
      items: data.items,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreditNoteSchema) =>
      createCreditNote(documentId, enrichCreditNotePayload(data)),
    onSuccess: () => {
      successToast("Nota de crédito generada correctamente");
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || "Error al generar nota de crédito";
      errorToast(msg);
    },
  });

  const handleSubmit = (data: CreditNoteSchema) => {
    mutate(data);
  };

  if (isLoadingModule) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (isNaN(documentId)) notFound();
  if (documentError) notFound();
  if (!isLoadingDocument && !originalDocument) notFound();

  if (isLoadingDocument || !originalDocument) {
    return <FormSkeleton />;
  }

  return (
    <FormWrapper maxWidth="max-w-(--breakpoint-2xl)">
      <TitleFormComponent
        title="Generar Nota de Crédito"
        mode="create"
        icon="FileMinus"
      />
      <CreditNoteForm
        originalDocument={originalDocument}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </FormWrapper>
  );
}
