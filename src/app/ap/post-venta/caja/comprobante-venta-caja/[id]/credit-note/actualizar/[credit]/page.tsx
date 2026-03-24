"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function.ts";
import { updateCreditNote } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions.ts";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import { useElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook.ts";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { CreditNoteSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema.ts";
import { CreditNoteForm } from "@/features/ap/facturacion/electronic-documents/components/forms/CreditNoteForm.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { ELECTRONIC_DOCUMENT_CAJA } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants.ts";

export default function UpdateCreditNoteCajaPage() {
  const { ROUTE, ABSOLUTE_ROUTE } = ELECTRONIC_DOCUMENT_CAJA;
  const params = useParams();
  const router = useNavigate();
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();
  const documentId = parseInt(params.id as string);
  const creditNoteId = parseInt(params.credit as string);

  // Fetch original document data
  const {
    data: originalDocument,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useElectronicDocument(documentId);

  const {
    data: creditNote,
    isLoading: isLoadingCreditNote,
    error: creditNoteError,
  } = useElectronicDocument(creditNoteId);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreditNoteSchema) =>
      updateCreditNote(creditNoteId, data),
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
  if (isNaN(creditNoteId)) notFound();
  if (creditNoteError) notFound();

  if (
    isLoadingCreditNote ||
    !creditNote ||
    isLoadingDocument ||
    !originalDocument
  ) {
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
        creditNote={creditNote}
        originalDocument={originalDocument}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </FormWrapper>
  );
}
