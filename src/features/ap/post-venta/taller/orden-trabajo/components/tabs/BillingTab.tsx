"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Plus, Receipt } from "lucide-react";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { useGetPaymentSummary } from "../../lib/workOrder.hook";
import {
  DEFAULT_GROUP_COLOR,
  GROUP_COLORS,
} from "../../lib/workOrder.interface";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import {
  invoiceSchemaCreate,
  type InvoiceSchema,
} from "../../lib/invoice.schema";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { storeElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import type { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import InvoiceForm from "../InvoiceForm";
import { errorToast, successToast } from "@/core/core.function";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

const getGroupColor = (groupNumber: number) => {
  return GROUP_COLORS[groupNumber] || DEFAULT_GROUP_COLOR;
};

interface BillingTabProps {
  workOrderId: number;
}

export default function BillingTab({ workOrderId }: BillingTabProps) {
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [showForm, setShowForm] = useState(false);

  // Obtener resumen de pago del grupo seleccionado
  const { data: paymentSummary, isLoading: isLoadingPaymentSummary } =
    useGetPaymentSummary(workOrderId, selectedGroupNumber || undefined);

  // Obtener tipos de documento (Factura, Boleta, etc.)
  const { data: documentTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.TYPE_DOCUMENT],
  });

  // Obtener tipos de moneda
  const { data: currencyTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY],
  });

  const form = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchemaCreate) as any,
    defaultValues: {
      groupNumber: 0,
      customer_id: "",
      sunat_concept_document_type_id: "",
      sunat_concept_currency_id: "1", // PEN por defecto
      fecha_de_emision: new Date().toISOString().split("T")[0],
      serie: "",
      is_advance_payment: false,
      description: "",
      amount: 0,
      taxRate: 18,
    },
  });

  // Watch para obtener el tipo de documento seleccionado
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  // Obtener series autorizadas según el tipo de documento
  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: documentTypes.find(
      (dt) => dt.id.toString() === selectedDocumentType
    )?.tribute_code,
  });

  // Filtrar tipos de documento según el tipo de documento del cliente
  const filteredDocumentTypes = documentTypes.filter((type) => {
    // if (!selectedCustomer) return true;

    // const documentTypeId = selectedCustomer.document_type_id;

    // // Si el cliente tiene RUC (810), solo mostrar Factura (id: 29)
    // if (Number(documentTypeId) === 810) {
    //   return type.id === 4;
    // }

    // // Si el cliente tiene Cédula (809), solo mostrar el tipo con id 30
    // if (Number(documentTypeId) === 809) {
    //   return type.id === 2;
    // }

    return true;
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
    mutationFn: (data: ElectronicDocumentSchema) =>
      storeElectronicDocument(data),
    onSuccess: () => {
      successToast("Factura creada exitosamente");
      setShowForm(false);
      form.reset();
      // TODO: Refrescar lista de facturas
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

    form.reset({
      groupNumber: selectedGroupNumber,
      customer_id: "",
      sunat_concept_document_type_id: "",
      sunat_concept_currency_id: "1",
      fecha_de_emision: new Date().toISOString().split("T")[0],
      serie: "",
      is_advance_payment: false,
      description: `Factura por servicios del Grupo ${selectedGroupNumber}`,
      amount: 0,
      taxRate: 18,
    });
    setShowForm(true);
  };

  const handleSubmitInvoice = (data: InvoiceSchema) => {
    const calculateTaxAmount = () => {
      return (data.amount * data.taxRate) / 100;
    };

    const calculateTotalAmount = () => {
      return data.amount + calculateTaxAmount();
    };

    // Preparar datos para el documento electrónico
    const electronicDocumentData: ElectronicDocumentSchema = {
      sunat_concept_document_type_id: "29", // Factura
      serie: "1", // Serie temporal
      sunat_concept_transaction_type_id: "1", // Venta interna
      origin_module: "posventa",
      is_advance_payment: false,
      client_id: data.customer_id,
      fecha_de_emision: new Date().toISOString().split("T")[0],
      sunat_concept_currency_id: "1", // PEN - Soles
      total_gravada: data.amount,
      total_igv: calculateTaxAmount(),
      total: calculateTotalAmount(),
      condiciones_de_pago: "CONTADO",
      medio_de_pago: "EFECTIVO",
      enviar_automaticamente_a_la_sunat: false,
      enviar_automaticamente_al_cliente: false,
      items: [
        {
          unidad_de_medida: "NIU",
          descripcion: data.description,
          cantidad: 1,
          valor_unitario: data.amount,
          precio_unitario: data.amount + calculateTaxAmount(),
          subtotal: data.amount,
          sunat_concept_igv_type_id: 10,
          igv: calculateTaxAmount(),
          total: calculateTotalAmount(),
          account_plan_id: "1",
        },
      ],
    };

    createInvoiceMutation.mutate(electronicDocumentData);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    form.reset();
  };

  if (isLoading || isLoadingPaymentSummary) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando información...</span>
      </div>
    );
  }

  // Obtener facturas de adelanto (advances) del resumen de pago
  const advances = paymentSummary?.advances || [];

  const colors = selectedGroupNumber
    ? getGroupColor(selectedGroupNumber)
    : DEFAULT_GROUP_COLOR;

  return (
    <div className="space-y-6">
      {/* Selector de grupos en la parte superior */}
      <GroupSelector
        items={items}
        selectedGroupNumber={selectedGroupNumber}
        onSelectGroup={setSelectedGroupNumber}
      />

      {/* Contenido principal */}
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Facturación de Servicios
              {selectedGroupNumber && (
                <Badge
                  className="text-white ml-2"
                  style={{ backgroundColor: colors.badge }}
                >
                  Grupo {selectedGroupNumber}
                </Badge>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona las facturas para este grupo
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total a Pagar</p>
            <p className="text-2xl font-bold text-green-600">
              S/{" "}
              {paymentSummary?.payment_summary?.total_amount?.toFixed(2) ||
                "0.00"}
            </p>
          </div>
        </div>
      </Card>

      {/* Contenido del grupo seleccionado */}
      {selectedGroupNumber ? (
        <>
          {/* Resumen de Costos */}
          {paymentSummary && (
            <Card className="overflow-hidden">
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Resumen de Costos
                </h4>
              </div>

              <div className="p-6 space-y-6">
                {/* Desglose de Costos */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Desglose
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">
                        Costo de Mano de Obra
                      </span>
                      <span className="font-semibold text-gray-900">
                        S/{" "}
                        {paymentSummary.payment_summary.labour_cost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">
                        Costo de Repuestos
                      </span>
                      <span className="font-semibold text-gray-900">
                        S/{" "}
                        {paymentSummary.payment_summary.parts_cost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cálculos */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      S/ {paymentSummary.payment_summary.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {paymentSummary.payment_summary.discount_amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Descuento</span>
                      <span className="font-medium text-red-600">
                        - S/{" "}
                        {paymentSummary.payment_summary.discount_amount.toFixed(
                          2
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">IGV (18%)</span>
                    <span className="font-medium text-gray-900">
                      S/ {paymentSummary.payment_summary.tax_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Total a Pagar */}
                <div className="pt-3 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="text-base font-bold text-gray-900">
                      Total a Pagar
                    </span>
                    <span className="text-xl font-bold text-green-700">
                      S/{" "}
                      {paymentSummary.payment_summary.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Adelantos y Saldo */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">
                      Total de Adelantos
                    </span>
                    <span className="font-semibold text-blue-700">
                      S/{" "}
                      {paymentSummary.payment_summary.total_advances.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <span className="text-base font-bold text-gray-900">
                      Saldo Restante
                    </span>
                    <span className="text-xl font-bold text-orange-600">
                      S/{" "}
                      {paymentSummary.payment_summary.remaining_balance.toFixed(
                        2
                      )}
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
              currencyTypes={currencyTypes}
              authorizedSeries={authorizedSeries}
              filteredDocumentTypes={filteredDocumentTypes}
              defaultCustomer={workOrder?.vehicle?.owner}
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
