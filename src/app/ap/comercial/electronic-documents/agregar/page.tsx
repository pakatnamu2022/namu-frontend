"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { ElectronicDocumentForm } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { ELECTRONIC_DOCUMENT } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddElectronicDocumentPage() {
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = ELECTRONIC_DOCUMENT;
  const router = useNavigate();
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();

  // Fetch all SunatConcepts in a single query
  const { data: sunatConcepts = [], isLoading: isLoadingSunatConcepts } =
    useAllSunatConcepts({
      type: [
        SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
        SUNAT_CONCEPTS_TYPE.BILLING_TRANSACTION_TYPE,
        SUNAT_CONCEPTS_TYPE.TYPE_DOCUMENT,
        SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY,
        SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE,
        SUNAT_CONCEPTS_TYPE.BILLING_DETRACTION_TYPE,
        SUNAT_CONCEPTS_TYPE.BILLING_CREDIT_NOTE_TYPE,
        SUNAT_CONCEPTS_TYPE.BILLING_DEBIT_NOTE_TYPE,
      ],
    });

  // Filter concepts by type locally
  const documentTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
      ),
    [sunatConcepts],
  );

  const transactionTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) =>
          concept.type === SUNAT_CONCEPTS_TYPE.BILLING_TRANSACTION_TYPE,
      ),
    [sunatConcepts],
  );

  const identityDocumentTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.TYPE_DOCUMENT,
      ),
    [sunatConcepts],
  );

  const currencyTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY,
      ),
    [sunatConcepts],
  );

  const igvTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE,
      ),
    [sunatConcepts],
  );

  const detractionTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) =>
          concept.type === SUNAT_CONCEPTS_TYPE.BILLING_DETRACTION_TYPE,
      ),
    [sunatConcepts],
  );

  const creditNoteTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) =>
          concept.type === SUNAT_CONCEPTS_TYPE.BILLING_CREDIT_NOTE_TYPE,
      ),
    [sunatConcepts],
  );

  const debitNoteTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) =>
          concept.type === SUNAT_CONCEPTS_TYPE.BILLING_DEBIT_NOTE_TYPE,
      ),
    [sunatConcepts],
  );

  const form = useForm<ElectronicDocumentSchema>({
    resolver: zodResolver(ElectronicDocumentSchema as any),
    defaultValues: {
      serie: "",
      numero: "",
      sunat_concept_document_type_id: "",
      sunat_concept_transaction_type_id: "",
      origin_module: "comercial",
      client_id: "",
      fecha_de_emision: new Date().toISOString().split("T")[0],
      total: 0,
      items: [],
      enviar_automaticamente_a_la_sunat: false,
      enviar_automaticamente_al_cliente: false,
      detraccion: false,
      is_advance_payment: false,
      sunat_concept_currency_id: "",
      operation_number: "",
      bank_id: "",
      condiciones_de_pago: "CONTADO",
      medio_de_pago: "",
      ap_vehicle_id: "",
    },
    mode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: storeElectronicDocument,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ElectronicDocumentSchema) => {
    mutate(data);
  };

  if (isLoadingModule) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  if (isLoadingSunatConcepts) {
    return <FormSkeleton />;
  }

  return (
    <FormWrapper maxWidth="max-w-(--breakpoint-2xl)">
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <ElectronicDocumentForm
        form={form}
        onSubmit={handleSubmit}
        isPending={isPending}
        isEdit={false}
        documentTypes={documentTypes || []}
        transactionTypes={transactionTypes || []}
        identityDocumentTypes={identityDocumentTypes || []}
        currencyTypes={currencyTypes || []}
        igvTypes={igvTypes || []}
        detractionTypes={detractionTypes || []}
        creditNoteTypes={creditNoteTypes || []}
        debitNoteTypes={debitNoteTypes || []}
        useQuotation={true}
      />
    </FormWrapper>
  );
}
