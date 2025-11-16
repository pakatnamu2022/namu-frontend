"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { ElectronicDocumentItem } from "../lib/electronicDocument.interface";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import {
  DebitNoteSchema,
  DebitNoteItemSchema,
} from "../lib/electronicDocument.schema";
import { getNextDebitNoteNumber } from "../lib/electronicDocument.actions";
import { TYPE_RECEIPT_SERIES } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import { UNIT_MEASURES } from "../lib/electronicDocument.constants";
import { useAllAccountingAccountPlan } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.hook";
import { DataTable } from "@/shared/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

// Export the type for backward compatibility
export type DebitNoteData = DebitNoteSchema;

interface DebitNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: DebitNoteSchema) => void;
  documentItems: ElectronicDocumentItem[];
  documentId: number;
  documentType: number; // Tipo de documento original (29: Factura, 30: Boleta)
  fecha_de_emision: string; // Fecha de emisión del documento original
  isPending?: boolean;
  porcentaje_de_igv: number;
}

export function DebitNoteDialog({
  open,
  onClose,
  onConfirm,
  documentItems,
  documentId,
  documentType,
  isPending = false,
  porcentaje_de_igv,
}: DebitNoteDialogProps) {
  // State for next debit note number verification
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

  // Fetch IGV types
  const { data: igvTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE],
  });

  // Form setup
  const form = useForm<DebitNoteSchema>({
    resolver: zodResolver(DebitNoteSchema),
    defaultValues: {
      sunat_concept_debit_note_type_id: "",
      series: "",
      observaciones: "",
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: false,
      items: [],
    },
  });

  // Watch items
  const items = form.watch("items") || [];

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

  // Initialize with document items (optional - they can be modified or removed)
  useEffect(() => {
    if (documentItems.length > 0 && items.length === 0) {
      const mappedItems = documentItems.map((item) => ({
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
      }));
      form.setValue("items", mappedItems);
    }
  }, [documentItems, items.length, form]);

  // Fetch debit note types from SUNAT
  const { data: debitNoteTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_DEBIT_NOTE_TYPE],
  });

  // Fetch authorized series for debit notes (document_type_id: 32)
  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: TYPE_RECEIPT_SERIES.NOTA_DEBITO,
  });

  // Watch series field to verify next number
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
          documentId,
          parseInt(selectedSeries),
          documentType
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
  }, [selectedSeries, documentId, documentType]);

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

  // Handle form submission
  const handleSubmit = async (data: DebitNoteSchema) => {
    try {
      await onConfirm(data);
      handleClose();
    } catch (error) {
      // Error will be handled by the parent component
      console.error("Error creating debit note:", error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    form.reset();
    setNextNumber(null);
    setVerificationError(null);
    setIsVerifying(false);
    onClose();
  };

  // Watch observaciones for character count
  const observaciones = form.watch("observaciones") || "";

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={handleClose}
        title="Generar Nota de Débito"
        side="right"
        className="w-full sm:max-w-4xl overflow-y-auto"
        icon={<FileText className="h-5 w-5 text-purple-600" />}
      >
        <div className="space-y-6 pb-20">
          {/* Descripción */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              Complete la información requerida para generar la nota de débito.
              Puede agregar, editar o eliminar items según sea necesario.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Debit Note Type */}
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

              {/* Series */}
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

              {/* Verification Status */}
              {selectedSeries && (
                <div className="space-y-2">
                  {isVerifying && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verificando disponibilidad...</span>
                    </div>
                  )}

                  {!isVerifying && verificationError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                          Error de verificación
                        </p>
                        <p className="text-sm text-red-700">
                          {verificationError}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isVerifying && nextNumber && !verificationError && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          Serie verificada
                        </p>
                        <p className="text-sm text-green-700">
                          Siguiente número: <strong>{nextNumber}</strong>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Observaciones */}
              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Observaciones <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ej: Ajuste por intereses de pago tardío"
                        rows={4}
                        maxLength={250}
                        className="resize-none"
                      />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Send Options */}
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

              {/* Items Section */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Items</h4>
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
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.items.message}
                  </p>
                )}

                {items.length > 0 ? (
                  <>
                    <div className="rounded-lg">
                      <DataTable
                        columns={itemsColumns}
                        data={items.map((item, index) => ({ ...item, index }))}
                        isVisibleColumnFilter={false}
                      />
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Subtotal
                        </p>
                        <p className="text-lg font-semibold">
                          S/{" "}
                          {totalSubtotal.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          IGV ({porcentaje_de_igv}%)
                        </p>
                        <p className="text-lg font-semibold">
                          S/{" "}
                          {totalIgv.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-primary">
                          S/{" "}
                          {totalAmount.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    No hay items agregados. Haga clic en "Agregar Item" para
                    comenzar.
                  </div>
                )}
              </div>

              {/* Form Actions - Fixed at bottom */}
              <div className="fixed bottom-0 right-0 w-full sm:max-w-4xl bg-background border-t p-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending || isVerifying}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    isVerifying ||
                    !!verificationError ||
                    !nextNumber ||
                    items.length === 0
                  }
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Generar Nota de Débito"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </GeneralSheet>

      {/* Item Sheet */}
      <GeneralSheet
        open={isItemSheetOpen}
        onClose={closeItemSheet}
        title={editingIndex !== null ? "Editar Item" : "Agregar Item"}
        side="right"
        className="!max-w-lg"
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
                className="!w-full"
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
                className="!w-full"
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
