"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { ConceptDiscountBondResource } from "../lib/purchaseRequestQuote.interface";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { BonusDiscountRow } from "./BonusDiscountTable";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { FormInput } from "@/shared/components/FormInput";
import { Option } from "@/core/core.interface";

const BONO_FINANCIERO_ID = "862";
const BONO_MARCA_ID = "861";
export const DESCUENTO_NUEVO_ID = "863";

const EMPTY_FORM: Omit<BonusDiscountRow, "id"> = {
  concept_id: "",
  descripcion: "",
  isPercentage: false,
  valor: 0,
  isNegative: false,
};

const getDescriptionOptions = (conceptId: string): string[] | null => {
  if (conceptId === BONO_FINANCIERO_ID) return ["MARCA", "BANCO", "AP"];
  if (conceptId === BONO_MARCA_ID)
    return ["BONO NCP", "BONO ESPECIAL", "PLAN NORTE", "BONO ADICIONAL (DERCO)"];
  return null;
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
    concept_id: false,
    descripcion: false,
    valor: false,
  });
  const [previousConceptId, setPreviousConceptId] = useState("");

  useEffect(() => {
    if (open) {
      const initial = initialValues ?? EMPTY_FORM;
      setForm(initial);
      setPreviousConceptId(initial.concept_id);
      setErrors({ concept_id: false, descripcion: false, valor: false });
    }
  }, [open]);

  useEffect(() => {
    if (form.concept_id && form.concept_id !== previousConceptId) {
      const isNegativeDiscount = form.concept_id === DESCUENTO_NUEVO_ID;
      setForm((prev) => ({
        ...prev,
        ...(mode === "add" ? { descripcion: "" } : {}),
        isNegative: isNegativeDiscount,
      }));
      setPreviousConceptId(form.concept_id);
    }
  }, [form.concept_id, previousConceptId, mode]);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({ concept_id: false, descripcion: false, valor: false });
    onClose();
  };

  const handleSubmit = () => {
    const newErrors = {
      concept_id: !form.concept_id,
      descripcion: !form.descripcion,
      valor: form.valor <= 0,
    };
    setErrors(newErrors);
    if (newErrors.concept_id || newErrors.descripcion || newErrors.valor) return;
    onSubmit(form);
    handleClose();
  };

  const descriptionOptions = getDescriptionOptions(form.concept_id);

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={mode === "add" ? "Agregar Bono / Descuento" : "Editar Bono / Descuento"}
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
            options={conceptsOptions.map((o): Option => ({ value: o.id.toString(), label: o.description }))}
            value={form.concept_id}
            onChange={(value) => {
              setForm({ ...form, concept_id: value });
              setErrors({ ...errors, concept_id: false });
            }}
            label="Concepto"
            placeholder="Selecciona un concepto"
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

        <div>
          {descriptionOptions ? (
            <SearchableSelect
              options={descriptionOptions.map((o): Option => ({ value: o, label: o }))}
              value={form.descripcion}
              onChange={(value) => {
                setForm({ ...form, descripcion: value });
                setErrors({ ...errors, descripcion: false });
              }}
              label="Descripción"
              placeholder="Selecciona una descripción"
              className={errors.descripcion ? "border-red-500" : ""}
              allowClear={false}
            />
          ) : (
            <FormInput
              name="descripcion"
              label="Descripción"
              value={form.descripcion}
              onChange={(e) => {
                setForm({ ...form, descripcion: e.target.value });
                setErrors({ ...errors, descripcion: false });
              }}
              required
              placeholder="Ingrese descripción"
              className={errors.descripcion ? "border-red-500" : ""}
              error={errors.descripcion ? "Este campo es requerido" : undefined}
            />
          )}
          {errors.descripcion && descriptionOptions && (
            <Alert variant="destructive" className="mt-1 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Este campo es requerido</AlertDescription>
            </Alert>
          )}
        </div>

        <div>
          <FormInput
            name="valor"
            label="Valor"
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
                    {costoReferencia.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="opacity-75">
                    Monto {form.isNegative ? "Descuento" : "Bono"}:
                  </span>
                  <p className="font-medium">
                    {form.isNegative ? "- " : ""}
                    {currencySymbol}{" "}
                    {form.isPercentage
                      ? ((costoReferencia * form.valor) / 100).toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })
                      : form.valor.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {form.concept_id === DESCUENTO_NUEVO_ID && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Este descuento afectará el precio final del vehículo</AlertDescription>
                </Alert>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
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
