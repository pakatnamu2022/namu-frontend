import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FileCheck, Send } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { PurchaseRequestQuoteResource } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/series/lib/assignSalesSeries.interface";
import { useCustomersById } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { ElectronicDocumentResource } from "../../lib/electronicDocument.interface";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

interface SummarySectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  documentTypes: SunatConceptsResource[];
  identityDocumentTypes: SunatConceptsResource[];
  authorizedSeries: AssignSalesSeriesResource[];
  currencySymbol: string;
  totales: {
    total_gravada: number;
    total_inafecta: number;
    total_exonerada: number;
    total_igv: number;
    total_gratuita: number;
    total_anticipo: number;
    total: number;
  };
  porcentaje_de_igv: number;
  isEdit: boolean;
  isPending: boolean;
  isAdvancePayment: boolean;
  quotation?: PurchaseRequestQuoteResource | null;
  advancePayments?: ElectronicDocumentResource[];
  selectedCustomer?: CustomersResource;
  onSubmit: () => void;
  exchangeRate?: number;
  exchangeRateMissing?: boolean;
}

export function SummarySection({
  form,
  documentTypes,
  authorizedSeries,
  currencySymbol,
  totales,
  porcentaje_de_igv,
  isEdit,
  isPending,
  isAdvancePayment,
  quotation,
  advancePayments = [],
  selectedCustomer: selectedCustomerProp,
  onSubmit,
  exchangeRate,
  exchangeRateMissing,
}: SummarySectionProps) {
  const items = form.watch("items") || [];
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const series = form.watch("serie");
  const selectedClientId = form.watch("client_id");
  const hasDetraccion = form.watch("detraccion") || false;
  const detraccionPorcentaje = form.watch("detraccion_porcentaje") || 0;
  const DETRACCION_RATE = detraccionPorcentaje / 100;
  // Monto de detracción en la moneda del documento (lo que se resta al cliente)
  const detraccionAmount = hasDetraccion ? totales.total * DETRACCION_RATE : 0;
  const totalConDetraccion = hasDetraccion ? totales.total * (1 - DETRACCION_RATE) : totales.total;
  // El depósito de detracción a Banco de la Nación siempre se hace en soles,
  // por lo que si el documento es en dólares se convierte con el T.C. del día
  const isUSD = currencySymbol === "$";
  const detraccionAmountSoles = hasDetraccion
    ? Math.round(
        (isUSD ? detraccionAmount * (exchangeRate || 0) : detraccionAmount) *
          100,
      ) / 100
    : 0;

  // Persistir siempre el monto de detracción en soles para el envío al backend
  useEffect(() => {
    const current = form.getValues("detraccion_total");
    const next = hasDetraccion ? detraccionAmountSoles : undefined;
    if (current !== next) {
      form.setValue("detraccion_total", next);
    }
  }, [hasDetraccion, detraccionAmountSoles, form]);

  // Buscar el cliente seleccionado
  const selectedCustomer =
    useCustomersById(Number(selectedClientId), !!selectedClientId).data ||
    selectedCustomerProp;

  return (
    <div className="lg:col-span-1 lg:row-start-1 lg:col-start-3">
      <Card className="h-fit sticky top-6 border-0 shadow-lg shadow-black/4 dark:shadow-black/20">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Resumen
            </p>
            <span className="text-xs font-medium text-muted-foreground">
              {isEdit ? "Edición" : "Nuevo"}
            </span>
          </div>

          <div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {series
                ? authorizedSeries.find((s) => s.id === Number(series))?.series
                : "****"}
              -{form.watch("numero") || "########"}
            </p>
            {(isAdvancePayment || quotation) && (
              <div className="flex items-center gap-2 mt-1.5">
                {isAdvancePayment && (
                  <span className="text-xs font-medium text-orange-500 dark:text-orange-400">
                    Anticipo
                  </span>
                )}
                {isAdvancePayment && quotation && (
                  <span className="text-muted-foreground/40">·</span>
                )}
                {quotation && (
                  <span className="text-xs text-muted-foreground">
                    Cotización COT-{quotation.id}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tipo de Comprobante + Cliente */}
          <div className="space-y-4 rounded-2xl bg-muted/40 p-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Comprobante
              </p>
              <p className="text-sm font-medium">
                {documentTypes.find(
                  (t) => t.id === Number(selectedDocumentType),
                )?.description || "Sin seleccionar"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Cliente</p>
              <p className="text-sm font-medium">
                {selectedCustomer?.full_name
                  ? selectedCustomer.full_name +
                    (selectedCustomer.spouse_full_name
                      ? ` - ${selectedCustomer.spouse_full_name}`
                      : "")
                  : "Sin seleccionar"}
              </p>
              <div className="text-xs text-muted-foreground space-y-0.5 mt-1.5">
                <p>
                  <span className="text-muted-foreground/70">Doc.</span>{" "}
                  {selectedCustomer?.num_doc || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground/70">Dirección</span>{" "}
                  {selectedCustomer?.direction || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground/70">Teléfono</span>{" "}
                  {selectedCustomer && selectedCustomer?.phone !== "0"
                    ? selectedCustomer.phone
                    : "-"}
                </p>
                <p>
                  <span className="text-muted-foreground/70">Email</span>{" "}
                  {selectedCustomer?.email ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* IGV Info */}
          <div className="space-y-1 px-1">
            <p className="text-xs font-medium text-foreground">
              IGV {porcentaje_de_igv}%
            </p>
            <p className="text-xs text-muted-foreground">
              Calculado automáticamente según la clasificación tributaria del
              cliente
            </p>
            {exchangeRate && (
              <p className="text-xs text-muted-foreground">
                T.C. venta:{" "}
                <span className="font-medium text-foreground">
                  S/{" "}
                  {exchangeRate.toLocaleString("es-PE", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </span>
              </p>
            )}
            {exchangeRateMissing && (
              <p className="text-xs text-destructive font-medium">
                Sin tipo de cambio para la fecha seleccionada
              </p>
            )}
          </div>

          {/* Items Summary */}
          <div className="space-y-2 hidden">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Items ({items.length})
            </p>
            <div className="space-y-2 pr-2">
              {items.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-4">
                  No hay items agregados
                </p>
              ) : (
                items.map((item, index) => {
                  // Si es anticipo de regularización, mostrar en negativo
                  const displayTotal = item.anticipo_regularizacion
                    ? -item.total
                    : item.total;
                  const isNegative =
                    item.anticipo_regularizacion &&
                    advancePayments.find(
                      (ap) => ap.id === Number(item.reference_document_id),
                    )?.sunat_concept_document_type_id !==
                      SUNAT_TYPE_INVOICES_ID.NOTA_CREDITO;

                  return (
                    <div
                      key={index}
                      className={`flex justify-between items-start gap-2 text-sm p-2 rounded ${
                        isNegative
                          ? "bg-orange-50 border border-orange-200"
                          : "bg-background/50 border border-muted-foreground/10"
                      }`}
                    >
                      <div className="flex-1 min-w-0 text-wrap! ">
                        <p
                          className={`font-medium text-xs whitespace-pre-line ${
                            isNegative ? "text-orange-700" : ""
                          }`}
                        >
                          {item.descripcion}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.cantidad} x {currencySymbol}{" "}
                          {item.precio_unitario.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <p
                        className={`text-xs font-semibold whitespace-nowrap ${
                          isNegative ? "text-orange-600" : ""
                        }`}
                      >
                        {isNegative ? "- " : ""}
                        {currencySymbol}{" "}
                        {Math.abs(displayTotal).toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* <Separator className="bg-muted-foreground/20" /> */}

          {/* Totales */}
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
            {totales.total_exonerada > 0 && (
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-muted-foreground font-mono uppercase">
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
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-muted-foreground font-mono uppercase">
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
            {totales.total_gratuita > 0 && (
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-muted-foreground font-mono uppercase">
                  Op. Gratuita
                </span>
                <span className="font-medium">
                  {currencySymbol}{" "}
                  {totales.total_gratuita.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm px-2">
              <span className="text-muted-foreground font-mono uppercase">
                IGV ({porcentaje_de_igv}%)
              </span>
              <span className="font-medium">
                {currencySymbol}{" "}
                {totales.total_igv.toLocaleString("es-PE", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="border border-dashed border-primary/20 m-0" />

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

          {/* Detracción */}
          {hasDetraccion && (
            <div className="space-y-2 border border-dashed border-muted-foreground/20 pt-2 rounded-lg">
              <p className="text-xs font-mono uppercase text-muted-foreground px-3">
                Forma de pago con detracción
              </p>

              <div className="flex justify-between items-center text-xs px-3">
                <span className="text-muted-foreground/80 font-mono uppercase">
                  Detracción ({detraccionPorcentaje}%)
                </span>
                <span className="text-muted-foreground">
                  S/{" "}
                  {detraccionAmountSoles.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs px-3">
                <span className="text-muted-foreground/80 font-mono uppercase">
                  Cliente paga
                </span>
                <span className="text-muted-foreground">
                  {currencySymbol}
                  {totalConDetraccion.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs px-3 pb-2">
                <span className="text-muted-foreground/80 font-mono uppercase">
                  Depósito BN
                </span>
                <span className="text-muted-foreground">
                  S/{" "}
                  {detraccionAmountSoles.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {isUSD && !exchangeRate && (
                <p className="text-xs text-destructive font-medium px-3 pb-2">
                  Sin tipo de cambio: no se puede calcular la detracción en
                  soles
                </p>
              )}
            </div>
          )}
          {/* <Separator className="bg-muted-foreground/20" /> */}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 flex flex-col gap-2">
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
                  {form.watch("enviar_automaticamente_a_la_sunat") ? (
                    <Send className="size-4 mr-2" />
                  ) : (
                    <FileCheck className="size-4 mr-2" />
                  )}
                  {isPending
                    ? "Guardando..."
                    : isEdit
                      ? "Actualizar Documento"
                      : form.watch("enviar_automaticamente_a_la_sunat")
                        ? "Guardar y Enviar a SUNAT"
                        : "Guardar Documento"}
                </Button>
              }
              title={isEdit ? "¿Actualizar documento?" : "¿Guardar documento?"}
              description={
                isEdit
                  ? "¿Estás seguro de que deseas actualizar este documento electrónico?"
                  : "¿Estás seguro de que deseas guardar este documento electrónico?"
              }
              confirmText={isEdit ? "Sí, actualizar" : "Sí, guardar"}
              cancelText="No, revisar"
              icon="info"
              onConfirm={onSubmit}
            />
          </div>

          {/* Footer Info */}
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
  );
}
