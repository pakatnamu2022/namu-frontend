"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { createDebitNote } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { ELECTRONIC_DOCUMENT } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { DebitNoteSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { DebitNoteForm } from "@/features/ap/facturacion/electronic-documents/components/forms/DebitNoteForm";
import NotFound from '@/app/not-found';


export default function UpdateDebitNotePage() {
    const { ROUTE } = ELECTRONIC_DOCUMENT;
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
        originalDocument?.fecha_de_emision || ""
      ),
    onSuccess: () => {
      successToast("Nota de débito generada correctamente");
      router("/ap/comercial/electronic-documents");
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
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;
  if (isNaN(documentId)) return <NotFound />;
  if (documentError) return <NotFound />;

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
