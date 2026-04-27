"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { useWorkOrdersByIds } from "../../lib/workOrder.hook";
import {
  ElectronicDocumentSchema,
  ElectronicDocumentSchema as ElectronicDocumentSchemaType,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { useNextCorrelativeElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { useAllApBank } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.hook";
import { storeConsolidatedInvoice } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import DirectInvoiceForm from "../DirectInvoiceForm";
import { errorToast, successToast } from "@/core/core.function";
import {
  SUNAT_CONCEPTS_TYPE,
  SUNAT_TRANSACTIONS_ID,
} from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { WORKER_ORDER } from "../../lib/workOrder.constants";
import { AREA_TALLER } from "@/features/ap/ap-master/lib/apMaster.constants";

interface DirectBillingTabProps {
  workOrderIds: number[];
}

export default function DirectBillingTab({
  workOrderIds,
}: DirectBillingTabProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { QUERY_KEY } = WORKER_ORDER;

  const {
    data: workOrders = [],
    isLoading,
    isError,
  } = useWorkOrdersByIds(workOrderIds);

  useEffect(() => {
    if (isError) {
      errorToast("Todas las órdenes deben tener la misma moneda");
      navigate(-1);
    }
  }, [isError, navigate]);

  // Detecta el tipo de planificación predominante de las OTs cargadas
  const typePlanningId = useMemo(() => {
    if (workOrders.length === 0) return undefined;
    const id = workOrders[0]?.items?.[0]?.type_planning?.id;
    return id ? Number(id) : undefined;
  }, [workOrders]);

  const { data: sunatConcepts = [] } = useAllSunatConcepts({
    type: [
      SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
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

  const form = useForm<ElectronicDocumentSchemaType>({
    resolver: zodResolver(ElectronicDocumentSchema) as any,
    defaultValues: {
      sunat_concept_document_type_id: "",
      serie: "",
      sunat_concept_transaction_type_id:
        SUNAT_TRANSACTIONS_ID.VENTA_INTERNA.toString(),
      area_id: AREA_TALLER.toString(),
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

  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const selectedSeriesId = form.watch("serie");
  const selectedCurrencyId = form.watch("sunat_concept_currency_id");

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

  const { data: nextNumber } = useNextCorrelativeElectronicDocument(
    selectedDocumentType ? Number(selectedDocumentType) : 0,
    selectedSeriesId ? Number(selectedSeriesId) : 0,
  );

  useEffect(() => {
    const newNumber = nextNumber?.number || "";
    if (newNumber && form.getValues("numero") !== newNumber) {
      form.setValue("numero", newNumber, { shouldValidate: false });
    }
  }, [nextNumber?.number, form]);

  const { data: checkbooks = [] } = useAllApBank({
    currency_id: selectedCurrency?.currency_type,
    sede_id: selectedSeries?.sede_id,
  });

  // Pre-cargar moneda PEN
  useEffect(() => {
    if (
      currencyTypes.length > 0 &&
      !form.getValues("sunat_concept_currency_id")
    ) {
      const penCurrency = currencyTypes.find((c) => c.iso_code === "PEN");
      if (penCurrency) {
        form.setValue("sunat_concept_currency_id", penCurrency.id.toString());
      }
    }
  }, [currencyTypes, form]);

  // Pre-cargar client_id desde la primera OT cargada
  useEffect(() => {
    const firstClient = workOrders[0]?.invoice_to_client?.id;
    if (firstClient && !form.getValues("client_id")) {
      form.setValue("client_id", firstClient.toString());
    }
  }, [workOrders, form]);

  const createInvoiceMutation = useMutation({
    mutationFn: (data: ElectronicDocumentSchemaType) => {
      const internal_note_ids = workOrders
        .map((wo) => wo.internal_note?.id)
        .filter((id): id is number => id !== undefined);
      return storeConsolidatedInvoice(data, internal_note_ids);
    },
    onSuccess: () => {
      successToast("Factura creada exitosamente");
      workOrderIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
        queryClient.invalidateQueries({ queryKey: ["workOrder", id] });
      });
      form.reset();
      navigate("/ap/post-venta/caja/comprobante-venta-caja");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al crear la factura";
      errorToast(errorMessage);
    },
  });

  const handleSubmit = (data: ElectronicDocumentSchemaType) => {
    createInvoiceMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
  };

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </Card>
    );
  }

  // Resumen de costos combinado de todas las OTs
  const totalFinalAmount = workOrders.reduce(
    (sum, wo) => sum + Number(wo.final_amount || 0),
    0,
  );
  const totalLaborCost = workOrders.reduce(
    (sum, wo) => sum + Number(wo.total_labor_cost || 0),
    0,
  );
  const totalPartsCost = workOrders.reduce(
    (sum, wo) => sum + Number(wo.total_parts_cost || 0),
    0,
  );
  const totalSubtotal = workOrders.reduce(
    (sum, wo) => sum + Number(wo.subtotal || 0),
    0,
  );
  const totalTax = workOrders.reduce(
    (sum, wo) => sum + Number(wo.tax_amount || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Resumen de Costos combinado */}
      {workOrders.length > 0 && (
        <Card className="p-2">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <span className="font-medium text-gray-900">
                Resumen de Costos
              </span>
              {workOrders.length > 1 && (
                <span className="text-xs text-gray-500">
                  ({workOrders.length} órdenes)
                </span>
              )}
            </div>
            <span className="text-2xl font-bold text-primary">
              {workOrders[0]?.type_currency?.symbol || "S/"}{" "}
              {totalFinalAmount.toFixed(2)}
            </span>
          </div>

          <div className="divide-y divide-gray-100 text-sm">
            <div>
              <div className="flex justify-between px-4 py-1.5">
                <span className="text-gray-600">Mano de Obra</span>
                <span className="font-medium">
                  {workOrders[0]?.type_currency?.symbol || "S/"}{" "}
                  {totalLaborCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-1.5">
                <span className="text-gray-600">Repuestos</span>
                <span className="font-medium">
                  {workOrders[0]?.type_currency?.symbol || "S/"}{" "}
                  {totalPartsCost.toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between px-4 py-1.5">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {workOrders[0]?.type_currency?.symbol || "S/"}{" "}
                  {totalSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-1.5">
                <span className="text-gray-600">IGV (18%)</span>
                <span className="font-medium">
                  {workOrders[0]?.type_currency?.symbol || "S/"}{" "}
                  {totalTax.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Formulario único para todas las OTs */}
      <DirectInvoiceForm
        form={form}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isPending={createInvoiceMutation.isPending}
        workOrders={workOrders}
        documentTypes={documentTypes}
        currencyTypes={currencyTypes}
        igvTypes={igvTypes}
        authorizedSeries={authorizedSeries}
        checkbooks={checkbooks}
        typePlanningId={typePlanningId}
      />
    </div>
  );
}
