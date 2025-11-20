"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileCheck,
  Loader2,
  Send,
  AlertCircle,
  CheckCircle2,
  FileText,
  NotepadText,
} from "lucide-react";
import { CreditNoteSchema } from "../../lib/electronicDocument.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { TYPE_RECEIPT_SERIES } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import { ElectronicDocumentResource } from "../../lib/electronicDocument.interface";
import { CreditNoteItemsTable } from "../CreditNoteItemsTable";
import { getNextCreditNoteNumber } from "../../lib/electronicDocument.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { notFound } from "@/shared/hooks/useNotFound";
import { format } from "date-fns";

interface CreditNoteFormProps {
  creditNote?: ElectronicDocumentResource;
  originalDocument: ElectronicDocumentResource;
  onSubmit: (data: CreditNoteSchema) => void;
  isPending: boolean;
}

export function CreditNoteForm({
  creditNote,
  originalDocument,
  onSubmit,
  isPending,
}: CreditNoteFormProps) {
  // States for series verification
  const [nextNumber, setNextNumber] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // Fetch credit note types from SUNAT
  const { data: creditNoteTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_CREDIT_NOTE_TYPE],
  });

  // Fetch authorized series for credit notes
  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: TYPE_RECEIPT_SERIES.NOTA_CREDITO,
  });

  // Initialize form with document items
  const form = useForm<CreditNoteSchema>({
    resolver: zodResolver(CreditNoteSchema) as any,
    defaultValues: {
      fecha_de_emision: creditNote
        ? format(new Date(creditNote.fecha_de_emision), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      sunat_concept_credit_note_type_id:
        creditNote?.sunat_concept_credit_note_type_id?.toString() || "",
      series: creditNote?.series_id?.toString() || "",
      observaciones: creditNote?.observaciones || "",
      enviar_automaticamente_a_la_sunat:
        creditNote?.enviar_automaticamente_a_la_sunat || false,
      enviar_automaticamente_al_cliente:
        creditNote?.enviar_automaticamente_al_cliente || false,
      items:
        (creditNote?.items || originalDocument.items)?.map((item) => ({
          ap_billing_electronic_document_id:
            item.ap_billing_electronic_document_id?.toString() || "",
          reference_document_id: item.reference_document_id?.toString() || "",
          unidad_de_medida: item.unidad_de_medida,
          codigo: item.codigo,
          codigo_producto_sunat: item.codigo_producto_sunat,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          valor_unitario: Math.abs(item.valor_unitario),
          precio_unitario: Math.abs(item.precio_unitario),
          descuento: item.descuento ? Math.abs(item.descuento) : item.descuento,
          subtotal: Math.abs(item.subtotal),
          sunat_concept_igv_type_id: item.sunat_concept_igv_type_id,
          igv: Math.abs(item.igv),
          total: Math.abs(item.total),
          account_plan_id: item.account_plan_id,
          anticipo_regularizacion: item.anticipo_regularizacion,
          anticipo_documento_serie: item.anticipo_documento_serie,
          anticipo_documento_numero: item.anticipo_documento_numero,
        })) || [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (creditNote) setNextNumber(creditNote.numero.toString());
  }, [creditNote, form]);

  const items =
    form.watch("items").sort((a, b) => {
      return a.anticipo_regularizacion === b.anticipo_regularizacion
        ? 0
        : a.anticipo_regularizacion
        ? 1
        : -1;
    }) || [];
  const observaciones = form.watch("observaciones") || "";
  const selectedSeries = form.watch("series");

  useEffect(() => {
    if (!originalDocument.aceptada_por_sunat || originalDocument.anulado)
      notFound();
  }, [originalDocument]);

  // Verify next credit note number when series changes
  useEffect(() => {
    const verifyNextNumber = async () => {
      if (!selectedSeries) {
        setNextNumber(null);
        setVerificationError(null);
        return;
      }

      setIsVerifying(true);
      setVerificationError(null);

      try {
        const response = await getNextCreditNoteNumber(
          originalDocument.id,
          parseInt(selectedSeries),
          originalDocument.sunat_concept_document_type_id
        );
        setNextNumber(response.number);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "No se puede generar nota de crédito para esta serie";
        setVerificationError(errorMessage);
        setNextNumber(null);
      } finally {
        setIsVerifying(false);
      }
    };

    if (!creditNote) verifyNextNumber();
  }, [
    selectedSeries,
    originalDocument.id,
    originalDocument.sunat_concept_document_type_id,
  ]);

  // Calculate totals
  const totalSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalIgv = items.reduce((sum, item) => sum + item.igv, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const orderedItems = originalDocument.items?.sort((a, b) => {
    return a.anticipo_regularizacion === b.anticipo_regularizacion
      ? 0
      : a.anticipo_regularizacion
      ? 1
      : -1;
  });
  console.log(form.formState.errors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Document Info */}

            <GroupFormSection
              title="Documento Original"
              icon={FileCheck}
              className="lg:col-span-2"
              iconColor="text-primary"
              bgColor="bg-primary/5"
              cols={{ sm: 1, md: 3 }}
            >
              <div>
                <Label className="text-muted-foreground text-xs">
                  Tipo de Documento
                </Label>
                <p className="font-semibold">
                  {originalDocument.document_type?.description}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Serie - Número
                </Label>
                <p className="font-semibold">
                  {originalDocument.serie}-{originalDocument.numero}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Moneda</Label>
                <p className="font-semibold">
                  {originalDocument.currency?.description}
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground text-xs">Cliente</Label>
                <p className="font-semibold">
                  {originalDocument.cliente_denominacion}
                </p>
                <p className="text-xs text-muted-foreground">
                  {originalDocument.cliente_numero_de_documento}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Total Original
                </Label>
                <p className="font-semibold text-lg">
                  {originalDocument.currency?.iso_code === "PEN" ? "S/" : "$"}{" "}
                  {originalDocument.total.toFixed(2)}
                </p>
              </div>
            </GroupFormSection>

            {/* Credit Note Configuration */}
            <GroupFormSection
              title="Configuración de Nota de Crédito"
              icon={NotepadText}
              className="lg:col-span-2"
              iconColor="text-primary"
              bgColor="bg-primary/5"
              cols={{ sm: 1, md: 2 }}
            >
              <FormSelect
                name="sunat_concept_credit_note_type_id"
                control={form.control}
                label="Tipo de Nota de Crédito"
                placeholder="Seleccione el tipo"
                options={creditNoteTypes.map((type) => ({
                  value: type.id.toString(),
                  label: type.description,
                }))}
                description="Seleccione el tipo de nota de crédito según SUNAT"
              />

              <FormSelect
                name="series"
                control={form.control}
                label="Serie"
                placeholder="Seleccione la serie"
                options={authorizedSeries.map((serie) => ({
                  value: serie.id.toString(),
                  label: serie.series,
                }))}
                description="Seleccione la serie autorizada para notas de crédito"
              />

              <DatePickerFormField
                control={form.control}
                name="fecha_de_emision"
                label="Fecha de Emisión *"
                placeholder="Seleccione fecha"
                description="Seleccione la fecha de emisión de la nota de crédito"
                disabledRange={{
                  before: new Date(),
                  after: new Date(),
                }}
              />

              {/* Series Verification */}
              {selectedSeries && (
                <div className="space-y-2 col-span-2">
                  {isVerifying ? (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <AlertDescription className="text-blue-700">
                        Verificando disponibilidad de serie...
                      </AlertDescription>
                    </Alert>
                  ) : verificationError ? (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {verificationError}
                      </AlertDescription>
                    </Alert>
                  ) : nextNumber ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        Siguiente número disponible:{" "}
                        <span className="font-semibold">{nextNumber}</span>
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              )}

              <div className="space-y-2 col-span-2">
                <Label>
                  Observaciones <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Ej: Cliente solicitó anulación por error en pedido"
                  rows={4}
                  maxLength={250}
                  className="resize-none"
                  {...form.register("observaciones")}
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {observaciones.length}/250 caracteres
                    {observaciones.length > 0 && observaciones.length < 10 && (
                      <span className="text-orange-600 ml-2">
                        (mínimo 10 caracteres)
                      </span>
                    )}
                  </span>
                </div>
                {form.formState.errors.observaciones && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.observaciones.message}
                  </p>
                )}
              </div>
            </GroupFormSection>

            {/* Items Section */}
            <GroupFormSection
              title="Items del Documento Original"
              icon={FileText}
              className="lg:col-span-2"
              iconColor="text-primary"
              bgColor="bg-primary/5"
              cols={{ sm: 1, md: 1 }}
            >
              <CreditNoteItemsTable
                originalDocument={originalDocument}
                items={orderedItems || []}
              />
              {form.formState.errors.items && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.items.message}
                </p>
              )}
            </GroupFormSection>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full sticky top-6 bg-linear-to-br from-blue-600/5 via-background to-muted/20 border-blue-600/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="size-5 text-blue-600" />
                    Resumen
                  </CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Nota de Crédito
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Items Summary */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    Items ({items.length})
                  </p>
                  <div className="space-y-2 pr-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-center text-muted-foreground py-4">
                        No hay items
                      </p>
                    ) : (
                      items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start gap-2 text-sm p-2 rounded bg-background/50 border border-muted-foreground/10"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs whitespace-pre-line">
                              {item.descripcion}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.cantidad} x{" "}
                              {originalDocument.currency?.iso_code === "PEN"
                                ? "S/"
                                : "$"}{" "}
                              {item.precio_unitario.toLocaleString("es-PE", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <p className="text-xs font-semibold whitespace-nowrap">
                            {originalDocument.currency?.iso_code === "PEN"
                              ? "S/"
                              : "$"}{" "}
                            {item.total.toLocaleString("es-PE", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <Separator />
                </div>

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {originalDocument.currency?.iso_code === "PEN"
                        ? "S/"
                        : "$"}{" "}
                      {totalSubtotal.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">IGV (18%)</span>
                    <span className="font-medium">
                      {originalDocument.currency?.iso_code === "PEN"
                        ? "S/"
                        : "$"}{" "}
                      {totalIgv.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <Separator className="bg-primary/20" />

                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-base font-semibold text-blue-700">
                      Total a Descontar
                    </span>
                    <span className="text-xl font-bold text-blue-700">
                      {originalDocument.currency?.iso_code === "PEN"
                        ? "S/"
                        : "$"}{" "}
                      {totalAmount.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="pt-4 flex justify-end flex-wrap gap-4">
                  <Button
                    type="submit"
                    className="truncate flex-1"
                    disabled={
                      isPending ||
                      !form.formState.isValid ||
                      isVerifying ||
                      !!verificationError
                    }
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : form.watch("enviar_automaticamente_a_la_sunat") ? (
                      <>
                        <Send className="size-4 mr-2" />
                        Generar y Enviar a SUNAT
                      </>
                    ) : (
                      <>
                        <FileCheck className="size-4 mr-2" />
                        {creditNote ? "Actualizar" : "Generar"} Nota de Crédito
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                </div>

                {/* Footer Info */}
                <div className="pt-4 border-t border-muted-foreground/10">
                  <p className="text-xs text-center text-muted-foreground">
                    Fecha de emisión:{" "}
                    {new Date(
                      form.watch("fecha_de_emision")
                    ).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <pre>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
        </pre>
      </form>
    </Form>
  );
}
