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
import {
  CreditNoteSchema,
  CREDIT_NOTE_TYPE_IDS,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
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
    const typeId = Number(data.sunat_concept_credit_note_type_id);
    const base = {
      sunat_concept_credit_note_type_id: typeId,
      series: Number(data.series),
      fecha_de_emision: data.fecha_de_emision,
      observaciones: data.observaciones,
    };
    if (typeId === CREDIT_NOTE_TYPE_IDS.DESCUENTO_GLOBAL) {
      return {
        ...base,
        discount_amount: data.discount_amount,
        account_plan_id: data.account_plan_id
          ? parseInt(data.account_plan_id)
          : undefined,
      };
    }
    if (typeId === CREDIT_NOTE_TYPE_IDS.DEVOLUCION_ITEM) {
      return { ...base, detail_ids: data.detail_ids };
    }
    return base; // Types 01 / 06 — no extra fields, backend copies items
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
