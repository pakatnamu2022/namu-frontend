"use client";

import { useEffect, useMemo, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {
  ElectronicDocumentSchema,
  ElectronicDocumentItemSchema,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import {
  DEFAULT_IGV_PERCENTAGE,
  NUBEFACT_CODES,
  QUOTATION_ACCOUNT_PLAN_IDS,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { AdditionalConfigSection } from "@/features/ap/facturacion/electronic-documents/components/sections/AdditionalConfigSection";
import { ItemsSection } from "@/features/ap/facturacion/electronic-documents/components/sections/ItemsSection";
import { FileCheck, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCustomersById } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { InvoiceDocumentInfoSection } from "./InvoiceDocumentInfoSection";

interface DirectInvoiceFormProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  onSubmit: (data: ElectronicDocumentSchema) => void;
  onCancel: () => void;
  isPending: boolean;
  workOrders: WorkOrderResource[];
  documentTypes: SunatConceptsResource[];
  currencyTypes: SunatConceptsResource[];
  igvTypes: SunatConceptsResource[];
  authorizedSeries: AssignSalesSeriesResource[];
  checkbooks: ApBankResource[];
}

export default function DirectInvoiceForm({
  form,
  onSubmit,
  onCancel,
  isPending,
  workOrders,
  documentTypes,
  currencyTypes,
  igvTypes,
  authorizedSeries,
  checkbooks,
}: DirectInvoiceFormProps) {
  const defaultCustomer = workOrders[0]?.invoice_to_client ?? null;
  const porcentaje_de_igv =
    defaultCustomer?.tax_class_type_igv ?? DEFAULT_IGV_PERCENTAGE;

  // IDs estables para detectar cuándo cambian realmente las OTs
  const workOrderIdsKey = workOrders.map((wo) => wo.id).join(",");
  const itemsLoaded = useRef(false);
  const prevIdsKey = useRef("");

  // Cargar items una sola vez por set de OTs
  useEffect(() => {
    if (igvTypes.length === 0) return;
    if (workOrders.length === 0) return;
    if (itemsLoaded.current && prevIdsKey.current === workOrderIdsKey) return;

    prevIdsKey.current = workOrderIdsKey;
    itemsLoaded.current = true;

    const gravadaType = igvTypes.find(
      (t) => t.code_nubefact === NUBEFACT_CODES.GRAVADA_ONEROSA,
    );
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const items: ElectronicDocumentItemSchema[] = [];

    workOrders.forEach((wo) => {
      (wo.labours ?? []).forEach((labour) => {
        const subtotal = round2(parseFloat(labour.net_amount || "0"));
        const valor_unitario = subtotal;
        const precio_unitario = round2(
          valor_unitario * (1 + porcentaje_de_igv / 100),
        );
        const igvAmount = round2(subtotal * (porcentaje_de_igv / 100));
        items.push({
          account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.FULL_SALE,
          unidad_de_medida: "ZZ",
          codigo: labour.id.toString(),
          descripcion: labour.description,
          cantidad: 1,
          valor_unitario,
          precio_unitario,
          subtotal,
          sunat_concept_igv_type_id: gravadaType?.id || 0,
          igv: igvAmount,
          total: round2(subtotal + igvAmount),
        });
      });

      (wo.parts ?? []).forEach((part) => {
        const totalAmount = round2(parseFloat(part.net_amount || "0"));
        const cantidad = part.quantity_used;
        const valor_unitario = round2(totalAmount / cantidad);
        const precio_unitario = round2(
          valor_unitario * (1 + porcentaje_de_igv / 100),
        );
        const igvAmount = round2(totalAmount * (porcentaje_de_igv / 100));
        items.push({
          account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.FULL_SALE,
          unidad_de_medida: "NIU",
          codigo: part.id.toString(),
          descripcion: part.product_name,
          cantidad,
          valor_unitario,
          precio_unitario,
          subtotal: totalAmount,
          sunat_concept_igv_type_id: gravadaType?.id || 0,
          igv: igvAmount,
          total: round2(totalAmount + igvAmount),
        });
      });
    });

    form.setValue("items", items, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrderIdsKey, igvTypes, porcentaje_de_igv]);

  // Calcular totales derivados de items (sin useEffect para evitar loop)
  const watchedItems = form.watch("items");
  const items = useMemo(() => watchedItems || [], [watchedItems]);

  const totales = useMemo(() => {
    const round2 = (n: number) => Math.round(n * 100) / 100;
    let raw_gravada = 0;
    let raw_inafecta = 0;
    let raw_exonerada = 0;

    items.forEach((item) => {
      const igvType = igvTypes.find(
        (t) => t.id === item.sunat_concept_igv_type_id,
      );
      if (igvType?.code_nubefact === "1") raw_gravada += item.subtotal;
      else if (igvType?.code_nubefact === "20") raw_exonerada += item.subtotal;
      else if (igvType?.code_nubefact === "30") raw_inafecta += item.subtotal;
    });

    const total_gravada = round2(raw_gravada);
    const total_inafecta = round2(raw_inafecta);
    const total_exonerada = round2(raw_exonerada);
    const total_igv = round2(raw_gravada * (porcentaje_de_igv / 100));
    const total = round2(
      total_gravada + total_inafecta + total_exonerada + total_igv,
    );
    return { total_gravada, total_inafecta, total_exonerada, total_igv, total };
  }, [items, igvTypes, porcentaje_de_igv]);

  // Sincronizar totales — usar ref para evitar setValue si no cambiaron
  const prevTotales = useRef(totales);
  useEffect(() => {
    const prev = prevTotales.current;
    if (
      prev.total_gravada === totales.total_gravada &&
      prev.total_inafecta === totales.total_inafecta &&
      prev.total_exonerada === totales.total_exonerada &&
      prev.total_igv === totales.total_igv &&
      prev.total === totales.total
    )
      return;
    prevTotales.current = totales;
    form.setValue("total_gravada", totales.total_gravada, {
      shouldValidate: false,
    });
    form.setValue("total_inafecta", totales.total_inafecta, {
      shouldValidate: false,
    });
    form.setValue("total_exonerada", totales.total_exonerada, {
      shouldValidate: false,
    });
    form.setValue("total_igv", totales.total_igv, { shouldValidate: false });
    form.setValue("total_gratuita", 0, { shouldValidate: false });
    form.setValue("total_anticipo", 0, { shouldValidate: false });
    form.setValue("total", totales.total, { shouldValidate: false });
  }, [totales, form]);

  // Panel de resumen lateral
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const series = form.watch("serie");
  const clientId = form.watch("client_id");

  const selectedCurrencyId = form.watch("sunat_concept_currency_id");
  const selectedCurrency = currencyTypes.find(
    (c) => c.id === Number(selectedCurrencyId),
  );
  const currencySymbol = selectedCurrency?.iso_code === "USD" ? "$" : "S/";

  const { data: selectedCustomerFromApi } = useCustomersById(
    clientId ? Number(clientId) : 0,
  );
  const selectedCustomer = selectedCustomerFromApi ?? defaultCustomer;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <InvoiceDocumentInfoSection
              form={form}
              documentTypes={documentTypes}
              currencyTypes={currencyTypes}
              authorizedSeries={authorizedSeries}
              defaultCustomer={defaultCustomer!}
              isAdvancePayment={false}
            />
            <ItemsSection
              form={form}
              igvTypes={igvTypes}
              currencySymbol={currencySymbol}
              porcentaje_de_igv={porcentaje_de_igv}
              isAdvancePayment={false}
              isFromQuotation={true}
              showActions={false}
            />
            <AdditionalConfigSection
              form={form}
              checkbooks={checkbooks}
              isModuleCommercial={false}
              showCardLast4={true}
              showInternalNote={true}
            />
          </div>

          {/* Resumen — 1/3 */}
          <div className="lg:col-span-1 h-full">
            <Card className="h-full sticky top-6 bg-linear-to-br from-primary/5 via-background to-muted/20 border-primary/20">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="size-5 text-primary" />
                    Resumen
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/30"
                  >
                    Nuevo
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {series
                    ? authorizedSeries.find((s) => s.id === Number(series))
                        ?.series
                    : "****"}
                  -{form.watch("numero") || "########"}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Tipo de comprobante */}
                <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
                  <p className="text-xs font-medium text-muted-foreground">
                    Tipo de Comprobante
                  </p>
                  <p className="text-sm font-semibold">
                    {documentTypes.find(
                      (t) => t.id === Number(selectedDocumentType),
                    )?.description || "Sin seleccionar"}
                  </p>
                </div>

                {/* Cliente */}
                <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
                  <p className="text-xs font-medium text-muted-foreground">
                    Cliente
                  </p>
                  <p className="text-sm font-semibold">
                    {selectedCustomer?.full_name || "Sin seleccionar"}
                  </p>
                  {selectedCustomer && (
                    <>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold">Documento:</span>{" "}
                        {selectedCustomer.num_doc}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold">Dirección:</span>{" "}
                        {selectedCustomer.direction}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold">IGV:</span>{" "}
                        {selectedCustomer.tax_class_type_igv
                          ? `${selectedCustomer.tax_class_type_igv}%`
                          : "-"}
                      </div>
                    </>
                  )}
                </div>

                {/* IGV info */}
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs font-medium text-blue-600">
                    IGV: {porcentaje_de_igv}%
                  </p>
                </div>

                <Separator className="bg-muted-foreground/20" />

                {/* OTs incluidas */}
                {workOrders.length > 1 && (
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Órdenes de Trabajo incluidas
                    </p>
                    {workOrders.map((wo) => (
                      <p key={wo.id} className="text-xs text-muted-foreground">
                        • {wo.correlative}
                        {wo.vehicle_plate ? ` — ${wo.vehicle_plate}` : ""}
                      </p>
                    ))}
                  </div>
                )}

                {/* Totales */}
                <div className="space-y-3">
                  {totales.total_gravada > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Op. Gravada</span>
                      <span className="font-medium">
                        {currencySymbol}{" "}
                        {totales.total_gravada.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  {totales.total_exonerada > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Op. Exonerada
                      </span>
                      <span className="font-medium">
                        {currencySymbol}{" "}
                        {totales.total_exonerada.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  {totales.total_inafecta > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Op. Inafecta
                      </span>
                      <span className="font-medium">
                        {currencySymbol}{" "}
                        {totales.total_inafecta.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      IGV ({porcentaje_de_igv}%)
                    </span>
                    <span className="font-medium">
                      {currencySymbol}{" "}
                      {totales.total_igv.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <Separator className="bg-primary/20" />

                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <span className="text-base font-semibold text-primary">
                      Total
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {currencySymbol}{" "}
                      {totales.total.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                <Separator className="bg-muted-foreground/20" />

                {/* Botones */}
                <div className="space-y-2 pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={
                      isPending || !form.formState.isValid || totales.total <= 0
                    }
                  >
                    {form.watch("enviar_automaticamente_a_la_sunat") ? (
                      <Send className="size-4 mr-2" />
                    ) : (
                      <FileCheck className="size-4 mr-2" />
                    )}
                    {isPending
                      ? "Guardando..."
                      : form.watch("enviar_automaticamente_a_la_sunat")
                        ? "Guardar y Enviar a SUNAT"
                        : "Guardar Documento"}
                  </Button>
                  {totales.total <= 0 && form.formState.isSubmitted && (
                    <p className="text-xs text-center text-destructive font-medium">
                      El total debe ser mayor a 0 para guardar el documento
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onCancel}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="pt-4 border-t border-muted-foreground/10">
                  <p className="text-xs text-center text-muted-foreground">
                    {form.watch("fecha_de_emision")
                      ? new Date(
                          form.watch("fecha_de_emision") + "T00:00:00",
                        ).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "Sin fecha"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
