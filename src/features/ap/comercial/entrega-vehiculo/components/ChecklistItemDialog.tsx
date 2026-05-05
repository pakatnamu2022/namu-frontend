"use client";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Loader2 } from "lucide-react";

export interface ChecklistItemFormState {
  description: string;
  quantity: string;
  unit: string;
  observations: string;
}

interface ChecklistItemDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  form: ChecklistItemFormState;
  onChange: (form: ChecklistItemFormState) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function ChecklistItemDialog({
  open,
  onClose,
  mode,
  form,
  onChange,
  onSubmit,
  isPending,
}: ChecklistItemDialogProps) {
  const isAdd = mode === "add";

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      icon="PlusCircle"
      title={isAdd ? "Agregar ítem manual" : "Editar ítem"}
      size="md"
      childrenFooter={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!form.description.trim() || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isAdd ? "Agregar" : "Guardar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <FormInput
          name="description"
          label="Descripción"
          required
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder={isAdd ? "Ej. MANUAL DEL PROPIETARIO" : undefined}
          uppercase
        />
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            name="quantity"
            label="Cantidad"
            type="number"
            min={0}
            step="0.01"
            value={form.quantity}
            onChange={(e) => onChange({ ...form, quantity: e.target.value })}
          />
          <FormInput
            name="unit"
            label="Unidad"
            value={form.unit}
            onChange={(e) => onChange({ ...form, unit: e.target.value })}
            placeholder="Ej. UND"
            uppercase
          />
        </div>
        <FormTextArea
          name="observations"
          label="Observaciones"
          value={form.observations}
          onChange={(e) => onChange({ ...form, observations: e.target.value })}
          rows={2}
          className="resize-none"
          uppercase
        />
      </div>
    </GeneralModal>
  );
}
