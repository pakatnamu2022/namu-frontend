"use client";

import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PageSkeleton from "@/shared/components/PageSkeleton";
import FormSkeleton from "@/shared/components/FormSkeleton";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  errorToast,
  successToast,
} from "@/core/core.function";
import { STATUS_ACTIVE } from "@/core/core.constants";

// Electronic document
import {
  ElectronicDocumentSchema,
  type ElectronicDocumentSchema as ElectronicDocumentSchemaType,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { useElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { updateElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import { ELECTRONIC_DOCUMENT_CAJA } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { ElectronicDocumentForm } from "@/features/ap/facturacion/electronic-documents/components/ElectronicDocumentForm";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";

// SUNAT concepts
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

// Series autorizadas (única fuente)
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";

// Checkbooks
import { useAllApBank } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.hook";

// Work order
import { findWorkOrderById } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import InvoiceForm from "@/features/ap/post-venta/taller/orden-trabajo/components/InvoiceForm";
import { AREA_TALLER } from "@/features/ap/ap-master/lib/apMaster.constants";

// Order quotation
import { useOrderQuotationById } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.hook";
import { OrderQuotationBillingForm } from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/OrderQuotationBillingForm";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildFormDefaults(
  document: ElectronicDocumentResource,
): Partial<ElectronicDocumentSchemaType> {
  return {
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
    order_quotation_id: document.order_quotation_id?.toString() || "",
    work_order_id: document.work_order_id?.toString() || "",
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
    detraccion: document.detraccion,
    sunat_concept_detraction_type_id:
      document.sunat_concept_detraction_type_id?.toString() || "",
    detraccion_total: document.detraccion_total ?? 0,
    sunat_concept_credit_note_type_id:
      document.sunat_concept_credit_note_type_id?.toString() || "",
    sunat_concept_debit_note_type_id:
      document.sunat_concept_debit_note_type_id?.toString() || "",
    observaciones: document.observaciones || "",
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
        anticipo_documento_serie: item.anticipo_documento_serie || undefined,
        anticipo_documento_numero: item.anticipo_documento_numero ?? undefined,
      })) || [],
    guias: document.guides?.map((g) => ({
      guia_tipo: g.guia_tipo,
      guia_serie_numero: g.guia_serie_numero || "",
    })),
    venta_al_credito: document.installments?.map((i) => ({
      cuota: i.cuota,
      fecha_de_pago: i.fecha_de_pago || "",
      importe: i.importe,
    })),
  };
}

// ─── Shared prop types ────────────────────────────────────────────────────────

interface SubPageProps {
  documentId: number;
  onSuccess: () => void;
  onCancel: () => void;
  title: string;
  icon?: string;
}

// ─── Sub-page: Work Order (InvoiceForm) ──────────────────────────────────────

/**
 * Edición de documentos vinculados a una Orden de Trabajo.
 * Replica el mismo setup de hooks que usa BillingTab para construir InvoiceForm.
 */
