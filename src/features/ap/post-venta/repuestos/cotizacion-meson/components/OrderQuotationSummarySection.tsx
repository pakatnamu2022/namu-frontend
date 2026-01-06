import { UseFormReturn } from "react-hook-form";
import { FileCheck, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { useCustomersById } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

interface OrderQuotationSummarySectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  documentTypes: SunatConceptsResource[];
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
  quotation?: OrderQuotationResource | null;
  advancePayments?: ElectronicDocumentResource[];
}

export function OrderQuotationSummarySection({
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
}: OrderQuotationSummarySectionProps) {
  const items = form.watch("items") || [];
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const series = form.watch("serie");
  const clientId = form.watch("client_id");

  // Obtener el cliente seleccionado solo por ID (eficiente, sin traer 2000+ clientes)
  const { data: selectedCustomerFromApi } = useCustomersById(
    clientId ? Number(clientId) : 0
  );

  // Usar el cliente de la API si existe, sino usar el owner de la cotización como fallback
  const selectedCustomer = selectedCustomerFromApi || quotation?.vehicle?.owner;

  return (
    <div className="lg:col-span-1 lg:row-start-1 lg:col-start-3 h-full">
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
              Desde Cotización: {quotation.quotation_number}
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
              Las cotizaciones ya incluyen IGV en los precios de los repuestos.
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
                  // Si es anticipo de regularización, determinar si debe mostrarse en negativo
                  const isAdvanceRegularization = item.anticipo_regularizacion;

                  // Verificar si el anticipo referenciado NO es una nota de crédito
                  // (las notas de crédito ya son negativas, así que no las marcamos como negativas)
                  const isNegative =
                    isAdvanceRegularization &&
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
                        {Math.abs(item.total).toLocaleString("es-PE", {
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

          {/* Action Buttons */}
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
                : isEdit
                ? "Actualizar Documento"
                : form.watch("enviar_automaticamente_a_la_sunat")
                ? "Guardar y Enviar a SUNAT"
                : "Guardar Documento"}
            </Button>
            {totales.total <= 0 && (
              <p className="text-xs text-center text-destructive font-medium">
                El total debe ser mayor a 0 para guardar el documento
              </p>
            )}
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
