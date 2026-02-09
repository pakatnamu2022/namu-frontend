"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Plus, Receipt, AlertCircle } from "lucide-react";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { useGetPaymentSummary } from "../../lib/workOrder.hook";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import {
  ElectronicDocumentSchema,
  ElectronicDocumentSchema as ElectronicDocumentSchemaType,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { useNextCorrelativeElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { useAllApBank } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.hook";
import { storeElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import InvoiceForm from "../InvoiceForm";
import { errorToast, successToast } from "@/core/core.function";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { WORKER_ORDER } from "../../lib/workOrder.constants";

interface BillingTabProps {
  workOrderId: number;
}

export default function BillingTab({ workOrderId }: BillingTabProps) {
  const queryClient = useQueryClient();
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [showForm, setShowForm] = useState(false);
  const { QUERY_KEY } = WORKER_ORDER;

  // Obtener resumen de pago del grupo seleccionado
  const { data: paymentSummary, isLoading: isLoadingPaymentSummary } =
    useGetPaymentSummary(workOrderId, selectedGroupNumber || undefined);

  // Obtener todos los conceptos SUNAT necesarios en una sola consulta
  const { data: sunatConcepts = [] } = useAllSunatConcepts({
    type: [
      SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
      SUNAT_CONCEPTS_TYPE.BILLING_TRANSACTION_TYPE,
      SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY,
      SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE,
    ],
  });

  // Filtrar los conceptos por tipo
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

  const form = useForm<ElectronicDocumentSchemaType>({
    resolver: zodResolver(ElectronicDocumentSchema) as any,
    defaultValues: {
      sunat_concept_document_type_id: "",
      serie: "",
      sunat_concept_transaction_type_id: "",
      origin_module: "posventa",
      is_advance_payment: false,
      client_id: "",
      fecha_de_emision: new Date().toISOString().split("T")[0],
      sunat_concept_currency_id: "",
      total_gravada: 0,
      total_inafecta: 0,
      total_exonerada: 0,
      total_igv: 0,
      total_gratuita: 0,
      total_anticipo: 0,
      total: 0,
      condiciones_de_pago: "CONTADO",
      medio_de_pago: "EFECTIVO",
      enviar_automaticamente_a_la_sunat: false,
      enviar_automaticamente_al_cliente: false,
      items: [],
    },
  });

  // Watch para obtener el tipo de documento seleccionado
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const selectedSeriesId = form.watch("serie");
  const selectedCurrencyId = form.watch("sunat_concept_currency_id");

  // Obtener series autorizadas según el tipo de documento
  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: documentTypes.find(
      (dt) => dt.id.toString() === selectedDocumentType,
    )?.tribute_code,
  });

  const selectedSeries = authorizedSeries.find(
    (s) => s.id.toString() === selectedSeriesId,
  );

  const selectedCurrency = currencyTypes.find(
    (c) => c.id === Number(selectedCurrencyId),
  );

  // Solo consultar el siguiente correlativo cuando hay tipo de documento y serie
  const { data: nextNumber } = useNextCorrelativeElectronicDocument(
    selectedDocumentType ? Number(selectedDocumentType) : 0,
    selectedSeriesId ? Number(selectedSeriesId) : 0,
  );

  // Actualizar número de correlativo
  useEffect(() => {
    const newNumber = nextNumber?.number || "";
    if (newNumber && form.getValues("numero") !== newNumber) {
      form.setValue("numero", newNumber, { shouldValidate: false });
    }
  }, [nextNumber?.number, form]);

  // Obtener chequeras según moneda y sede
  const { data: checkbooks = [] } = useAllApBank({
    currency_id: selectedCurrency?.currency_type,
    sede_id: selectedSeries?.sede_id,
  });

  // Consultar la orden de trabajo con sus items
  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
  });

  const items = useMemo(() => workOrder?.items || [], [workOrder?.items]);

  // Auto-seleccionar el primer grupo si no hay ninguno seleccionado
  useEffect(() => {
    if (items.length > 0 && selectedGroupNumber === null) {
      const firstGroup = Math.min(...items.map((i) => i.group_number));
      setSelectedGroupNumber(firstGroup);
    }
  }, [items, selectedGroupNumber, setSelectedGroupNumber]);

  // Mutación para crear documento electrónico
  const createInvoiceMutation = useMutation({
    mutationFn: (data: ElectronicDocumentSchemaType) =>
      storeElectronicDocument(data),
    onSuccess: () => {
      successToast("Factura creada exitosamente");
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, workOrderId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEY,
          "payment-summary",
          workOrderId,
          selectedGroupNumber,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["workOrder", workOrderId],
      });
      setShowForm(false);
      form.reset();
    },
    onError: (error: any) => {
      errorToast(error?.message || "Error al crear la factura");
    },
  });

  const handleCreateInvoice = () => {
    if (!selectedGroupNumber) {
      errorToast("Selecciona un grupo primero");
      return;
    }

    // Setear moneda por defecto (PEN)
    const penCurrency = currencyTypes.find((c) => c.iso_code === "PEN");

    form.reset({
      sunat_concept_document_type_id: "",
      serie: "",
      sunat_concept_transaction_type_id: "",
      origin_module: "posventa",
      is_advance_payment: false,
      client_id: workOrder?.invoice_to_client?.id?.toString() || "",
      fecha_de_emision: new Date().toISOString().split("T")[0],
      sunat_concept_currency_id: penCurrency?.id.toString() || "",
      total_gravada: 0,
      total_inafecta: 0,
      total_exonerada: 0,
      total_igv: 0,
      total_gratuita: 0,
      total_anticipo: 0,
      total: 0,
      condiciones_de_pago: "CONTADO",
      medio_de_pago: "EFECTIVO",
      enviar_automaticamente_a_la_sunat: false,
      enviar_automaticamente_al_cliente: false,
      items: [],
    });
    setShowForm(true);
  };

  const handleSubmitInvoice = (data: ElectronicDocumentSchemaType) => {
    createInvoiceMutation.mutate({
      ...data,
      work_order_id: String(workOrderId),
    });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    form.reset();
  };

  if (isLoading || isLoadingPaymentSummary) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </Card>
    );
  }

  // Obtener facturas de adelanto (advances) del resumen de pago
  const advances = workOrder?.advances || [];

  // Calcular si ya se pagó el monto total
  const totalInvoiced = advances.reduce(
    (sum, advance) => sum + Number(advance.total),
    0,
  );
  const totalAmount = paymentSummary?.payment_summary.total_amount || 0;
  const isFullyPaid = totalAmount > 0 && totalInvoiced >= totalAmount;

  return (
    <div className="space-y-6">
      {/* Selector de grupos en la parte superior */}
      <GroupSelector
        items={items}
        selectedGroupNumber={selectedGroupNumber}
        onSelectGroup={setSelectedGroupNumber}
      />

      {/* Contenido del grupo seleccionado */}
      {selectedGroupNumber ? (
        <>
          {/* Bloqueo si no hay cliente asignado para facturar */}
          {!workOrder?.invoice_to_client && (
            <Card className="p-4 border border-amber-300 bg-amber-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    No se puede facturar esta orden de trabajo
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    No se ha asignado un cliente para facturar. Asigne un
                    cliente en la sección de apertura de la orden de trabajo y
                    vuelva a intentar.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Resumen de Costos - Diseño compacto tipo tabla */}
          {paymentSummary && (
            <Card className="p-2">
              {/* Header con título y total */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  <span className="font-medium text-gray-900">
                    Resumen de Costos
                  </span>
                  {selectedGroupNumber && (
                    <Badge variant="outline" className="ml-2">
                      Grupo {selectedGroupNumber}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">
                    S/ {paymentSummary.payment_summary.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Contenido en formato de tabla simple */}
              <div className="divide-y divide-gray-100">
                {/* Costos principales */}
                <div className="text-sm">
                  <div className="flex justify-between px-4 py-1.5">
                    <span className="text-gray-600">Mano de Obra</span>
                    <span className="font-medium">
                      S/ {paymentSummary.payment_summary.labour_cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-1.5">
                    <span className="text-gray-600">Repuestos</span>
                    <span className="font-medium">
                      S/ {paymentSummary.payment_summary.parts_cost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Subtotal, Descuento, IGV */}
                <div className="text-sm">
                  <div className="flex justify-between px-4 py-1.5">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      S/ {paymentSummary.payment_summary.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {paymentSummary.payment_summary.discount_amount > 0 && (
                    <div className="flex justify-between px-4 py-1.5">
                      <span className="text-green-700">Descuento</span>
                      <span className="font-medium text-green-700">
                        - S/{" "}
                        {paymentSummary.payment_summary.discount_amount.toFixed(
                          2,
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-1.5">
                    <span className="text-gray-600">IGV (18%)</span>
                    <span className="font-medium">
                      S/ {paymentSummary.payment_summary.tax_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Formulario para crear factura */}
          {showForm ? (
            <InvoiceForm
              form={form}
              onSubmit={handleSubmitInvoice}
              onCancel={handleCancelForm}
              isPending={createInvoiceMutation.isPending}
              selectedGroupNumber={selectedGroupNumber}
              documentTypes={documentTypes}
              transactionTypes={transactionTypes}
              currencyTypes={currencyTypes}
              igvTypes={igvTypes}
              authorizedSeries={authorizedSeries}
              checkbooks={checkbooks}
              workOrder={workOrder!}
            />
          ) : (
            /* Facturas del grupo */
            <Card className="p-4">
              {/* Resumen compacto con progreso */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-900">
                      Facturas Emitidas
                    </h4>
                    {advances.length > 0 && (
                      <Badge variant="outline" className="bg-primary/5">
                        {advances.length}
                      </Badge>
                    )}
                  </div>
                  {!isFullyPaid && (
                    <Button
                      onClick={handleCreateInvoice}
                      size="sm"
                      disabled={!workOrder?.invoice_to_client}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Factura
                    </Button>
                  )}
                </div>

                {advances.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      No hay facturas para este grupo
                    </p>
                    <p className="text-xs text-gray-500">
                      Crea la primera factura haciendo clic en "Nueva Factura"
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Barra de Progreso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Progreso de Facturación
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {paymentSummary
                            ? (
                                (advances.reduce(
                                  (sum, advance) => sum + Number(advance.total),
                                  0,
                                ) /
                                  paymentSummary.payment_summary.total_amount) *
                                100
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          paymentSummary
                            ? (advances.reduce(
                                (sum, advance) => sum + Number(advance.total),
                                0,
                              ) /
                                paymentSummary.payment_summary.total_amount) *
                              100
                            : 0
                        }
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          S/{" "}
                          {advances
                            .reduce(
                              (sum, advance) => sum + Number(advance.total),
                              0,
                            )
                            .toFixed(2)}
                        </span>
                        <span>
                          S/{" "}
                          {paymentSummary
                            ? paymentSummary.payment_summary.total_amount.toFixed(
                                2,
                              )
                            : "0.00"}
                        </span>
                      </div>
                    </div>

                    {/* Lista de facturas - Más compacta */}
                    <div className="space-y-2">
                      {advances.map((advance) => (
                        <div
                          key={advance.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 text-sm">
                                  {advance.full_number}
                                </p>
                                <Badge
                                  variant="default"
                                  color={
                                    advance.sunat_responsecode === "0"
                                      ? "green"
                                      : "default"
                                  }
                                >
                                  {advance.sunat_responsecode === "0"
                                    ? "Aceptado"
                                    : "Pendiente"}
                                </Badge>
                                {advance.is_advance_payment && (
                                  <Badge variant="default" color="secondary">
                                    Anticipo
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-gray-600">
                                  {advance.fecha_de_emision}
                                </p>
                                <span className="text-xs text-gray-400">•</span>
                                <p className="text-xs text-gray-600">
                                  {advance.document_type?.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              S/ {Number(advance.total).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Receipt className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Selecciona un grupo
            </h3>
            <p className="text-gray-500">
              Elige un grupo de la izquierda para gestionar sus facturas
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