function EditWorkOrderInvoicePage({
  documentId,
  workOrderId,
  onSuccess,
  onCancel,
  title,
  icon,
}: SubPageProps & { workOrderId: number }) {
  const { MODEL } = ELECTRONIC_DOCUMENT_CAJA;

  const form = useForm<ElectronicDocumentSchemaType>({
    resolver: zodResolver(ElectronicDocumentSchema) as any,
    defaultValues: {
      area_id: AREA_TALLER.toString(),
      is_advance_payment: false,
      items: [],
    },
  });

  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const selectedSeriesId = form.watch("serie");
  const selectedCurrencyId = form.watch("sunat_concept_currency_id");

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
    enabled: !!workOrderId,
  });

  const { data: document, isLoading: isLoadingDocument } =
    useElectronicDocument(documentId);

  const { data: sunatConcepts = [], isLoading: isLoadingSunat } =
    useAllSunatConcepts({
      type: [
        SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
        SUNAT_CONCEPTS_TYPE.BILLING_TRANSACTION_TYPE,
        SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY,
        SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE,
      ],
    });

  const documentTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
      ),
    [sunatConcepts],
  );
  const transactionTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_TRANSACTION_TYPE,
      ),
    [sunatConcepts],
  );
  const currencyTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY,
      ),
    [sunatConcepts],
  );
  const igvTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE,
      ),
    [sunatConcepts],
  );

  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: documentTypes.find(
      (dt) => dt.id.toString() === selectedDocumentType,
    )?.tribute_code,
  });

  const selectedSeries = authorizedSeries.find(
    (s: AssignSalesSeriesResource) => s.id.toString() === selectedSeriesId,
  );
  const selectedCurrency = currencyTypes.find(
    (c) => c.id === Number(selectedCurrencyId),
  );

  const { data: checkbooks = [] } = useAllApBank({
    currency_id: selectedCurrency?.currency_type,
    sede_id: selectedSeries?.sede_id,
  });

  // Cargar los datos del documento existente en el formulario
  useEffect(() => {
    if (document) {
      form.reset(buildFormDefaults(document));
    }
  }, [document, form]);

  // Sincronizar serie: el documento guarda el string (ej. "F001"),
  // el form necesita el ID numérico de la serie autorizada
  useEffect(() => {
    if (document && authorizedSeries.length > 0) {
      const found = authorizedSeries.find(
        (s: AssignSalesSeriesResource) => s.series === document.serie,
      );
      if (found && form.getValues("serie") !== found.id.toString()) {
        form.setValue("serie", found.id.toString());
      }
    }
  }, [document, authorizedSeries, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ElectronicDocumentSchemaType) =>
      updateElectronicDocument(documentId, data),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  if (isLoadingWorkOrder || isLoadingDocument || isLoadingSunat) {
    return <FormSkeleton />;
  }

  if (!workOrder) {
    errorToast("Orden de trabajo no encontrada");
    onCancel();
    return <FormSkeleton />;
  }

  return (
    <PageWrapper>
      <TitleFormComponent title={title} mode="edit" icon={icon as any} />
      <InvoiceForm
        form={form}
        onSubmit={(data) => mutate(data)}
        onCancel={onCancel}
        isPending={isPending}
        isEdit={true}
        selectedGroupNumber={null}
        documentTypes={documentTypes}
        transactionTypes={transactionTypes}
        currencyTypes={currencyTypes}
        igvTypes={igvTypes}
        authorizedSeries={authorizedSeries}
        checkbooks={checkbooks}
        workOrder={workOrder}
      />
    </PageWrapper>
  );
}

// ─── Sub-page: Order Quotation (OrderQuotationBillingForm) ────────────────────

/**
 * Edición de documentos vinculados a una Cotización de mesón.
 * OrderQuotationBillingForm se auto-gestiona sus hooks internos;
 * solo necesitamos pasarle la quotation y el form con los datos cargados.
 */
