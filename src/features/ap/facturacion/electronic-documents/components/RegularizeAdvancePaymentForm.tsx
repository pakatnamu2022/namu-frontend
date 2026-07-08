"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FileText, Link2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { FileCheck } from "lucide-react";
import { RegularizeAdvancePaymentFormValues } from "../lib/regularizeAdvancePaymentForm.types";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/series/lib/assignSalesSeries.interface";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { useAllApBank } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.hook";
import { useNextCorrelativeElectronicDocument } from "../lib/electronicDocument.hook";
import { ItemsSection } from "./sections/ItemsSection";
import {
  useOrderQuotations,
  useOrderQuotationById,
} from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.hook";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import { useGetWorkOrder, useFindWorkOrderById } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.hook";
import { WorkOrderResource } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.interface";
import { PAYMENT_CONDITIONS } from "../lib/electronicDocument.constants";

interface RegularizeAdvancePaymentFormProps {
  form: UseFormReturn<RegularizeAdvancePaymentFormValues>;
  onSubmit: (data: RegularizeAdvancePaymentFormValues) => void;
  isPending: boolean;
  documentTypes: SunatConceptsResource[];
  currencyTypes: SunatConceptsResource[];
  igvTypes: SunatConceptsResource[];
}

// Adaptador para que useGetWorkOrder cumpla la firma esperada por FormSelectAsync
function useWorkOrderQuery(params: Record<string, any>) {
  return useGetWorkOrder({ params });
}

