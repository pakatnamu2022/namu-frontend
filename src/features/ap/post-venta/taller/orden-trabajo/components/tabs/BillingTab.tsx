"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Receipt } from "lucide-react";
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
      client_id: workOrder?.vehicle?.owner?.id?.toString() || "",
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
                <div className="grid grid-cols-2 text-sm">
                  <div className="flex justify-between px-4 py-2 border-r border-gray-100">
                    <span className="text-gray-600">Mano de Obra</span>
                    <span className="font-medium">
                      S/ {paymentSummary.payment_summary.labour_cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-gray-600">Repuestos</span>
                    <span className="font-medium">
                      S/ {paymentSummary.payment_summary.parts_cost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Desglose */}
                <div className="px-4 py-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>
                      S/ {paymentSummary.payment_summary.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {paymentSummary.payment_summary.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Descuento</span>
                      <span className="text-red-600">
                        - S/{" "}
                        {paymentSummary.payment_summary.discount_amount.toFixed(
                          2,
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Totales finales */}
                {(paymentSummary.payment_summary.total_advances > 0 ||
                  paymentSummary.payment_summary.remaining_balance !== 0) && (
                  <div className="px-4 py-2 space-y-1 text-sm bg-gray-50">
                    {paymentSummary.payment_summary.total_advances > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adelantos</span>
                        <span className="text-green-600">
                          - S/{" "}
                          {paymentSummary.payment_summary.total_advances.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    )}
                    {paymentSummary.payment_summary.remaining_balance !== 0 && (
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900">Saldo Pendiente</span>
                        <span className="text-gray-900">
                          S/{" "}
                          {paymentSummary.payment_summary.remaining_balance.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  Facturas Emitidas
                </h4>
                <Button onClick={handleCreateInvoice}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              </div>

              {advances.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    No hay facturas para este grupo
                  </p>
                  <p className="text-xs text-gray-500">
                    Crea la primera factura para este grupo
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {advances.map((advance) => (
                    <div
                      key={advance.id}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {advance.full_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            {advance.fecha_de_emision}
                          </p>
                        </div>
                        <Badge
                          variant={
                            advance.sunat_responsecode === "0"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            advance.sunat_responsecode === "0"
                              ? "bg-green-600"
                              : "bg-yellow-600"
                          }
                        >
                          {advance.sunat_responsecode === "0"
                            ? "Aceptado"
                            : "Pendiente"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Cliente</p>
                          <p className="text-gray-700">
                            {advance.cliente_denominacion}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-bold text-green-600">
                            S/ {Number(advance.total).toFixed(2)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Tipo de Documento</p>
                          <p className="text-gray-700">
                            {advance.document_type?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
