"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileCheck,
  Loader2,
  Send,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  User,
  FileText,
} from "lucide-react";
import {
  DebitNoteSchema,
  DebitNoteItemSchema,
} from "../../lib/electronicDocument.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { Textarea } from "@/components/ui/textarea";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { TYPE_RECEIPT_SERIES } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import { UNIT_MEASURES } from "../../lib/electronicDocument.constants";
import { useAllAccountingAccountPlan } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.hook";
import { ElectronicDocumentResource } from "../../lib/electronicDocument.interface";
import { DataTable } from "@/shared/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DEFAULT_IGV_PERCENTAGE } from "../../lib/electronicDocument.constants";
import { useAllCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { getNextDebitNoteNumber } from "../../lib/electronicDocument.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GroupFormSection } from "@/shared/components/GroupFormSection";

interface DebitNoteFormProps {
  originalDocument: ElectronicDocumentResource;
  onSubmit: (data: DebitNoteSchema) => void;
  isPending: boolean;
}

export function DebitNoteForm({
  originalDocument,
  onSubmit,
  isPending,
}: DebitNoteFormProps) {
  // Series verification states
  const [nextNumber, setNextNumber] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // Item management
  const [newItem, setNewItem] = useState({
    unidad_de_medida: "NIU",
    descripcion: "",
    cantidad: 1,
    precio_unitario: 0,
    account_plan_id: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: accountPlans } = useAllAccountingAccountPlan();
  const { data: customers = [] } = useAllCustomers();

  // Fetch debit note types from SUNAT
  const { data: debitNoteTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_DEBIT_NOTE_TYPE],
  });

  // Fetch IGV types
  const { data: igvTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE],
  });

  // Fetch authorized series for debit notes
  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: TYPE_RECEIPT_SERIES.NOTA_DEBITO,
  });

  // Calculate IGV percentage from customer
  const selectedCustomer = customers.find(
    (customer) => customer.id === originalDocument.client_id
  );
  const porcentaje_de_igv =
    selectedCustomer?.tax_class_type_igv || DEFAULT_IGV_PERCENTAGE;

  // Initialize form
  const form = useForm<DebitNoteSchema>({
    resolver: zodResolver(DebitNoteSchema as any),
    defaultValues: {
      sunat_concept_debit_note_type_id: "",
      series: "",
      observaciones: "",
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: false,
      items: [],
    },
  });

  const items = form.watch("items") || [];
  const observaciones = form.watch("observaciones") || "";
  const selectedSeries = form.watch("series");

  // Verify next debit note number when series changes
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
        const response = await getNextDebitNoteNumber(
          originalDocument.id,
          parseInt(selectedSeries),
          originalDocument.sunat_concept_document_type_id
        );
        setNextNumber(response.number);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "No se puede generar nota de débito para esta serie";
        setVerificationError(errorMessage);
        setNextNumber(null);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyNextNumber();
  }, [
    selectedSeries,
    originalDocument.id,
    originalDocument.sunat_concept_document_type_id,
  ]);

  // Auto-expand textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newItem.descripcion]);

  // Item management functions
  const openSheetForNewItem = () => {
    setNewItem({
      unidad_de_medida: "NIU",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      account_plan_id: "",
    });
    setEditingIndex(null);
    setIsItemSheetOpen(true);
  };

  const addItem = () => {
    if (
      !newItem.descripcion ||
      newItem.precio_unitario <= 0 ||
      !newItem.account_plan_id
    )
      return;

    // Calcular valores basados en el precio unitario y el IGV
    const precio_sin_igv =
      newItem.precio_unitario / (1 + porcentaje_de_igv / 100);
    const subtotal = precio_sin_igv * newItem.cantidad;
    const igv = subtotal * (porcentaje_de_igv / 100);
    const total = subtotal + igv;

    const item: DebitNoteItemSchema = {
      unidad_de_medida: newItem.unidad_de_medida,
      descripcion: newItem.descripcion,
      cantidad: newItem.cantidad,
      valor_unitario: precio_sin_igv,
      precio_unitario: newItem.precio_unitario,
      subtotal: subtotal,
      sunat_concept_igv_type_id:
        igvTypes.find((t) => t.code_nubefact === "1")?.id || 0,
      igv: igv,
      total: total,
      account_plan_id: Number(newItem.account_plan_id),
    };

    form.setValue("items", [...items, item]);
    setIsItemSheetOpen(false);
    setNewItem({
      unidad_de_medida: "NIU",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      account_plan_id: "",
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    form.setValue("items", updatedItems);
  };

  const editItem = (index: number) => {
    const item = items[index];
    setNewItem({
      unidad_de_medida: item.unidad_de_medida,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      account_plan_id: item.account_plan_id?.toString() || "",
    });
    setEditingIndex(index);
    setIsItemSheetOpen(true);
  };

  const updateItem = () => {
    if (
      editingIndex === null ||
      !newItem.descripcion ||
      newItem.precio_unitario <= 0 ||
      !newItem.account_plan_id
    )
      return;

    // Calcular valores basados en el precio unitario y el IGV
    const precio_sin_igv =
      newItem.precio_unitario / (1 + porcentaje_de_igv / 100);
    const subtotal = precio_sin_igv * newItem.cantidad;
    const igv = subtotal * (porcentaje_de_igv / 100);
    const total = subtotal + igv;

    const updatedItem: DebitNoteItemSchema = {
      ...items[editingIndex],
      unidad_de_medida: newItem.unidad_de_medida,
      descripcion: newItem.descripcion,
      cantidad: newItem.cantidad,
      valor_unitario: precio_sin_igv,
      precio_unitario: newItem.precio_unitario,
      subtotal: subtotal,
      igv: igv,
      total: total,
      account_plan_id: Number(newItem.account_plan_id),
    };

    const updatedItems = [...items];
    updatedItems[editingIndex] = updatedItem;
    form.setValue("items", updatedItems);

    setIsItemSheetOpen(false);
    setNewItem({
      unidad_de_medida: "NIU",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      account_plan_id: "",
    });
    setEditingIndex(null);
  };

  const closeItemSheet = () => {
    setIsItemSheetOpen(false);
    setNewItem({
      unidad_de_medida: "NIU",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      account_plan_id: "",
    });
    setEditingIndex(null);
  };

  const handleSaveItem = () => {
    if (editingIndex !== null) {
      updateItem();
    } else {
      addItem();
    }
  };

  // Calculate totals
  const totalSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalIgv = items.reduce((sum, item) => sum + item.igv, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  // Items table columns
  const itemsColumns: ColumnDef<DebitNoteItemSchema & { index: number }>[] = [
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.descripcion}</div>
      ),
    },
    {
      accessorKey: "cantidad",
      header: () => <div className="text-right">Cantidad</div>,
      cell: ({ getValue }) => {
        const cantidad = getValue() as number;
        return (
          <div className="text-right">
            {cantidad.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "precio_unitario",
      header: () => <div className="text-right">P. Unit.</div>,
      cell: ({ getValue }) => {
        const precio = getValue() as number;
        return (
          <div className="text-right">
            S/ {precio.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: () => <div className="text-right">Total</div>,
      cell: ({ getValue }) => {
        const total = getValue() as number;
        return (
          <div className="text-right font-semibold">
            S/ {total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editItem(row.original.index)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeItem(row.original.index)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
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
                  <Label className="text-muted-foreground text-xs">
                    Moneda
                  </Label>
                  <p className="font-semibold">
                    {originalDocument.currency?.description}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-xs">
                    Cliente
                  </Label>
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

              {/* Debit Note Configuration */}
              <GroupFormSection
                title="Información del Cliente"
                icon={User}
                className="lg:col-span-2"
                iconColor="text-primary"
                bgColor="bg-primary/5"
                cols={{ sm: 1, md: 1 }}
              >
                <FormSelect
                  name="sunat_concept_debit_note_type_id"
                  control={form.control}
                  label="Tipo de Nota de Débito"
                  placeholder="Seleccione el tipo"
                  options={debitNoteTypes.map((type) => ({
                    value: type.id.toString(),
                    label: type.description,
                  }))}
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
                  description="Seleccione la serie autorizada para notas de débito"
                />

                {/* Series Verification */}
                {selectedSeries && (
                  <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label>
                    Observaciones <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Ej: Ajuste por intereses de pago tardío"
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

                <div className="space-y-4 pt-2 border-t">
                  <h4 className="text-sm font-medium">Opciones de envío</h4>
                  <FormSwitch
                    name="enviar_automaticamente_a_la_sunat"
                    control={form.control}
                    text="Enviar automáticamente a SUNAT"
                  />
                  <FormSwitch
                    name="enviar_automaticamente_al_cliente"
                    control={form.control}
                    text="Enviar automáticamente al cliente"
                  />
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
                <div className="w-full flex justify-end">
                  <Button
                    type="button"
                    onClick={openSheetForNewItem}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Item
                  </Button>
                </div>
                {form.formState.errors.items && (
                  <p className="text-sm text-destructive mb-2">
                    {form.formState.errors.items.message}
                  </p>
                )}

                {items.length > 0 ? (
                  <div className="border rounded-lg">
                    <DataTable
                      columns={itemsColumns}
                      data={items.map((item, index) => ({ ...item, index }))}
                      isVisibleColumnFilter={false}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    No hay items agregados. Haga clic en "Agregar Item" para
                    comenzar.
                  </div>
                )}
              </GroupFormSection>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Items</CardTitle>
                  </div>
                </CardHeader>
                <CardContent></CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="h-full sticky top-6 bg-linear-to-br from-purple-600/5 via-background to-muted/20 border-purple-600/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileCheck className="size-5 text-purple-600" />
                      Resumen
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700"
                    >
                      Nota de Débito
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Items Summary */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      Items ({items.length})
                    </p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {items.length === 0 ? (
                        <p className="text-xs text-center text-muted-foreground py-4">
                          No hay items agregados
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
                      <span className="text-muted-foreground">
                        IGV ({porcentaje_de_igv}%)
                      </span>
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

                    <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <span className="text-base font-semibold text-purple-700">
                        Total a Cobrar
                      </span>
                      <span className="text-xl font-bold text-purple-700">
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
                  <div className="space-y-2 pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={
                        isPending ||
                        !form.formState.isValid ||
                        items.length === 0 ||
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
                          Generar Nota de Débito
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
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
                        originalDocument.fecha_de_emision + "T00:00:00"
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

      {/* Item Sheet */}
      <GeneralSheet
        open={isItemSheetOpen}
        onClose={closeItemSheet}
        title={editingIndex !== null ? "Editar Item" : "Agregar Item"}
        side="right"
        className="max-w-lg!"
        modal={false}
        icon={
          editingIndex !== null ? (
            <Pencil className="size-5 text-purple-600" />
          ) : (
            <Plus className="size-5 text-purple-600" />
          )
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="item-description">Descripción *</Label>
              <Textarea
                ref={textareaRef}
                id="item-description"
                placeholder="Descripción del concepto (ej: Intereses por pago tardío)"
                className="min-h-[100px] resize-none"
                value={newItem.descripcion}
                onChange={(e) =>
                  setNewItem({ ...newItem, descripcion: e.target.value })
                }
                onInput={adjustTextareaHeight}
              />
            </div>

            <div className="flex flex-col gap-2">
              <SearchableSelect
                label="Unidad de Medida *"
                onChange={(value) =>
                  setNewItem({ ...newItem, unidad_de_medida: value })
                }
                value={newItem.unidad_de_medida}
                options={UNIT_MEASURES.map((unit) => ({
                  value: unit.value,
                  label: unit.label,
                }))}
                className="w-full!"
                buttonSize="default"
              />
            </div>

            <div className="flex flex-col gap-2">
              <SearchableSelect
                label="Plan de Cuenta Contable *"
                onChange={(value) =>
                  setNewItem({ ...newItem, account_plan_id: value })
                }
                value={newItem.account_plan_id}
                options={
                  accountPlans?.map((plan) => ({
                    value: plan.id.toString(),
                    label: `${plan.account} - ${plan.description}`,
                  })) || []
                }
                className="w-full!"
                buttonSize="default"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="item-quantity">Cantidad *</Label>
              <Input
                id="item-quantity"
                type="number"
                min="0"
                step="0.01"
                value={newItem.cantidad}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    cantidad: parseFloat(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="item-price">Precio Unitario (Con IGV) *</Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                value={newItem.precio_unitario}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    precio_unitario: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={closeItemSheet}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveItem}
              className="flex-1"
              disabled={
                !newItem.descripcion ||
                newItem.precio_unitario <= 0 ||
                !newItem.account_plan_id
              }
            >
              {editingIndex !== null ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </div>
      </GeneralSheet>
    </>
  );
}
