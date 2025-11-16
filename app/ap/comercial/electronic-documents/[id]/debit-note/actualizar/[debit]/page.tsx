"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import { createDebitNote } from "@/src/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { ELECTRONIC_DOCUMENT } from "@/src/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useElectronicDocument } from "@/src/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { DebitNoteSchema } from "@/src/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { DebitNoteForm } from "@/src/features/ap/facturacion/electronic-documents/components/forms/DebitNoteForm";

export default function CreateDebitNotePage() {
  const { ROUTE } = ELECTRONIC_DOCUMENT;
  const params = useParams();
  const router = useRouter();
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
      router.push("/ap/comercial/electronic-documents");
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
