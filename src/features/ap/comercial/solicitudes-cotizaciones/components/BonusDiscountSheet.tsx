"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { ConceptDiscountBondResource } from "../lib/purchaseRequestQuote.interface";
import { cn } from "@/lib/utils";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { BonusDiscountRow } from "./BonusDiscountTable";

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
  const [openCombobox, setOpenCombobox] = useState(false);
  const [previousConceptId, setPreviousConceptId] = useState("");

  useEffect(() => {
    if (open) {
      const initial = initialValues ?? EMPTY_FORM;
      setForm(initial);
      setPreviousConceptId(initial.concept_id);
      setErrors({ concept_id: false, descripcion: false, valor: false });
      setOpenCombobox(false);
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
    setOpenCombobox(false);
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
      <div className="space-y-4 px-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Concepto</label>
          <Select
            value={form.concept_id}
            onValueChange={(value) => {
              setForm({ ...form, concept_id: value });
              setErrors({ ...errors, concept_id: false });
            }}
          >
            <SelectTrigger className={errors.concept_id ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecciona un concepto" />
            </SelectTrigger>
            <SelectContent>
              {conceptsOptions.map((option) => (
                <SelectItem key={option.id} value={option.id.toString()}>
                  {option.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.concept_id && (
            <p className="text-xs text-red-500 mt-1">Este campo es requerido</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Descripción</label>
          {descriptionOptions ? (
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  size="lg"
                  aria-expanded={openCombobox}
                  className={cn(
                    "w-full justify-between",
                    errors.descripcion && "border-red-500"
                  )}
                >
                  {form.descripcion || "Ingrese descripción"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar o escribir..."
                    value={form.descripcion}
                    onValueChange={(value) => {
                      setForm({ ...form, descripcion: value });
                      setErrors({ ...errors, descripcion: false });
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          No se encontraron resultados.
                        </p>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {descriptionOptions.map((option) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={(currentValue) => {
                            setForm({ ...form, descripcion: currentValue.toUpperCase() });
                            setErrors({ ...errors, descripcion: false });
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.descripcion === option ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <Input
              value={form.descripcion}
              onChange={(e) => {
                setForm({ ...form, descripcion: e.target.value });
                setErrors({ ...errors, descripcion: false });
              }}
              placeholder="Ingrese descripción"
              className={errors.descripcion ? "border-red-500" : ""}
            />
          )}
          {errors.descripcion && (
            <p className="text-xs text-red-500 mt-1">Este campo es requerido</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Valor</label>
          <Input
            type="number"
            value={form.valor || ""}
            onChange={(e) => {
              setForm({ ...form, valor: parseFloat(e.target.value) || 0 });
              setErrors({ ...errors, valor: false });
            }}
            placeholder="0.00"
            step="0.01"
            className={errors.valor ? "border-red-500" : ""}
          />
          {errors.valor && (
            <p className="text-xs text-red-500 mt-1">Ingrese un valor mayor a 0</p>
          )}
        </div>

        {form.valor > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-primary">Vista Previa</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Precio de Venta:</span>
                  <p className="font-medium">
                    {currencySymbol}{" "}
                    {costoReferencia.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">
                    Monto {form.isNegative ? "Descuento" : "Bono"}:
                  </span>
                  <p
                    className={`font-medium ${form.isNegative ? "text-red-600" : "text-primary"}`}
                  >
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
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                  <p className="text-xs text-red-800 font-medium">
                    Este descuento afectará el precio final del vehículo
                  </p>
                </div>
              )}
            </div>
          </div>
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