export function RegularizeAdvancePaymentForm({
  form,
  onSubmit,
  isPending,
  documentTypes,
  currencyTypes,
  igvTypes,
}: RegularizeAdvancePaymentFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomersResource | undefined
  >(undefined);

  const originType = form.watch("origin_entity_type");
  const orderQuotationId = form.watch("order_quotation_id");
  const workOrderId = form.watch("work_order_id");
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const series = form.watch("serie");
  const medioDePago = form.watch("condiciones_de_pago");
  const items = form.watch("items") || [];

  const selectedCurrency = currencyTypes.find(
    (c) => c.id === Number(form.watch("sunat_concept_currency_id")),
  );
  const currencySymbol =
    selectedCurrency?.iso_code === "PEN"
      ? "S/"
      : selectedCurrency?.iso_code === "USD"
        ? "$"
        : "";

  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: documentTypes.find(
      (dt) => dt.id.toString() === selectedDocumentType,
    )?.tribute_code,
  });

  const { data: nextNumber } = useNextCorrelativeElectronicDocument(
    selectedDocumentType ? Number(selectedDocumentType) : 0,
    series ? Number(series) : 0,
  );

  useEffect(() => {
    const currentNumber = form.getValues("numero");
    const newNumber = nextNumber?.number || "";
    if (currentNumber !== newNumber) {
      form.setValue("numero", newNumber);
    }
  }, [nextNumber, form]);

  const { data: checkbooks = [] } = useAllApBank({
    currency_id: selectedCurrency?.currency_type,
    has_account_number: 1,
  });

  // Sincronizar origin_entity_id según cuál entidad de origen esté seleccionada
  useEffect(() => {
    if (originType === "ApOrderQuotations" && orderQuotationId) {
      form.setValue("origin_entity_id", orderQuotationId);
    } else if (originType === "ApWorkOrder" && workOrderId) {
      form.setValue("origin_entity_id", workOrderId);
    } else if (!orderQuotationId && !workOrderId) {
      form.setValue("origin_entity_id", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originType, orderQuotationId, workOrderId]);

  const handleOriginTypeChange = (value: string) => {
    form.setValue(
      "origin_entity_type",
      value as "ApOrderQuotations" | "ApWorkOrder" | "",
    );
    form.setValue("order_quotation_id", "");
    form.setValue("work_order_id", "");
    form.setValue("origin_entity_id", undefined);
  };

  // Calcular totales a partir de los items
  const calcularTotales = () => {
    let total_gravada = 0;
    let total_inafecta = 0;
    let total_exonerada = 0;
    let total_igv = 0;

    items.forEach((item) => {
      const igvType = igvTypes.find(
        (t) => t.id === item.sunat_concept_igv_type_id,
      );
      if (igvType?.code_nubefact === "1") {
        total_gravada += item.subtotal;
        total_igv += item.igv;
      } else if (igvType?.code_nubefact === "20") {
        total_exonerada += item.subtotal;
      } else if (igvType?.code_nubefact === "30") {
        total_inafecta += item.subtotal;
      }
    });

    const round2 = (n: number) => Math.round(n * 100) / 100;
    const total = round2(total_gravada + total_inafecta + total_exonerada + total_igv);
    return {
      total_gravada: round2(total_gravada),
      total_inafecta: round2(total_inafecta),
      total_exonerada: round2(total_exonerada),
      total_igv: round2(total_igv),
      total,
    };
  };

  const totales = calcularTotales();

  useEffect(() => {
    const current = form.getValues();
    if (
      current.total_gravada !== totales.total_gravada ||
      current.total_inafecta !== totales.total_inafecta ||
      current.total_exonerada !== totales.total_exonerada ||
      current.total_igv !== totales.total_igv ||
      current.total !== totales.total
    ) {
      form.setValue("total_gravada", totales.total_gravada);
      form.setValue("total_inafecta", totales.total_inafecta);
      form.setValue("total_exonerada", totales.total_exonerada);
      form.setValue("total_igv", totales.total_igv);
      form.setValue("total", totales.total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Origen: Cotización de Orden u Orden de Trabajo */}
            <GroupFormSection
              title="Asociar Origen (Opcional)"
              icon={Link2}
              color="secondary"
              cols={{ sm: 1, md: 2 }}
            >
              <FormSelect
                control={form.control}
                name="origin_entity_type"
                options={[
                  { value: "ApOrderQuotations", label: "Cotización de Orden" },
                  { value: "ApWorkOrder", label: "Orden de Trabajo" },
                ]}
                label="Tipo de Origen"
                description="Seleccione a qué se asociará este anticipo"
                placeholder="Sin asociar"
                onValueChange={handleOriginTypeChange}
              />

              {originType === "ApOrderQuotations" && (
                <FormSelectAsync
                  name="order_quotation_id"
                  label="Cotización de Orden"
                  placeholder="Buscar cotización"
                  control={form.control}
                  useQueryHook={useOrderQuotations}
                  mapOptionFn={(quotation: OrderQuotationResource) => ({
                    value: quotation.id.toString(),
                    label: `COT-${quotation.quotation_number} - ${quotation.client?.full_name || "Sin cliente"}`,
                  })}
                  useFindByIdHook={useOrderQuotationById}
                  description="Cotización a la que se asociará el anticipo"
                  onValueChange={(_, quotation) => {
                    const q = quotation as OrderQuotationResource | undefined;
                    if (q?.client) {
                      setSelectedCustomer(q.client);
                      form.setValue("client_id", q.client.id.toString());
                    }
                  }}
                />
              )}

              {originType === "ApWorkOrder" && (
                <FormSelectAsync
                  name="work_order_id"
                  label="Orden de Trabajo"
                  placeholder="Buscar orden de trabajo"
                  control={form.control}
                  useQueryHook={useWorkOrderQuery}
                  mapOptionFn={(workOrder: WorkOrderResource) => ({
                    value: workOrder.id.toString(),
                    label: `OT-${workOrder.correlative} - ${workOrder.invoice_to_client?.full_name || "Sin cliente"}`,
                  })}
                  useFindByIdHook={useFindWorkOrderById}
                  description="Orden de trabajo a la que se asociará el anticipo"
                  onValueChange={(_, workOrder) => {
                    const wo = workOrder as WorkOrderResource | undefined;
                    if (wo?.invoice_to_client) {
                      setSelectedCustomer(wo.invoice_to_client);
                      form.setValue(
                        "client_id",
                        wo.invoice_to_client.id.toString(),
                      );
                    }
                  }}
                />
              )}
            </GroupFormSection>

            {/* Información del Documento */}
            <GroupFormSection
              title="Información del Documento"
              icon={FileText}
              color="primary"
              cols={{ sm: 1, md: 3 }}
            >
              <div className="md:col-span-3">
                <FormSelectAsync
                  name="client_id"
                  label="Cliente *"
                  placeholder="Seleccionar cliente"
                  control={form.control}
                  useQueryHook={useCustomers}
                  mapOptionFn={(customer) => ({
                    value: customer.id.toString(),
                    label: `${customer.full_name} - ${customer.num_doc || "S/N"}`,
                  })}
                  description="Seleccione el cliente"
                  useFindByIdHook={useCustomersById}
                  onValueChange={(_, customer) => {
                    setSelectedCustomer(
                      customer as CustomersResource | undefined,
                    );
                  }}
                />
              </div>

              <FormSelect
                control={form.control}
                name="sunat_concept_document_type_id"
                options={documentTypes.map((type) => ({
                  value: type.id.toString(),
                  label: type.description,
                }))}
                label="Tipo de Comprobante *"
                description="Seleccione el tipo de comprobante electrónico"
                placeholder="Seleccionar tipo de comprobante"
              />

              <FormSelect
                control={form.control}
                name="sunat_concept_currency_id"
                options={currencyTypes.map((type) => ({
                  value: type.id.toString(),
                  label: type.description,
                }))}
                label="Moneda *"
                description="Seleccione la moneda del documento"
                placeholder="Seleccionar moneda"
              />

              <DatePickerFormField
                control={form.control}
                name="fecha_de_emision"
                label="Fecha de Emisión *"
                placeholder="Seleccione fecha"
                description="Seleccione la fecha de emisión del documento"
                disabledRange={{
                  before: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1,
                  ),
                  after: new Date(),
                }}
              />

              <FormSelect
                control={form.control}
                name="serie"
                options={authorizedSeries.map(
                  (series: AssignSalesSeriesResource) => ({
                    value: series.id.toString(),
                    label: `${series.series} - ${series.sede || ""}`,
                  }),
                )}
                label="Serie *"
                description="Series autorizadas para su usuario"
                placeholder="Seleccionar serie"
              />

              <FormInput
                control={form.control}
                name="numero"
                label="Número"
                type="number"
                placeholder="Auto-generado"
                readOnly
                optional
                description="Se genera automáticamente"
              />
            </GroupFormSection>

            {/* Items */}
            <ItemsSection
              form={form as any}
              igvTypes={igvTypes}
              currencySymbol={currencySymbol}
              porcentaje_de_igv={selectedCustomer?.tax_class_type_igv || 18}
              isAdvancePayment={false}
              isFromQuotation={false}
              useQuotation={false}
              isDetraction={false}
            />

            {/* Configuración adicional (subset) */}
            <GroupFormSection
              title="Configuración Adicional"
              icon={FileCheck}
              color="primary"
              cols={{ sm: 1, md: 3 }}
            >
              <FormSelect
                control={form.control}
                label="Medio de Pago"
                name="condiciones_de_pago"
                options={PAYMENT_CONDITIONS.filter(
                  (o) => o.value !== "credito",
                ).map((o) => ({ label: o.label, value: o.label }))}
                placeholder="Seleccione una opción"
                description="Medio de pago utilizado en el documento."
              />

              <FormSelect
                control={form.control}
                label="Chequera"
                name="bank_id"
                options={checkbooks.map((checkbook) => ({
                  label: checkbook.code,
                  value: String(checkbook.id),
                  description: checkbook.account_number,
                }))}
                placeholder="Seleccione una opción"
                description="Chequera asociada al medio de pago."
              />

              {medioDePago && medioDePago !== "EFECTIVO" && (
                <FormInput
                  control={form.control}
                  name="operation_number"
                  label="Número de Operación"
                  placeholder="Número de Operación"
                  description="Número de operación asociada al pago."
                />
              )}

              <FormInput
                control={form.control}
                name="orden_compra_servicio"
                label="Orden de compra/servicio"
                placeholder="Orden de compra o servicio..."
                description="Número de orden de compra o servicio relacionado (opcional)."
                maxLength={20}
              />

              <div className="col-span-full">
                <FormTextArea
                  control={form.control}
                  name="observaciones"
                  label="Observaciones"
                  placeholder="Observaciones adicionales..."
                  description="Información adicional que se mostrará en el documento."
                />
              </div>
            </GroupFormSection>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1 lg:row-start-1 lg:col-start-3">
            <div className="h-fit sticky top-6 rounded-lg border bg-linear-to-br from-primary/5 via-background to-muted/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileCheck className="size-5 text-primary" />
                  Resumen
                </h3>
              </div>

              <p className="text-xs text-muted-foreground">
                {series
                  ? authorizedSeries.find((s) => s.id === Number(series))
                      ?.series
                  : "****"}
                -{form.watch("numero") || "########"}
              </p>

              <div className="space-y-3 border pt-2 rounded-lg">
                {totales.total_gravada > 0 && (
                  <div className="flex justify-between items-center text-sm px-2">
                    <span className="text-muted-foreground font-mono uppercase">
                      Op. Gravada
                    </span>
                    <span className="font-medium">
                      {currencySymbol}{" "}
                      {totales.total_gravada.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm px-2">
                  <span className="text-muted-foreground font-mono uppercase">
                    IGV
                  </span>
                  <span className="font-medium">
                    {currencySymbol}{" "}
                    {totales.total_igv.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-b-lg">
                  <span className="text-base font-semibold font-mono uppercase text-blue-600 dark:text-blue-400">
                    Total
                  </span>
                  <span className="text-2xl font-medium text-blue-600 dark:text-blue-400">
                    {currencySymbol}
                    {totales.total.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 flex flex-col gap-2">
                <ConfirmationDialog
                  trigger={
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Cancelar
                    </Button>
                  }
                  title="¿Cancelar?"
                  description="Se perderán todos los datos ingresados. ¿Estás seguro de que deseas cancelar?"
                  confirmText="Sí, cancelar"
                  cancelText="No, continuar"
                  icon="warning"
                  onConfirm={() => window.history.back()}
                />

                <ConfirmationDialog
                  trigger={
                    <Button
                      type="button"
                      className="w-full"
                      size="lg"
                      disabled={isPending || !form.formState.isValid}
                    >
                      <FileCheck className="size-4 mr-2" />
                      {isPending ? "Guardando..." : "Regularizar Anticipo"}
                    </Button>
                  }
                  title="¿Regularizar anticipo?"
                  description="Este documento se registrará como aceptado por SUNAT de forma referencial, sin enviarse a Nubefact. ¿Deseas continuar?"
                  confirmText="Sí, regularizar"
                  cancelText="No, revisar"
                  icon="info"
                  onConfirm={form.handleSubmit(onSubmit)}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
