"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { updateElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { ElectronicDocumentForm } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { ELECTRONIC_DOCUMENT } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { useElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { notFound } from "@/shared/hooks/useNotFound";
import { STATUS_ACTIVE } from "@/core/core.constants";
import PageWrapper from "@/shared/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

export default function UpdateElectronicDocumentPage() {
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = ELECTRONIC_DOCUMENT;
  const params = useParams();
  const router = useNavigate();
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();
  const id = parseInt(params.id as string);

  // Fetch document data
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useElectronicDocument(id);

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
      enable_commercial: STATUS_ACTIVE,
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

  // Fetch authorized series
  const { data: authorizedSeries = [] } = useAuthorizedSeries({});

  const form = useForm<ElectronicDocumentSchema>({
    resolver: zodResolver(ElectronicDocumentSchema as any),
  });

  // Load document data into form
  useEffect(() => {
    if (document) {
      form.reset({
        sunat_concept_document_type_id:
          document.sunat_concept_document_type_id.toString(),
        serie: document.serie,
        numero: document.numero.toString(),
        sunat_concept_transaction_type_id:
          document.sunat_concept_transaction_type_id.toString(),
        area_id: document.area_id.toString(),
        origin_entity_type: document.origin_entity_type || "",
        origin_entity_id: document.origin_entity_id?.toString() || "",
        purchase_request_quote_id:
          document.purchase_request_quote_id?.toString() || "",
        is_advance_payment: document.is_advance_payment ?? false,
        client_id: document.client_id?.toString() || "",
        fecha_de_emision: document.fecha_de_emision || "",
        fecha_de_vencimiento: document.fecha_de_vencimiento || "",
        sunat_concept_currency_id:
          document.sunat_concept_currency_id.toString() || "",
        tipo_de_cambio: document.tipo_de_cambio ?? 0,
        descuento_global: document.descuento_global ?? 0,
        total_descuento: document.total_descuento ?? 0,
        total_anticipo: document.total_anticipo ?? 0,
        total_gravada: document.total_gravada ?? 0,
        total_inafecta: document.total_inafecta ?? 0,
        total_exonerada: document.total_exonerada ?? 0,
        total_igv: document.total_igv ?? 0,
        total_gratuita: document.total_gratuita ?? 0,
        total_otros_cargos: document.total_otros_cargos ?? 0,
        total_isc: document.total_isc ?? 0,
        total: document.total ?? 0,
        // percepcion_tipo: document.percepcion_tipo ?? 0,
        // percepcion_base_imponible: document.percepcion_base_imponible ?? 0,
        // total_percepcion: document.total_percepcion ?? 0,
        // total_incluido_percepcion: document.total_incluido_percepcion ?? 0,
        // retencion_tipo: document.retencion_tipo ?? 0,
        // retencion_base_imponible: document.retencion_base_imponible ?? 0,
        // total_retencion: document.total_retencion ?? 0,
        detraccion: document.detraccion,
        sunat_concept_detraction_type_id:
          document.sunat_concept_detraction_type_id?.toString() || "",
        detraccion_total: document.detraccion_total ?? 0,
        // detraccion_porcentaje: document.detraccion_porcentaje ?? 0,
        // medio_de_pago_detraccion: document.medio_de_pago_detraccion ?? 0,
        // documento_que_se_modifica_tipo:
        //   document.documento_que_se_modifica_tipo ?? 0,
        // documento_que_se_modifica_serie:
        //   document.documento_que_se_modifica_serie || "",
        // documento_que_se_modifica_numero:
        //   document.documento_que_se_modifica_numero ?? 0,
        sunat_concept_credit_note_type_id:
          document.sunat_concept_credit_note_type_id?.toString() || "",
        sunat_concept_debit_note_type_id:
          document.sunat_concept_debit_note_type_id?.toString() || "",
        observaciones: document.observaciones || "" || "",
        condiciones_de_pago: document.condiciones_de_pago || "",
        medio_de_pago: document.medio_de_pago || "",
        bank_id: document.bank?.id?.toString() || undefined,
        operation_number: document.operation_number || undefined,
        financing_type: document.financing_type || undefined,
        placa_vehiculo: document.placa_vehiculo || "",
        orden_compra_servicio: document.orden_compra_servicio || "",
        codigo_unico: document.codigo_unico || "",
        enviar_automaticamente_a_la_sunat:
          document.enviar_automaticamente_a_la_sunat ?? false,
        enviar_automaticamente_al_cliente:
          document.enviar_automaticamente_al_cliente ?? false,
        generado_por_contingencia: document.generado_por_contingencia ?? false,
        items:
          document.items?.map((item) => ({
            reference_document_id:
              item.reference_document_id?.toString() || undefined,
            account_plan_id: item.account_plan_id?.toString() || "",
            unidad_de_medida: item.unidad_de_medida || "",
            codigo: item.codigo || "",
            codigo_producto_sunat: item.codigo_producto_sunat || "",
            descripcion: item.descripcion || "",
            cantidad: item.cantidad ?? 0,
            valor_unitario: item.valor_unitario ?? 0,
            precio_unitario: item.precio_unitario ?? 0,
            descuento: item.descuento ?? undefined,
            subtotal: item.subtotal ?? 0,
            sunat_concept_igv_type_id: item.sunat_concept_igv_type_id || 0,
            igv: item.igv ?? 0,
            total: item.total ?? 0,
            anticipo_regularizacion: item.anticipo_regularizacion ?? undefined,
            anticipo_documento_serie:
              item.anticipo_documento_serie || undefined,
            anticipo_documento_numero:
              item.anticipo_documento_numero ?? undefined,
          })) || [],
        guias: document.guides?.map((guide) => ({
          guia_tipo: guide.guia_tipo,
          guia_serie_numero: guide.guia_serie_numero || "",
        })),
        venta_al_credito: document.installments?.map((installment) => ({
          cuota: installment.cuota,
          fecha_de_pago: installment.fecha_de_pago || "",
          importe: installment.importe,
        })),
      });
    }
  }, [document, form]);

  // Find and set the series ID based on the series string
  useEffect(() => {
    if (document && authorizedSeries.length > 0) {
      const serieString = document.serie;
      const foundSeries = authorizedSeries.find(
        (series) => series.series === serieString,
      );

      if (foundSeries) {
        const currentSerieValue = form.getValues("serie");
        if (currentSerieValue !== foundSeries.id.toString()) {
          form.setValue("serie", foundSeries.id.toString());
        }
      }
    }
  }, [document, authorizedSeries, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ElectronicDocumentSchema) =>
      updateElectronicDocument(id, data),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: ElectronicDocumentSchema) => {
    mutate(data);
  };

  const { setOpen, setOpenMobile } = useSidebar();
  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (isNaN(id)) notFound();
  if (documentError) notFound();

  if (!document || isLoadingDocument || isLoadingSunatConcepts) {
    return <FormSkeleton />;
  }

  // Only allow editing draft documents
  if (document && document.status !== "draft") {
    errorToast("Solo se pueden editar documentos en estado Borrador");
    router(ROUTE);
    return <FormSkeleton />;
  }

  return (
    <PageWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <ElectronicDocumentForm
        form={form}
        onSubmit={handleSubmit}
        isPending={isPending}
        isEdit={true}
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
    </PageWrapper>
  );
}
