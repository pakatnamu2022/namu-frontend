"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Receipt, AlertCircle } from "lucide-react";
import {
  ElectronicDocumentSchema,
  type ElectronicDocumentSchema as ElectronicDocumentSchemaType,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { storeElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { AREA_MESON } from "@/features/ap/ap-master/lib/apMaster.constants";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import { OrderQuotationBillingForm } from "./OrderQuotationBillingForm";
import InvoiceList from "@/features/ap/facturacion/electronic-documents/components/InvoiceList.tsx";
import type { WorkOrderDocumentsTreeResource } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.interface";

interface OrderQuotationBillingContentProps {
  quotation: OrderQuotationResource;
  quotationId: number;
}

export default function OrderQuotationBillingContent({
  quotation,
  quotationId,
}: OrderQuotationBillingContentProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const currencySymbol = quotation.type_currency?.symbol || "S/";
  const vouchers =
    quotation.vouchers as unknown as WorkOrderDocumentsTreeResource;

  const form = useForm<ElectronicDocumentSchemaType>({
    resolver: zodResolver(ElectronicDocumentSchema) as any,
    defaultValues: {
      area_id: AREA_MESON.toString(),
      origin_entity_type: "order_quotation",
      origin_entity_id: quotationId.toString(),
      sunat_concept_document_type_id: "",
      serie: "",
      numero: "",
      sunat_concept_transaction_type_id: "",
      client_id: quotation.invoice_to_client?.id?.toString() || "",
      fecha_de_emision: new Date().toISOString().split("T")[0],
      sunat_concept_currency_id: "",
      tipo_de_cambio: 1,
      total: 0,
      total_gravada: 0,
      total_inafecta: 0,
      total_exonerada: 0,
      total_igv: 0,
      total_gratuita: 0,
      total_anticipo: 0,
      items: [],
      condiciones_de_pago: "",
      medio_de_pago: "",
      enviar_automaticamente_a_la_sunat: false,
      enviar_automaticamente_al_cliente: false,
      is_advance_payment: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: storeElectronicDocument,
    onSuccess: () => {
      successToast("Factura creada exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["orderQuotation", quotationId],
      });
      setShowForm(false);
      form.reset();
      navigate("/ap/post-venta/caja/comprobante-venta-caja");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Error al crear la factura";
      errorToast(msg);
    },
  });

  const onSubmit = (data: ElectronicDocumentSchemaType) => {
    const saldoPendiente =
      quotation.payment_summary?.remaining_balance ??
      quotation.total_amount ??
      0;

    if (data.is_advance_payment && data.total === 0) {
      errorToast("No se puede crear un anticipo con monto S/ 0.00");
      return;
    }

    if (data.is_advance_payment && data.total > saldoPendiente) {
      errorToast(
        `El anticipo no puede exceder el saldo pendiente de ${currencySymbol} ${saldoPendiente.toFixed(2)}`,
      );
      return;
    }

    let fechaFormateada = data.fecha_de_emision;
    const fechaValue = data.fecha_de_emision as any;
    if (fechaValue instanceof Date) {
      fechaFormateada = fechaValue.toISOString().split("T")[0];
    } else if (typeof fechaValue === "string") {
      const fecha = new Date(fechaValue);
      if (!isNaN(fecha.getTime())) {
        fechaFormateada = fecha.toISOString().split("T")[0];
      }
    }

    mutate({ ...data, fecha_de_emision: fechaFormateada });
  };

  const handleCreateInvoice = () => {
    form.reset({
      area_id: AREA_MESON.toString(),
      origin_entity_type: "order_quotation",
      origin_entity_id: quotationId.toString(),
      sunat_concept_document_type_id: "",
      serie: "",
      numero: "",
      sunat_concept_transaction_type_id: "",
      client_id: quotation.invoice_to_client?.id?.toString() || "",
      fecha_de_emision: new Date().toISOString().split("T")[0],
      sunat_concept_currency_id: "",
      tipo_de_cambio: 1,
      total: 0,
      total_gravada: 0,
      total_inafecta: 0,
      total_exonerada: 0,
      total_igv: 0,
      total_gratuita: 0,
      total_anticipo: 0,
      items: [],
      condiciones_de_pago: "",
      medio_de_pago: "",
      enviar_automaticamente_a_la_sunat: false,
      enviar_automaticamente_al_cliente: false,
      is_advance_payment: false,
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    form.reset();
  };

  const subtotal = quotation.subtotal ?? 0;
  const discountAmount = quotation.discount_amount ?? 0;
  const taxAmount = quotation.tax_amount ?? 0;
  const totalAmount = quotation.total_amount ?? 0;

  return (
    <div className="space-y-6">
      {/* Bloqueo si no hay cliente asignado */}
      {!quotation.invoice_to_client && (
        <Card className="p-4 border border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                No se puede facturar esta cotización
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                No se ha asignado un cliente para facturar. Asigne un cliente en
                el detalle de la cotización y vuelva a intentar.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Resumen de Costos */}
      <Card className="p-2">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span className="font-medium text-gray-900">Resumen de Costos</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">
              {currencySymbol} {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="text-sm">
            <div className="flex justify-between px-4 py-1.5">
              <span className="text-gray-600">Repuestos</span>
              <span className="font-medium">
                {currencySymbol} {subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="text-sm">
            <div className="flex justify-between px-4 py-1.5">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {currencySymbol} {subtotal.toFixed(2)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between px-4 py-1.5">
                <span className="text-green-700">Descuento</span>
                <span className="font-medium text-green-700">
                  - {currencySymbol} {discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between px-4 py-1.5">
              <span className="text-gray-600">IGV (18%)</span>
              <span className="font-medium">
                {currencySymbol} {taxAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulario o lista de facturas */}
      {showForm ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleCancelForm}>
              Cancelar
            </Button>
          </div>
          <OrderQuotationBillingForm
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            quotation={quotation}
          />
        </div>
      ) : (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-gray-900">
                  Facturas Emitidas
                </h4>
                {vouchers && vouchers.active.length > 0 && (
                  <Badge variant="outline" className="bg-primary/5">
                    {vouchers.active.length}
                  </Badge>
                )}
              </div>
              {!quotation.payment_summary?.is_fully_paid && (
                <Button
                  onClick={handleCreateInvoice}
                  size="sm"
                  disabled={!quotation.invoice_to_client}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              )}
            </div>

            <InvoiceList
              vouchers={vouchers ?? { active: [], cancelled: [] }}
              currencySymbol={currencySymbol}
              totalAmount={totalAmount}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
