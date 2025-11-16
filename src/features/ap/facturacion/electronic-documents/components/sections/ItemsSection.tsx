import { useState, useRef, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Info, Package, Pencil, Plus } from "lucide-react";
import { GroupFormSection } from "@/src/shared/components/GroupFormSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ElectronicDocumentSchema,
  ElectronicDocumentItemSchema,
} from "../../lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/src/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { UNIT_MEASURES } from "../../lib/electronicDocument.constants";
import { ElectronicDocumentItemsTable } from "../ElectronicDocumentItemsTable";
import { SearchableSelect } from "@/src/shared/components/SearchableSelect";
import { useAllAccountingAccountPlan } from "@/src/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.hook";
import GeneralSheet from "@/src/shared/components/GeneralSheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { errorToast } from "@/src/core/core.function";

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

    // Calcular valores basados en el precio unitario y el IGV global
    const precio_sin_igv =
      newItem.precio_unitario / (1 + porcentaje_de_igv / 100);
    const subtotal = precio_sin_igv * newItem.cantidad;
    const igv = subtotal * (porcentaje_de_igv / 100);
    const total = subtotal + igv;

    // Validar que el total no exceda el máximo permitido para anticipos
    if (isAdvancePayment && maxAdvanceAmount && total > maxAdvanceAmount) {
      errorToast(
        `El monto del anticipo no puede exceder ${currencySymbol} ${maxAdvanceAmount.toFixed(
          2
        )} (debe quedar al menos ${currencySymbol}1.00 para la factura final)`
      );
      return;
    }

    const item: ElectronicDocumentItemSchema = {
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
      precio_unitario: item.total,
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

    // Calcular valores basados en el precio unitario y el IGV global
    const precio_sin_igv =
      newItem.precio_unitario / (1 + porcentaje_de_igv / 100);
    const subtotal = precio_sin_igv * newItem.cantidad;
    const igv = subtotal * (porcentaje_de_igv / 100);
    const total = subtotal + igv;

    // Validar que el total no exceda el máximo permitido para anticipos
    if (isAdvancePayment && maxAdvanceAmount && total > maxAdvanceAmount) {
      errorToast(
        `El monto del anticipo no puede exceder ${currencySymbol} ${maxAdvanceAmount.toFixed(
          2
        )} (debe quedar al menos ${currencySymbol}1.00 para la factura final)`
      );
      return;
    }

    const updatedItem: ElectronicDocumentItemSchema = {
      ...items[editingIndex],
      unidad_de_medida: newItem.unidad_de_medida,
      descripcion: newItem.descripcion,
      cantidad: newItem.cantidad,
      valor_unitario: precio_sin_igv,
      precio_unitario: newItem.precio_unitario,
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
                  )} (se reserva ${currencySymbol}1.00 para factura final)`}
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
        className="!max-w-lg"
        modal={false}
        icon={
          editingIndex !== null ? (
            <Pencil className="size-5 text-primary" />
          ) : (
            <Plus className="size-5 text-primary" />
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
