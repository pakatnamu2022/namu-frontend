"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function.ts";
import { createDebitNote } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions.ts";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import { ELECTRONIC_DOCUMENT_CAJA } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants.ts";
import { useElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook.ts";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { DebitNoteSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema.ts";
import { DebitNoteForm } from "@/features/ap/facturacion/electronic-documents/components/forms/DebitNoteForm.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";

export default function AddDebitNoteCajaPage() {
  const { ROUTE, ABSOLUTE_ROUTE } = ELECTRONIC_DOCUMENT_CAJA;
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

  const { mutate, isPending } = useMutation({
    mutationFn: (data: DebitNoteSchema) =>
      createDebitNote(
        documentId,
        data,
        originalDocument?.fecha_de_emision || "",
      ),
    onSuccess: () => {
      successToast("Nota de débito generada correctamente");
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || "Error al generar nota de débito";
      errorToast(msg);
    },
  });

  const handleSubmit = (data: DebitNoteSchema) => {
    mutate(data);
  };

  if (isLoadingModule) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (isNaN(documentId)) notFound();
  if (documentError) notFound();

  if (isLoadingDocument || !originalDocument) {
    return <FormSkeleton />;
  }

  return (
    <FormWrapper maxWidth="max-w-(--breakpoint-2xl)">
      <TitleFormComponent
        title="Generar Nota de Débito"
        mode="create"
        icon="FilePlus"
      />
      <DebitNoteForm
        originalDocument={originalDocument}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </FormWrapper>
  );
}
