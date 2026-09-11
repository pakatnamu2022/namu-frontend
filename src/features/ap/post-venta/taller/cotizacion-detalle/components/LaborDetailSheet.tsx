"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { FormInput } from "@/shared/components/FormInput";
import { FormCombobox } from "@/shared/components/FormCombobox";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import {
  DESCRIPTION_MATERIALES,
  ITEM_TYPE_LABOR,
  ITEM_TYPE_MATERIAL,
  ITEM_TYPE_TRANSLATOR,
} from "../lib/proformaDetails.constants";
import {
  laborDetailSchema,
  LaborDetailSchema,
} from "../lib/proformaDetails.schema";

const descriptionOptions = [
  { label: DESCRIPTION_MATERIALES, value: DESCRIPTION_MATERIALES },
];

interface LaborDetailSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: LaborDetailSchema) => Promise<void> | void;
  mode: "create" | "edit";
  quotationId: number;
  constManHours: number;
  currencyId: number;
  exchangeRate: number;
  maxDiscountAllowed: number;
  isApprovedDiscount: boolean;
  initialValue?: LaborDetailSchema;
  isSaving?: boolean;
}

const buildDefaultValues = (
  quotationId: number,
  constManHours: number,
  exchangeRate: number,
): LaborDetailSchema => ({
  order_quotation_id: quotationId,
  item_type: ITEM_TYPE_MATERIAL,
  description: "",
  quantity: 1,
  unit_measure: "Horas",
  unit_price: constManHours,
  discount_percentage: undefined as unknown as number,
  exchange_rate: exchangeRate,
  observations: "",
});

export default function LaborDetailSheet({
  open,
  onClose,
  onConfirm,
  mode,
  quotationId,
  constManHours,
  currencyId,
  exchangeRate,
  maxDiscountAllowed,
  isApprovedDiscount,
  initialValue,
  isSaving = false,
}: LaborDetailSheetProps) {
  const form = useForm({
    resolver: zodResolver(laborDetailSchema),
    defaultValues: buildDefaultValues(quotationId, constManHours, exchangeRate),
  });

  // Guarda el `description` que trae cada reset, para que el efecto de abajo
  // pueda ignorar el disparo que ocurre por el propio reset (que no debe
  // recalcular item_type, ya viene correcto desde initialValue) y reaccionar
  // solo a cambios de `description` hechos por el usuario.
  const lastResetDescriptionRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      const values =
        initialValue ??
        buildDefaultValues(quotationId, constManHours, exchangeRate);
      lastResetDescriptionRef.current = values.description;
      form.reset(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValue]);

  const description = form.watch("description");
  const itemType = form.watch("item_type");

  // El tipo se infiere de la descripción: solo si se seleccionó exactamente
  // la opción "Materiales" del combobox; cualquier otro texto es Mano de Obra.
  // El reset de arriba ya deja item_type correcto (viene de initialValue), así
  // que este efecto se salta el disparo cuyo `description` coincide con el
  // que acaba de fijar el reset, y solo actúa ante cambios reales del usuario.
  useEffect(() => {
    if (lastResetDescriptionRef.current === description) {
      return;
    }
    const autoType =
      description === DESCRIPTION_MATERIALES
        ? ITEM_TYPE_MATERIAL
        : ITEM_TYPE_LABOR;

    if (form.getValues("item_type") !== autoType) {
      form.setValue("item_type", autoType, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  const handleConfirm = form.handleSubmit(async (data) => {
    await onConfirm(data);
  });

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Agregar Mano de Obra" : "Editar Ítem"}
      subtitle="Complete los datos del ítem de mano de obra o materiales"
      icon="Wrench"
      size="2xl"
      childrenFooter={
        <div className="flex gap-2 w-full justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!form.formState.isValid || isSaving}
          >
            {mode === "create" ? "Agregar" : "Guardar"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormCombobox
            control={form.control}
            name="description"
            label={() => (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs md:text-sm">Descripción</span>
                <Badge
                  color={ITEM_TYPE_TRANSLATOR[itemType]?.color}
                  className="text-[10px]"
                >
                  {ITEM_TYPE_TRANSLATOR[itemType]?.label}
                </Badge>
              </div>
            )}
            placeholder="Ej: Cambio de aceite"
            options={descriptionOptions}
            allowCreate={true}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="quantity"
              label="Cant. (Horas)"
              placeholder="Ej: 1.5"
              inputMode="numeric"
              type="number"
            />

            <FormInput
              control={form.control}
              name="unit_price"
              label="Tarifa/Hora (S/.)"
              placeholder="Ej: Horas"
              type="number"
              description={
                currencyId === Number(CURRENCY_TYPE_IDS.DOLLARS)
                  ? "Ingresa la tarifa en soles, el sistema la convertirá automáticamente"
                  : undefined
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-1">
              <FormInput
                control={form.control}
                name="discount_percentage"
                label="Desc. %"
                placeholder="Ej: 0.00"
                className={isApprovedDiscount ? "border-green-400" : undefined}
                inputMode="numeric"
                type="number"
                min={0}
                max={maxDiscountAllowed}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : 0;
                  if (val > maxDiscountAllowed) {
                    form.setValue("discount_percentage", maxDiscountAllowed);
                  } else {
                    form.setValue("discount_percentage", val);
                  }
                }}
              />
              <p className="text-[10px] font-medium text-green-600">
                Máx. {isApprovedDiscount ? "aprobado" : "permitido"}:{" "}
                {maxDiscountAllowed.toFixed(2)}%
              </p>
            </div>

            <FormInput
              control={form.control}
              name="observations"
              label="Observaciones"
              placeholder="Ej: Observaciones adicionales"
            />
          </div>
        </div>
      </Form>
    </GeneralSheet>
  );
}
