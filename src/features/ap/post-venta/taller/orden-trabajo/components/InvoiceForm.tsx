"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, FileCheck } from "lucide-react";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { type InvoiceSchema } from "../lib/invoice.schema";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { FormInputText } from "@/shared/components/FormInputText";
import { FormInput } from "@/shared/components/FormInput";
import { Input } from "@/components/ui/input";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";

interface InvoiceFormProps {
  form: UseFormReturn<InvoiceSchema, any, any>;
  onSubmit: (data: InvoiceSchema) => void;
  onCancel: () => void;
  isPending: boolean;
  selectedGroupNumber: number | null;
  customers: CustomersResource[];
  isLoadingCustomers: boolean;
  documentTypes: SunatConceptsResource[];
  currencyTypes: SunatConceptsResource[];
  authorizedSeries: AssignSalesSeriesResource[];
  filteredDocumentTypes: SunatConceptsResource[];
}

export default function InvoiceForm({
  form,
  onSubmit,
  onCancel,
  isPending,
  selectedGroupNumber,
  customers,
  isLoadingCustomers,
  documentTypes,
  currencyTypes,
  authorizedSeries,
  filteredDocumentTypes,
}: InvoiceFormProps) {
  // Watch para obtener valores en tiempo real
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const selectedCurrencyId = form.watch("sunat_concept_currency_id");
  const series = form.watch("serie");
  const clientId = form.watch("customer_id");
  const amount = form.watch("amount") || 0;
  const taxRate = form.watch("taxRate") || 18;

  // Obtener el cliente seleccionado
  const selectedCustomer = customers.find(
    (customer) => customer.id.toString() === clientId
  );

  // Obtener el símbolo de moneda
  const currencySymbol =
    currencyTypes.find((c) => c.id.toString() === selectedCurrencyId)
      ?.description || "S/";

  // Calcular totales
  const calculateTaxAmount = () => {
    return (amount * taxRate) / 100;
  };

  const calculateTotalAmount = () => {
    return amount + calculateTaxAmount();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulario */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Nueva Factura - Grupo {selectedGroupNumber}
            </h4>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sección de Información del Documento */}
              <GroupFormSection
                title="Información del Documento"
                icon={FileText}
                iconColor="text-primary"
                bgColor="bg-primary/5"
                cols={{ sm: 1, md: 3 }}
              >
                <div className="md:col-span-3">
                  <FormSelect
                    control={form.control}
                    name="customer_id"
                    options={customers.map((customer) => ({
                      value: customer.id.toString(),
                      label: `${customer.full_name} - ${customer.num_doc}`,
                    }))}
                    label="Cliente *"
                    description="Seleccione el cliente"
                    placeholder={
                      isLoadingCustomers
                        ? "Cargando clientes..."
                        : "Seleccionar cliente"
                    }
                    disabled={isLoadingCustomers}
                  />
                </div>

                <FormSelect
                  control={form.control}
                  name="sunat_concept_document_type_id"
                  options={filteredDocumentTypes.map((type) => ({
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
                      1
                    ),
                    after: new Date(),
                  }}
                />

                <FormSelect
                  control={form.control}
                  name="serie"
                  options={authorizedSeries.map((series) => ({
                    value: series.id.toString(),
                    label: `${series.series} - ${series.sede || ""}`,
                  }))}
                  label="Serie *"
                  description="Series autorizadas para su usuario"
                  placeholder="Seleccionar serie"
                />

                <div>
                  <FormLabel>Número</FormLabel>
                  <Input
                    type="text"
                    placeholder="Auto-generado"
                    disabled
                    value=""
                  />
                  <FormDescription className="text-xs">
                    Se genera automáticamente
                  </FormDescription>
                </div>
              </GroupFormSection>

              {/* Sección de Descripción y Montos */}
              <GroupFormSection
                title="Detalle de la Factura"
                icon={FileText}
                iconColor="text-primary"
                bgColor="bg-blue-50"
                cols={{ sm: 1, md: 2 }}
              >
                <div className="md:col-span-2">
                  <FormInputText
                    control={form.control}
                    name="description"
                    label="Descripción *"
                    placeholder="Detalle de los servicios facturados..."
                    rows={3}
                  />
                </div>

                <FormInput
                  control={form.control}
                  name="amount"
                  label={`Subtotal (${currencySymbol}) *`}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min={0}
                />

                <FormInput
                  control={form.control}
                  name="taxRate"
                  label="Tasa de IGV (%) *"
                  placeholder="18.00"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                />
              </GroupFormSection>
            </form>
          </Form>
        </Card>
      </div>

      {/* Resumen */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6 bg-linear-to-br from-primary/5 via-background to-muted/20 border-primary/20">
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
                ? authorizedSeries.find((s) => s.id === Number(series))?.series
                : "****"}
              -########
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Tipo de Comprobante */}
            <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
              <p className="text-xs font-medium text-muted-foreground">
                Tipo de Comprobante
              </p>
              <p className="text-sm font-semibold">
                {documentTypes.find(
                  (t) => t.id.toString() === selectedDocumentType
                )?.description || "Sin seleccionar"}
              </p>
            </div>

            {/* Cliente Info */}
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
                  {selectedCustomer.phone !== "0" && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">Teléfono:</span>{" "}
                      {selectedCustomer.phone}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* IGV Info */}
            <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs font-medium text-blue-600">
                IGV: {taxRate}%
              </p>
              <p className="text-xs text-muted-foreground">
                El porcentaje de IGV se calcula según la tasa configurada
              </p>
            </div>

            <Separator className="bg-muted-foreground/20" />

            {/* Totales */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {currencySymbol}{" "}
                  {amount.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IGV ({taxRate}%)</span>
                <span className="font-medium">
                  {currencySymbol}{" "}
                  {calculateTaxAmount().toLocaleString("es-PE", {
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
                  {calculateTotalAmount().toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <Separator className="bg-muted-foreground/20" />

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
                onClick={form.handleSubmit(onSubmit)}
              >
                <FileCheck className="size-4 mr-2" />
                {isPending ? "Creando..." : "Crear Factura"}
              </Button>
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

            {/* Footer Info */}
            <div className="pt-4 border-t border-muted-foreground/10">
              <p className="text-xs text-center text-muted-foreground">
                {form.watch("fecha_de_emision")
                  ? new Date(
                      form.watch("fecha_de_emision") + "T00:00:00"
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
  );
}
