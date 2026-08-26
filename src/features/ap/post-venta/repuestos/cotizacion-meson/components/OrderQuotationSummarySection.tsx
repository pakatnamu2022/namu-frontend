import { UseFormReturn } from "react-hook-form";
import { FileCheck, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/series/lib/assignSalesSeries.interface";
import { useCustomersById } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { formatDate } from "@/core/core.function";

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
  onCancel?: () => void;
  onSubmit?: () => void;
  hasDraftFinalInvoice?: boolean;
  hasDraftAdvance?: boolean;
  deductibleAmount?: number;
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
  onCancel,
  onSubmit,
  hasDraftFinalInvoice = false,
  hasDraftAdvance = false,
  deductibleAmount = 0,
}: OrderQuotationSummarySectionProps) {
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const series = form.watch("serie");
  const clientId = form.watch("client_id");

  // Obtener el cliente seleccionado solo por ID (eficiente, sin traer 2000+ clientes)
  const { data: selectedCustomerFromApi } = useCustomersById(
    clientId ? Number(clientId) : 0,
  );

  // Usar el cliente de la API si existe, sino usar el owner de la cotización como fallback
  const selectedCustomer = selectedCustomerFromApi || quotation?.vehicle?.owner;

  const hasRealAdvancePayments =
    (quotation?.payment_summary?.advances_count ?? 0) > 0;

  const pendingBalance = quotation?.payment_summary?.remaining_balance ?? 0;

  // Si el saldo está completado (<=0) y NO hay anticipos reales, no se puede facturar nada más
  const isCompletedWithoutAdvances =
    pendingBalance <= 0 && !hasRealAdvancePayments;

  // Ya existe un comprobante final en borrador: no se puede crear otro
  // documento. No aplica en edición: ahí se está editando ese mismo borrador.
  const isBlockedByDraftFinalInvoice = !isEdit && hasDraftFinalInvoice;

  // Ya existe un anticipo en borrador: no se puede crear otro anticipo ni
  // tampoco la factura final hasta que ese borrador se complete o elimine.
  // No aplica en edición: ahí se está editando ese mismo borrador.
  const isBlockedByDraftAdvance = !isEdit && hasDraftAdvance;

  const isSaveBlocked =
    isCompletedWithoutAdvances ||
    isBlockedByDraftFinalInvoice ||
    isBlockedByDraftAdvance;

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
            <Badge color="secondary" className="w-fit">
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
              El IGV se calcula sobre el subtotal de la cotización.
            </p>
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
            {totales.total_gratuita > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Op. Gratuita</span>
                <span className="font-medium">
                  {currencySymbol}{" "}
                  {totales.total_gratuita.toLocaleString("es-PE", {
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

            {deductibleAmount > 0 && (
              <div className="flex justify-between items-center text-sm p-2 rounded bg-indigo-50 border border-indigo-200">
                <span className="text-indigo-700 font-medium">
                  Descuento Global (Deducible)
                </span>
                <span className="font-semibold text-indigo-700">
                  −{currencySymbol}{" "}
                  {deductibleAmount.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <Separator className="bg-primary/20" />

            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/30">
              <span className="text-base font-semibold text-primary">
                Total
              </span>
              <span className="text-xl font-bold text-primary">
                {currencySymbol}{" "}
                {/* Si está completado sin anticipos, mostrar 0. Caso contrario, mostrar total calculado */}
                {isCompletedWithoutAdvances
                  ? (0).toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })
                  : totales.total.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
              </span>
            </div>
          </div>
          <Separator className="bg-muted-foreground/20" />

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
              onConfirm={onCancel ?? (() => window.history.back())}
            />

            <ConfirmationDialog
              trigger={
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  disabled={
                    isPending ||
                    !form.formState.isValid ||
                    isSaveBlocked ||
                    (totales.total <= 0 &&
                      !hasRealAdvancePayments &&
                      totales.total_gratuita <= 0)
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
              onConfirm={onSubmit ?? (() => {})}
            />
          </div>
          {isBlockedByDraftFinalInvoice ? (
            <p className="text-xs text-center text-destructive font-medium">
              Ya existe un comprobante final en borrador para esta cotización.
              No se puede generar otro documento hasta que se complete o
              elimine.
            </p>
          ) : isBlockedByDraftAdvance ? (
            <p className="text-xs text-center text-destructive font-medium">
              Ya existe un anticipo en borrador para esta cotización. Debe
              completarse o eliminarse antes de generar otro documento.
            </p>
          ) : (
            isCompletedWithoutAdvances && (
              <p className="text-xs text-center text-destructive font-medium">
                Esta cotización ya está completamente facturada. No se puede
                crear más documentos.
              </p>
            )
          )}
          {!isSaveBlocked &&
            totales.total <= 0 &&
            !hasRealAdvancePayments &&
            totales.total_gratuita <= 0 && (
              <p className="text-xs text-center text-destructive font-medium">
                El total debe ser mayor a 0 para guardar el documento
              </p>
            )}

          {/* Footer Info */}
          <div className="pt-4 border-t border-muted-foreground/10">
            <p className="text-xs text-center text-muted-foreground">
              {form.watch("fecha_de_emision")
                ? formatDate(
                    form.watch("fecha_de_emision"),
                    "dd 'de' MMMM 'de' yyyy",
                  )
                : "Sin fecha"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
