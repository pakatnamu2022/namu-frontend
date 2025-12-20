import { useState, useRef, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Info, Package, Plus } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ElectronicDocumentSchema,
  ElectronicDocumentItemSchema,
} from "../../lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { UNIT_MEASURES } from "../../lib/electronicDocument.constants";
import { ElectronicDocumentItemsTable } from "../ElectronicDocumentItemsTable";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useAllAccountingAccountPlan } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.hook";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { errorToast } from "@/core/core.function";
import { FormInput } from "@/shared/components/FormInput";

interface ItemsSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  igvTypes: SunatConceptsResource[];
  currencySymbol: string;
  porcentaje_de_igv: number;
  isAdvancePayment?: boolean;
  maxAdvanceAmount?: number;
  isFromQuotation?: boolean;
}

export function ItemsSection({
  form,
  igvTypes,
  currencySymbol,
  porcentaje_de_igv,
  isAdvancePayment = false,
  maxAdvanceAmount,
  isFromQuotation = false,
}: ItemsSectionProps) {
  const { data: accountPlans } = useAllAccountingAccountPlan();

  const [newItem, setNewItem] = useState({
    unidad_de_medida: "NIU",
    descripcion: "",
    cantidad: 1,
    precio_unitario: 0,
    descuento: 0,
    account_plan_id: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const items = form.watch("items") || [];
  const isAddItemDisabled = isFromQuotation || items.length >= 1;

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

  const openSheetForNewItem = () => {
    setNewItem({
      unidad_de_medida: "NIU",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0,
      account_plan_id: "",
    });
    setEditingIndex(null);
    setIsSheetOpen(true);
  };

  const addItem = () => {
    if (
      !newItem.descripcion ||
      newItem.precio_unitario <= 0 ||
      !newItem.account_plan_id
    )
      return;

    // Si es anticipo, solo permitir una línea
    if (isAdvancePayment && items.length >= 1) {
      return;
    }

    // Calcular valores según SUNAT:
    // Ejemplo: precio_unitario (con IGV) = 590, descuento = 200
    // 1. valor_unitario = precio sin IGV = 590 / 1.18 = 500
    // 2. precio_unitario = precio con IGV = 590
    // 3. descuento = 200 (se aplica sobre el valor_unitario)
    // 4. subtotal = (valor_unitario * cantidad) - descuento = 500 - 200 = 300
    // 5. igv = subtotal * 0.18 = 300 * 0.18 = 54
    // 6. total = subtotal + igv = 300 + 54 = 354
    const precio_con_igv_input = newItem.precio_unitario; // Lo que ingresa el usuario (CON IGV)
    const descuento = newItem.descuento || 0;
    const valor_unitario = precio_con_igv_input / (1 + porcentaje_de_igv / 100);
    const precio_unitario = precio_con_igv_input; // Precio CON IGV (sin descuento aplicado)
    const subtotal = valor_unitario * newItem.cantidad - descuento;
    const igv = subtotal * (porcentaje_de_igv / 100);
    const total = subtotal + igv;

    // Validar que el total no exceda el máximo permitido para anticipos
    if (isAdvancePayment && maxAdvanceAmount && total > maxAdvanceAmount) {
      errorToast(
        `El monto del anticipo no puede exceder ${currencySymbol} ${maxAdvanceAmount.toFixed(
          2
        )}`
      );
      return;
    }

    const item: ElectronicDocumentItemSchema = {
      unidad_de_medida: newItem.unidad_de_medida,
      descripcion: newItem.descripcion,
      cantidad: newItem.cantidad,
      valor_unitario: valor_unitario,
      precio_unitario: precio_unitario,
      descuento: descuento > 0 ? descuento : undefined,
      subtotal: subtotal,
      sunat_concept_igv_type_id:
        igvTypes.find((t) => t.code_nubefact === "1")?.id || 0,
      igv: igv,
      total: total,
      account_plan_id: newItem.account_plan_id.toString(),
      anticipo_regularizacion: isAdvancePayment ? false : undefined,
    };

    form.setValue("items", [...items, item]);
    setIsSheetOpen(false);
    setNewItem({
      unidad_de_medida: "NIU",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0,
      account_plan_id: "",
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    form.setValue("items", updatedItems);
    setEditingIndex(null);
  };

  const editItem = (index: number) => {
    const item = items[index];
    setNewItem({
      unidad_de_medida: item.unidad_de_medida,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      descuento: item.descuento || 0,
      account_plan_id: item.account_plan_id.toString(),
    });
    setEditingIndex(index);
    setIsSheetOpen(true);
  };

  const updateItem = () => {
    if (
      editingIndex === null ||
      !newItem.descripcion ||
      newItem.precio_unitario <= 0 ||
      !newItem.account_plan_id
    )
      return;

    // Calcular valores según SUNAT:
    // Ejemplo: precio_unitario (con IGV) = 590, descuento = 200
    // 1. valor_unitario = precio sin IGV = 590 / 1.18 = 500
    // 2. precio_unitario = precio con IGV = 590
    // 3. descuento = 200 (se aplica sobre el valor_unitario)
    // 4. subtotal = (valor_unitario * cantidad) - descuento = 500 - 200 = 300
    // 5. igv = subtotal * 0.18 = 300 * 0.18 = 54
    // 6. total = subtotal + igv = 300 + 54 = 354
    const precio_con_igv_input = newItem.precio_unitario; // Lo que ingresa el usuario (CON IGV)
    const descuento = newItem.descuento || 0;
    const valor_unitario = precio_con_igv_input / (1 + porcentaje_de_igv / 100);
    const precio_unitario = precio_con_igv_input; // Precio CON IGV (sin descuento aplicado)
    const subtotal = valor_unitario * newItem.cantidad - descuento;
    const igv = subtotal * (porcentaje_de_igv / 100);
    const total = subtotal + igv;

    // Validar que el total no exceda el máximo permitido para anticipos
    if (
      isAdvancePayment &&
      maxAdvanceAmount &&
      Number(total.toFixed(2)) > Number(maxAdvanceAmount.toFixed(2))
    ) {
      errorToast(
        `El monto del anticipo no puede exceder ${currencySymbol} ${maxAdvanceAmount.toFixed(
          2
        )}`
      );
      return;
    }

    const updatedItem: ElectronicDocumentItemSchema = {
      ...items[editingIndex],
      unidad_de_medida: newItem.unidad_de_medida,
      descripcion: newItem.descripcion,
      cantidad: newItem.cantidad,
      valor_unitario: valor_unitario,
      precio_unitario: precio_unitario,
      descuento: descuento > 0 ? descuento : undefined,
      subtotal: subtotal,
      igv: igv,
      total: total,
      account_plan_id: newItem.account_plan_id,
    };

    const updatedItems = [...items];
    updatedItems[editingIndex] = updatedItem;
    form.setValue("items", updatedItems);

    setIsSheetOpen(false);
    setNewItem({
      unidad_de_medida: "NIU",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0,
      account_plan_id: "",
    });
    setEditingIndex(null);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setNewItem({
      unidad_de_medida: "NIU",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0,
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

  return (
    <>
      <GroupFormSection
        title="Items"
        icon={Package}
        iconColor="text-primary"
        bgColor="bg-primary/5"
        cols={{ sm: 1 }}
        gap="gap-1"
      >
        <div className="flex items-end justify-between gap-4">
          {isAdvancePayment && (
            <Alert variant="info" className="text-sm p-2 w-fit">
              <AlertTitle className="flex items-center gap-2">
                <Info className="size-5" />
                Modo Anticipo: Solo puede agregar una línea.
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                {maxAdvanceAmount &&
                  ` Máximo permitido: ${currencySymbol} ${maxAdvanceAmount.toFixed(
                    2
                  )}`}
              </AlertDescription>
            </Alert>
          )}
          <Button
            type="button"
            onClick={openSheetForNewItem}
            disabled={isAddItemDisabled}
            className="gap-2"
            size="sm"
          >
            <Plus className="size-4" />
            Agregar Item
          </Button>
        </div>

        {form.formState.errors.items && (
          <p className="text-sm font-medium text-destructive mb-2">
            {form.formState.errors.items.message}
          </p>
        )}

        <ElectronicDocumentItemsTable
          items={items}
          currencySymbol={currencySymbol}
          onRemoveItem={removeItem}
          onEditItem={editItem}
          isAdvancePayment={isAdvancePayment}
        />
      </GroupFormSection>

      <GeneralSheet
        open={isSheetOpen}
        onClose={closeSheet}
        title={editingIndex !== null ? "Editar Item" : "Agregar Item"}
        side="right"
        className="max-w-lg!"
        modal={false}
        icon={editingIndex !== null ? "Pencil" : "Plus"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="item-description">Descripción *</Label>
              <Textarea
                ref={textareaRef}
                id="item-description"
                placeholder="Descripción del producto/servicio"
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
                disabled={isFromQuotation}
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
                disabled={isFromQuotation}
              />
            </div>

            <div className="flex flex-col gap-2">
              <FormInput
                name="item-price"
                label="Precio Unitario (Con IGV)"
                placeholder="Ej: 580.00"
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
                disabled={isFromQuotation && !isAdvancePayment}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="item-discount">
                Descuento (Sobre Precio Unitario)
              </Label>
              <Input
                id="item-discount"
                type="number"
                min="0"
                step="0.01"
                max={newItem.precio_unitario}
                value={newItem.descuento}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    descuento: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={isAdvancePayment}
              />
              {newItem.descuento > 0 && newItem.precio_unitario > 0 && (
                <p className="text-xs text-muted-foreground">
                  Precio con descuento: {currencySymbol}{" "}
                  {(newItem.precio_unitario - newItem.descuento).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={closeSheet}
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
