"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  NotepadText,
  Info,
  Tag,
  List,
} from "lucide-react";
import {
  CreditNoteSchema,
  CREDIT_NOTE_TYPE_IDS,
} from "../../lib/electronicDocument.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { TYPE_RECEIPT_SERIES } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import { ElectronicDocumentResource } from "../../lib/electronicDocument.interface";
import { getNextCreditNoteNumber } from "../../lib/electronicDocument.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { notFound } from "@/shared/hooks/useNotFound";
import { format } from "date-fns";
import { useAllAccountingAccountPlan } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.hook";

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
  const [nextNumber, setNextNumber] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  const { data: creditNoteTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_CREDIT_NOTE_TYPE],
  });

  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: TYPE_RECEIPT_SERIES.NOTA_CREDITO,
  });

  const { data: allAccountingPlans = [] } = useAllAccountingAccountPlan({
    status: 1,
  });
  const accountingPlans = allAccountingPlans.filter((p) => p.status);

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
      discount_amount: undefined,
      account_plan_id: undefined,
      detail_ids: [],
      enviar_automaticamente_a_la_sunat: false,
      enviar_automaticamente_al_cliente: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (creditNote) setNextNumber(creditNote.numero.toString());
  }, [creditNote]);

  const selectedTypeIdStr = form.watch("sunat_concept_credit_note_type_id");
  const selectedTypeId = Number(selectedTypeIdStr || "0");
  const selectedSeries = form.watch("series");
  const observaciones = form.watch("observaciones") || "";
  const discountAmount = Number(form.watch("discount_amount") || 0);
  const detailIds = form.watch("detail_ids") || [];

  const isAnulacion = selectedTypeId === CREDIT_NOTE_TYPE_IDS.ANULACION;
  const isDescuentoGlobal =
    selectedTypeId === CREDIT_NOTE_TYPE_IDS.DESCUENTO_GLOBAL;
  const isDevolucionTotal =
    selectedTypeId === CREDIT_NOTE_TYPE_IDS.DEVOLUCION_TOTAL;
  const isDevolucionItem =
    selectedTypeId === CREDIT_NOTE_TYPE_IDS.DEVOLUCION_ITEM;

  // Reset type-specific fields when type changes
  const prevTypeRef = useRef<number>(0);
  useEffect(() => {
    if (prevTypeRef.current !== 0 && prevTypeRef.current !== selectedTypeId) {
      form.setValue("discount_amount", undefined);
      form.setValue("account_plan_id", undefined);
      form.setValue("detail_ids", [], { shouldValidate: true });
    }
    prevTypeRef.current = selectedTypeId;
  }, [selectedTypeId]);

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
        setVerificationError(
          error?.response?.data?.message ||
            "No se puede generar nota de crédito para esta serie"
        );
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

  const currency =
    originalDocument.currency?.iso_code === "PEN" ? "S/" : "$";

  const originalItems = originalDocument.items || [];
  const itemsWithId = originalItems.filter((item) => item.id != null);
  const selectedItems = originalItems.filter(
    (item) => item.id != null && detailIds.includes(item.id!)
  );

  const totalToCredit = isDescuentoGlobal
    ? discountAmount
    : isDevolucionItem
    ? selectedItems.reduce((sum, item) => sum + item.total, 0)
    : Math.abs(originalDocument.total);

  const allSelected =
    itemsWithId.length > 0 && detailIds.length === itemsWithId.length;
  const someSelected = detailIds.length > 0 && !allSelected;

  const handleItemToggle = (itemId: number, checked: boolean) => {
    const current = form.getValues("detail_ids") || [];
    form.setValue(
      "detail_ids",
      checked
        ? [...current, itemId]
        : current.filter((id) => id !== itemId),
      { shouldValidate: true }
    );
  };

  const handleToggleAll = (checked: boolean) => {
    form.setValue(
      "detail_ids",
      checked ? itemsWithId.map((i) => i.id!) : [],
      { shouldValidate: true }
    );
  };

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
              color="primary"
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
                  {currency} {Math.abs(originalDocument.total).toFixed(2)}
                </p>
              </div>
            </GroupFormSection>

            {/* Credit Note Configuration */}
            <GroupFormSection
              title="Configuración de Nota de Crédito"
              icon={NotepadText}
              color="primary"
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
                disabledRange={{ after: new Date() }}
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
                    {observaciones.length > 0 &&
                      observaciones.length < 10 && (
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

            {/* ── Type-specific sections ── */}

            {/* Types 01 / 06 — info only, backend copies items automatically */}
            {(isAnulacion || isDevolucionTotal) && (
              <GroupFormSection
                title={
                  isAnulacion
                    ? "Anulación de la operación"
                    : "Devolución total"
                }
                icon={Info}
                color="primary"
                cols={{ sm: 1, md: 1 }}
              >
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  <AlertDescription className="text-blue-700">
                    {isAnulacion
                      ? `Se anulará completamente el documento ${originalDocument.serie}-${originalDocument.numero} por un total de ${currency} ${Math.abs(originalDocument.total).toFixed(2)}. El sistema copiará automáticamente todos los ítems del documento original.`
                      : `Se realizará la devolución total del documento ${originalDocument.serie}-${originalDocument.numero} por un total de ${currency} ${Math.abs(originalDocument.total).toFixed(2)}. El sistema copiará automáticamente todos los ítems del documento original.`}
                  </AlertDescription>
                </Alert>
              </GroupFormSection>
            )}

            {/* Type 04 — Descuento global */}
            {isDescuentoGlobal && (
              <GroupFormSection
                title="Descuento Global"
                icon={Tag}
                color="primary"
                cols={{ sm: 1, md: 2 }}
              >
                <FormInput
                  name="discount_amount"
                  control={form.control}
                  label="Monto del descuento"
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder="0.00"
                  required
                  addonStart={
                    <span className="text-xs font-medium">{currency}</span>
                  }
                  description="Monto total del descuento, incluyendo IGV si aplica"
                />
                <FormSelect
                  name="account_plan_id"
                  control={form.control}
                  label="Cuenta contable"
                  placeholder="Seleccione la cuenta"
                  options={accountingPlans.map((plan) => ({
                    value: plan.id.toString(),
                    label: `${plan.account} - ${plan.description}`,
                  }))}
                  description="Cuenta contable para el descuento"
                  required
                />
              </GroupFormSection>
            )}

            {/* Type 07 — Devolución por ítem */}
            {isDevolucionItem && (
              <GroupFormSection
                title="Ítems a devolver"
                icon={List}
                color="primary"
                cols={{ sm: 1, md: 1 }}
              >
                {originalItems.length === 0 ? (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      El documento original no tiene ítems disponibles para
                      devolución.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Seleccione los ítems que desea devolver. Cada ítem se
                      devuelve en su cantidad y precio completos.
                    </p>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={allSelected}
                                data-state={
                                  someSelected ? "indeterminate" : undefined
                                }
                                onCheckedChange={(checked) =>
                                  handleToggleAll(!!checked)
                                }
                              />
                            </TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right w-20">
                              Cant.
                            </TableHead>
                            <TableHead className="text-right w-28">
                              P. Unit.
                            </TableHead>
                            <TableHead className="text-right w-28">
                              Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {originalItems.map((item, idx) => {
                            const isChecked =
                              item.id != null &&
                              detailIds.includes(item.id);
                            return (
                              <TableRow
                                key={item.id ?? idx}
                                className={
                                  isChecked ? "bg-blue-50/50" : ""
                                }
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={isChecked}
                                    disabled={item.id == null}
                                    onCheckedChange={(checked) => {
                                      if (item.id != null)
                                        handleItemToggle(item.id, !!checked);
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm font-medium">
                                    {item.descripcion}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.unidad_de_medida}
                                  </p>
                                </TableCell>
                                <TableCell className="text-right text-sm">
                                  {item.cantidad}
                                </TableCell>
                                <TableCell className="text-right text-sm">
                                  {currency}{" "}
                                  {item.precio_unitario.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-sm font-semibold">
                                  {currency} {item.total.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {form.formState.errors.detail_ids && (
                      <p className="text-sm text-destructive">
                        {(form.formState.errors.detail_ids as any).message}
                      </p>
                    )}

                    {detailIds.length > 0 && (
                      <p className="text-sm text-right text-muted-foreground">
                        {detailIds.length} ítem(s) seleccionado(s) — Total:{" "}
                        <span className="font-semibold text-foreground">
                          {currency}{" "}
                          {selectedItems
                            .reduce((sum, item) => sum + item.total, 0)
                            .toFixed(2)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </GroupFormSection>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 bg-linear-to-br from-blue-600/5 via-background to-muted/20 border-blue-600/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="size-5 text-blue-600" />
                    Resumen
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700"
                  >
                    Nota de Crédito
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Type info */}
                {selectedTypeId > 0 && (
                  <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="text-sm font-semibold">
                      {creditNoteTypes.find((t) => t.id === selectedTypeId)
                        ?.description || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Documento: {originalDocument.serie}-
                      {originalDocument.numero}
                    </p>
                  </div>
                )}

                {/* Selected items preview for type 07 */}
                {isDevolucionItem && selectedItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Ítems seleccionados ({selectedItems.length})
                    </p>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {selectedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start gap-2 text-xs p-2 rounded bg-background/50 border border-muted-foreground/10"
                        >
                          <p className="flex-1 min-w-0 font-medium leading-tight truncate">
                            {item.descripcion}
                          </p>
                          <p className="whitespace-nowrap font-semibold shrink-0">
                            {currency} {item.total.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                )}

                {/* Total to credit */}
                {selectedTypeId > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-sm font-semibold text-blue-700">
                      Total a Acreditar
                    </span>
                    <span className="text-xl font-bold text-blue-700">
                      {currency}{" "}
                      {totalToCredit.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="pt-2 flex justify-end flex-wrap gap-4">
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
                    ) : (
                      <>
                        <FileCheck className="size-4 mr-2" />
                        {creditNote ? "Actualizar" : "Generar"} Nota de
                        Crédito
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

                {/* Footer */}
                <div className="pt-2 border-t border-muted-foreground/10">
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
      </form>
    </Form>
  );
}
