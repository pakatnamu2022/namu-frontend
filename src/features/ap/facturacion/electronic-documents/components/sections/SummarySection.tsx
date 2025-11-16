import { UseFormReturn } from "react-hook-form";
import { FileCheck, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/src/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { PurchaseRequestQuoteResource } from "@/src/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";
import { AssignSalesSeriesResource } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { useAllCustomers } from "@/src/features/ap/comercial/clientes/lib/customers.hook";
import { ElectronicDocumentResource } from "../../lib/electronicDocument.interface";
import { SUNAT_TYPE_INVOICES_ID } from "@/src/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

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
}: SummarySectionProps) {
  const items = form.watch("items") || [];
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const series = form.watch("serie");
  const clientId = form.watch("client_id");

  const { data: customers = [] } = useAllCustomers();
  const selectedCustomer = customers.find(
    (customer) => customer.id.toString() === clientId
  );

  return (
    <div className="lg:col-span-1 lg:row-start-1 lg:col-start-3 h-full">
      <Card className="h-full sticky top-6 bg-gradient-to-br from-primary/5 via-background to-muted/20 border-primary/20">
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
              {isEdit ? "Edición" : "Nuevo"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {series
              ? authorizedSeries.find((s) => s.id === Number(series))?.series
              : "****"}
            -{form.watch("numero") || "########"}
          </p>
          {isAdvancePayment && (
            <Badge variant="secondary" className="w-fit">
              Anticipo
            </Badge>
          )}
          {quotation && (
            <Badge variant="outline" className="w-fit">
              Desde Cotización: COT-{quotation.id}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tipo de Comprobante */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">
              Tipo de Comprobante
            </p>
            <p className="text-sm font-semibold">
              {documentTypes.find((t) => t.id === Number(selectedDocumentType))
                ?.description || "Sin seleccionar"}
            </p>
          </div>

          {/* Cliente Info */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">Cliente</p>
            <p className="text-sm font-semibold">
              {selectedCustomer?.full_name
                ? selectedCustomer.full_name +
                  (selectedCustomer.spouse_full_name
                    ? ` - ${selectedCustomer.spouse_full_name}`
                    : "")
                : "Sin seleccionar"}
            </p>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Documento:</span>{" "}
              {selectedCustomer?.num_doc}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Dirección:</span>{" "}
              {selectedCustomer?.direction}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Teléfono:</span>{" "}
              {selectedCustomer && selectedCustomer?.phone !== "0"
                ? selectedCustomer.phone
                : "-"}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Email:</span>{" "}
              {selectedCustomer?.email ?? "-"}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">IGV:</span>{" "}
              {selectedCustomer?.tax_class_type_igv
                ? `${selectedCustomer.tax_class_type_igv}%`
                : "-"}
            </div>
          </div>

          {/* IGV Info */}
          <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs font-medium text-blue-600">
              IGV: {porcentaje_de_igv}%
            </p>
            <p className="text-xs text-muted-foreground">
              El porcentaje de IGV se calcula automáticamente según la
              clasificación tributaria del cliente seleccionado
            </p>
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Items Summary */}
          <div className="space-y-2">
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
                      (ap) => ap.id === Number(item.reference_document_id)
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
                      <div className="flex-1 min-w-0 !text-wrap ">
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

          <Separator className="bg-muted-foreground/20" />

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
                <span className="text-muted-foreground">Op. Exonerada</span>
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
                <span className="text-muted-foreground">Op. Inafecta</span>
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
                {/* Calcular el total real a cobrar (resta anticipos automáticamente) */}
                {totales.total.toLocaleString("es-PE", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          <Separator className="bg-muted-foreground/20" />
          {/* <div className="flex flex-col gap-2">
            <FormSwitch
              control={form.control}
              name="enviar_automaticamente_a_la_sunat"
              text="Enviar automáticamente a SUNAT"
              textDescription="El documento se enviará a SUNAT al guardar"
              className="!bg-transparent !h-auto"
            />

            <FormSwitch
              control={form.control}
              name="enviar_automaticamente_al_cliente"
              text="Enviar automáticamente al cliente"
              textDescription="Se enviará por email al cliente"
              className="!bg-transparent !h-auto"
            />
          </div> */}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button
              type="submit"
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
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => window.history.back()}
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
  );
}
