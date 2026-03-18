"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const idPrefix = isAdd ? "add" : "edit";

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
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-description`}>
            Descripción <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-description`}
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            placeholder={isAdd ? "Ej. MANUAL DEL PROPIETARIO" : undefined}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-quantity`}>Cantidad</Label>
            <Input
              id={`${idPrefix}-quantity`}
              type="number"
              min={0}
              step="0.01"
              value={form.quantity}
              onChange={(e) => onChange({ ...form, quantity: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-unit`}>Unidad</Label>
            <Input
              id={`${idPrefix}-unit`}
              value={form.unit}
              onChange={(e) => onChange({ ...form, unit: e.target.value })}
              placeholder="Ej. UND"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-observations`}>Observaciones</Label>
          <Textarea
            id={`${idPrefix}-observations`}
            value={form.observations}
            onChange={(e) =>
              onChange({ ...form, observations: e.target.value })
            }
            rows={2}
            className="resize-none"
          />
        </div>
      </div>
    </GeneralModal>
  );
}
