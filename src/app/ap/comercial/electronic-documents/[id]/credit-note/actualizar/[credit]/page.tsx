"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { updateCreditNote } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { ELECTRONIC_DOCUMENT } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { CreditNoteSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { CreditNoteForm } from "@/features/ap/facturacion/electronic-documents/components/forms/CreditNoteForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateCreditNotePage() {
  const { ROUTE, ABSOLUTE_ROUTE } = ELECTRONIC_DOCUMENT;
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