function EditOrderQuotationPage({
  documentId,
  orderQuotationId,
  onSuccess,
  onCancel,
  title,
  icon,
}: SubPageProps & { orderQuotationId: number }) {
  const { MODEL } = ELECTRONIC_DOCUMENT_CAJA;

  const form = useForm<ElectronicDocumentSchemaType>({
    resolver: zodResolver(ElectronicDocumentSchema) as any,
    defaultValues: { items: [] },
  });

  const { data: quotation, isLoading: isLoadingQuotation } =
    useOrderQuotationById(orderQuotationId);

  const { data: document, isLoading: isLoadingDocument } =
    useElectronicDocument(documentId);

  // Cargar los datos del documento existente en el formulario
  useEffect(() => {
    if (document) {
      form.reset(buildFormDefaults(document));
    }
  }, [document, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ElectronicDocumentSchemaType) =>
      updateElectronicDocument(documentId, data),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  if (isLoadingQuotation || isLoadingDocument) {
    return <FormSkeleton />;
  }

  if (!quotation) {
    errorToast("Cotización no encontrada");
    onCancel();
    return <FormSkeleton />;
  }

  return (
    <PageWrapper>
      <TitleFormComponent title={title} mode="edit" icon={icon as any} />
      <OrderQuotationBillingForm
        form={form}
        onSubmit={(data) => mutate(data)}
        isPending={isPending}
        quotation={quotation}
        isEdit={true}
      />
    </PageWrapper>
  );
}

// ─── Sub-page: Generic Electronic Document (ElectronicDocumentForm) ───────────

/**
 * Edición de documentos comerciales / con purchase_request_quote_id
 * o sin entidad vinculada. Comportamiento idéntico a la página original.
 */
function EditElectronicDocumentPage({
  documentId,
  onSuccess,
  onCancel,
  title,
  icon,
}: SubPageProps) {
  const { MODEL } = ELECTRONIC_DOCUMENT_CAJA;

  const form = useForm<ElectronicDocumentSchemaType>({
    resolver: zodResolver(ElectronicDocumentSchema) as any,
  });

  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useElectronicDocument(documentId);

  const { data: sunatConcepts = [], isLoading: isLoadingSunat } =
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

  const documentTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
      ),
    [sunatConcepts],
  );
  const transactionTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_TRANSACTION_TYPE,
      ),
    [sunatConcepts],
  );
  const identityDocumentTypes = useMemo(
    () =>
      sunatConcepts.filter((c) => c.type === SUNAT_CONCEPTS_TYPE.TYPE_DOCUMENT),
    [sunatConcepts],
  );
  const currencyTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY,
      ),
    [sunatConcepts],
  );
  const igvTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE,
      ),
    [sunatConcepts],
  );
  const detractionTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_DETRACTION_TYPE,
      ),
    [sunatConcepts],
  );
  const creditNoteTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_CREDIT_NOTE_TYPE,
      ),
    [sunatConcepts],
  );
  const debitNoteTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (c) => c.type === SUNAT_CONCEPTS_TYPE.BILLING_DEBIT_NOTE_TYPE,
      ),
    [sunatConcepts],
  );

  const { data: authorizedSeries = [] } = useAuthorizedSeries({});

  // Cargar los datos del documento existente en el formulario
  useEffect(() => {
    if (document) {
      form.reset(buildFormDefaults(document));
    }
  }, [document, form]);

  // Sincronizar serie: el documento guarda el string (ej. "F001"),
  // el form necesita el ID numérico de la serie autorizada
  useEffect(() => {
    if (document && authorizedSeries.length > 0) {
      const found = authorizedSeries.find(
        (s: AssignSalesSeriesResource) => s.series === document.serie,
      );
      if (found && form.getValues("serie") !== found.id.toString()) {
        form.setValue("serie", found.id.toString());
      }
    }
  }, [document, authorizedSeries, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ElectronicDocumentSchemaType) =>
      updateElectronicDocument(documentId, data),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  if (documentError) {
    onCancel();
    return <FormSkeleton />;
  }

  if (!document || isLoadingDocument || isLoadingSunat) {
    return <FormSkeleton />;
  }

  return (
    <PageWrapper>
      <TitleFormComponent title={title} mode="edit" icon={icon as any} />
      <ElectronicDocumentForm
        form={form}
        onSubmit={(data) => mutate(data)}
        isPending={isPending}
        isEdit={true}
        documentTypes={documentTypes}
        transactionTypes={transactionTypes}
        identityDocumentTypes={identityDocumentTypes}
        currencyTypes={currencyTypes}
        igvTypes={igvTypes}
        detractionTypes={detractionTypes}
        creditNoteTypes={creditNoteTypes}
        debitNoteTypes={debitNoteTypes}
        useQuotation={true}
      />
    </PageWrapper>
  );
}

// ─── Root page: dispatcher ────────────────────────────────────────────────────

export default function UpdateSalesReceiptsCajaPage() {
  const { ROUTE, ABSOLUTE_ROUTE } = ELECTRONIC_DOCUMENT_CAJA;
  const params = useParams();
  const navigate = useNavigate();
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();

  const id = parseInt(params.id as string);

  // Carga liviana: solo necesitamos work_order_id / order_quotation_id para despachar
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useElectronicDocument(id);

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (isNaN(id)) notFound();
  if (documentError) notFound();
  if (isLoadingDocument || !document) return <FormSkeleton />;

  if (document.status !== "draft") {
    errorToast("Solo se pueden editar documentos en estado Borrador");
    navigate(ABSOLUTE_ROUTE);
    return <FormSkeleton />;
  }

  const sharedProps: SubPageProps = {
    documentId: id,
    onSuccess: () => navigate(ABSOLUTE_ROUTE),
    onCancel: () => navigate(ABSOLUTE_ROUTE),
    title: currentView.descripcion,
    icon: currentView.icon,
  };

  // Despacho según entidad vinculada al documento
  if (document.work_order_id) {
    return (
      <EditWorkOrderInvoicePage
        {...sharedProps}
        workOrderId={document.work_order_id}
      />
    );
  }

  if (document.order_quotation_id) {
    return (
      <EditOrderQuotationPage
        {...sharedProps}
        orderQuotationId={document.order_quotation_id}
      />
    );
  }

  // Fallback: formulario genérico (purchase_request_quote_id u otros)
  return <EditElectronicDocumentPage {...sharedProps} />;
}
