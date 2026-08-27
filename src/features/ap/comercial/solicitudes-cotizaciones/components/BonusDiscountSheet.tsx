"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { ConceptDiscountBondResource } from "../lib/purchaseRequestQuote.interface";
import { useConceptDiscountBondDescriptions } from "../lib/purchaseRequestQuote.hook";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { BonusDiscountRow } from "./BonusDiscountTable";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { Form } from "@/components/ui/form";
import { Option } from "@/core/core.interface";

const DEDUCCION_7_FACTOR = 0.93;

export const BONO_FINANCIERO_ID = "862";
export const BONO_MARCA_ID = "861";
export const DESCUENTO_NUEVO_ID = "863";

const EMPTY_FORM: Omit<BonusDiscountRow, "id"> = {
  parent_concept_id: "",
  concept_id: "",
  concept_label: "",
  isPercentage: false,
  valor: 0,
  isNegative: false,
  hasRetention: false,
};

interface BonusDiscountSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<BonusDiscountRow, "id">) => void;
  conceptsOptions: ConceptDiscountBondResource[];
  costoReferencia: number;
  currencySymbol: string;
  initialValues?: Omit<BonusDiscountRow, "id">;
  mode: "add" | "edit";
}

export function BonusDiscountSheet({
  open,
  onClose,
  onSubmit,
  conceptsOptions,
  costoReferencia,
  currencySymbol,
  initialValues,
  mode,
}: BonusDiscountSheetProps) {
  const [form, setForm] = useState<Omit<BonusDiscountRow, "id">>(EMPTY_FORM);
  const [errors, setErrors] = useState({
    parent_concept_id: false,
    concept_id: false,
    valor: false,
  });
  const [previousParentConceptId, setPreviousParentConceptId] = useState("");

  const deduccionForm = useForm<{ isDeduced: boolean }>({
    defaultValues: { isDeduced: false },
  });
  const isDeduced = deduccionForm.watch("isDeduced");
  // El usuario SIEMPRE ingresa el valor bruto en el campo "Valor". El monto
  // que realmente se guarda / afecta el precio es el neto (bruto x 0.93 cuando
  // aplica retención). Se calcula aquí, se muestra en la Vista Previa y se
  // envía en handleSubmit: el asesor no tiene que sacar el 7% con calculadora.
  const valorEfectivo =
    isDeduced
      ? Math.round(form.valor * DEDUCCION_7_FACTOR * 100) / 100
      : form.valor;

  // Monto en la moneda del vehículo (resuelve el % contra el precio de venta),
  // en bruto y en neto, para la Vista Previa.
  const montoBruto = form.isPercentage
    ? (costoReferencia * form.valor) / 100
    : form.valor;
  const montoEfectivo = isDeduced
    ? Math.round(montoBruto * DEDUCCION_7_FACTOR * 100) / 100
    : montoBruto;

  useEffect(() => {
    if (open) {
      const initial = initialValues ?? EMPTY_FORM;
      // `initial.valor` viene como neto (así se guarda). Para editar mostramos
      // el bruto en el campo, reconstruyéndolo, y que el flujo sea idéntico a
      // "agregar": ingresas bruto, ves el neto.
      const valorBruto =
        initial.hasRetention && initial.valor > 0
          ? Math.round((initial.valor / DEDUCCION_7_FACTOR) * 100) / 100
          : initial.valor;
      setForm({ ...initial, valor: valorBruto });
      setPreviousParentConceptId(initial.parent_concept_id);
      setErrors({ parent_concept_id: false, concept_id: false, valor: false });
      deduccionForm.reset({ isDeduced: initial.hasRetention ?? false });
    }
  }, [open]);

  // Al cambiar el concepto raíz (Concepto), se limpia la descripción elegida
  useEffect(() => {
    if (
      form.parent_concept_id &&
      form.parent_concept_id !== previousParentConceptId
    ) {
      setForm((prev) => ({
        ...prev,
        ...(mode === "add"
          ? { concept_id: "", concept_label: "", isNegative: false }
          : {}),
      }));
      setPreviousParentConceptId(form.parent_concept_id);
    }
  }, [form.parent_concept_id, previousParentConceptId, mode]);

  const {
    data: bondDescriptions = [],
    isLoading: isLoadingDescriptions,
  } = useConceptDiscountBondDescriptions(form.parent_concept_id || undefined);

  // Si el concepto raíz elegido no tiene hijos (ej. DESCUENTO NUEVO), el
  // concept_id final es el propio raíz y no se pide una segunda selección.
  useEffect(() => {
    if (!form.parent_concept_id || isLoadingDescriptions) return;
    if (
      bondDescriptions.length === 0 &&
      form.concept_id !== form.parent_concept_id
    ) {
      const parent = conceptsOptions.find(
        (o) => o.id.toString() === form.parent_concept_id,
      );
      setForm((prev) => ({
        ...prev,
        concept_id: prev.parent_concept_id,
        concept_label: parent?.description ?? "",
        isNegative: true,
      }));
    }
  }, [
    form.parent_concept_id,
    form.concept_id,
    bondDescriptions,
    isLoadingDescriptions,
    conceptsOptions,
  ]);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({ parent_concept_id: false, concept_id: false, valor: false });
    deduccionForm.reset({ isDeduced: false });
    onClose();
  };

  const requiresDescriptionSelect = bondDescriptions.length > 0;

  const handleSubmit = () => {
    const newErrors = {
      parent_concept_id: !form.parent_concept_id,
      concept_id: requiresDescriptionSelect && !form.concept_id,
      valor: form.valor <= 0,
    };
    setErrors(newErrors);
    if (newErrors.parent_concept_id || newErrors.concept_id || newErrors.valor)
      return;
    onSubmit({ ...form, valor: valorEfectivo, hasRetention: isDeduced });
    handleClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={
        mode === "add" ? "Agregar Bono / Descuento" : "Editar Bono / Descuento"
      }
      subtitle={
        mode === "add"
          ? "Agrega un nuevo bono o descuento a la cotización"
          : "Modifica los datos del bono o descuento seleccionado"
      }
      icon={mode === "add" ? "Gift" : "Edit2"}
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <SearchableSelect
            options={conceptsOptions.map(
              (o): Option => ({ value: o.id.toString(), label: o.description }),
            )}
            value={form.parent_concept_id}
            onChange={(value) => {
              setForm({ ...form, parent_concept_id: value });
              setErrors({ ...errors, parent_concept_id: false });
            }}
            label="Concepto"
            placeholder="Selecciona un concepto"
            className={errors.parent_concept_id ? "border-red-500" : ""}
            allowClear={false}
            buttonSize="default"
          />
          {errors.parent_concept_id && (
            <Alert variant="destructive" className="mt-1 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Este campo es requerido</AlertDescription>
            </Alert>
          )}
        </div>

        {requiresDescriptionSelect && (
          <div>
            <SearchableSelect
              options={bondDescriptions.map(
                (o): Option => ({ value: o.id.toString(), label: o.description }),
              )}
              value={form.concept_id}
              onChange={(value) => {
                const selected = bondDescriptions.find(
                  (o) => o.id.toString() === value,
                );
                setForm({
                  ...form,
                  concept_id: value,
                  concept_label: selected?.description ?? "",
                  isNegative: false,
                });
                setErrors({ ...errors, concept_id: false });
              }}
              label="Descripción"
              placeholder="Selecciona una descripción"
              className={errors.concept_id ? "border-red-500" : ""}
              allowClear={false}
              buttonSize="default"
            />
            {errors.concept_id && (
              <Alert variant="destructive" className="mt-1 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Este campo es requerido</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div>
          <FormInput
            name="valor"
            label={isDeduced ? "Valor bruto (antes del 7%)" : "Valor"}
            type="number"
            value={form.valor || ""}
            onChange={(e) => {
              setForm({ ...form, valor: parseFloat(e.target.value) || 0 });
              setErrors({ ...errors, valor: false });
            }}
            required
            placeholder="0.00"
            step="0.01"
            className={errors.valor ? "border-red-500" : ""}
            error={errors.valor ? "Ingrese un valor mayor a 0" : undefined}
          />
        </div>

        {!form.isNegative && (
          <Form {...deduccionForm}>
            <FormSwitch
              control={deduccionForm.control}
              name="isDeduced"
              text="Aplica retención 7%"
              textDescription="Ingresa el valor bruto: se guardará el neto (bruto − 7%). El resultado se ve abajo en Vista Previa."
              autoHeight
            />
          </Form>
        )}

        {form.valor > 0 && (
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Vista Previa</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="opacity-75">Precio de Venta:</span>
                  <p className="font-medium">
                    {currencySymbol}{" "}
                    {costoReferencia.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <span className="opacity-75">
                    Monto {form.isNegative ? "Descuento" : "Bono"}
                    {isDeduced ? " (neto)" : ""}:
                  </span>
                  <p className="font-medium">
                    {form.isNegative ? "- " : ""}
                    {currencySymbol}{" "}
                    {montoEfectivo.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  {isDeduced && (
                    <p className="text-xs opacity-75">
                      bruto {currencySymbol}{" "}
                      {montoBruto.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      − 7% ({currencySymbol}{" "}
                      {(montoBruto - montoEfectivo).toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                      )
                    </p>
                  )}
                </div>
              </div>
              {form.isNegative && (
                <div className="mt-2 flex items-center justify-between rounded-md bg-background/60 px-3 py-2">
                  <span className="text-sm opacity-75">
                    Precio final del vehículo:
                  </span>
                  <span className="font-semibold">
                    {currencySymbol}{" "}
                    {Math.max(costoReferencia - montoEfectivo, 0).toLocaleString(
                      "es-PE",
                      { minimumFractionDigits: 2 },
                    )}
                  </span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} className="flex-1">
            {mode === "add" ? "Agregar" : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </GeneralSheet>
  );
}
