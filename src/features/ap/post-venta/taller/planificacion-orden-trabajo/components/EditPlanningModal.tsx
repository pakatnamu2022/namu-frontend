"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { FormInput } from "@/shared/components/FormInput";
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";
import { parseISO } from "date-fns";

// Schema solo para los campos editables
const editPlanningSchema = z.object({
  planned_start_datetime: z
    .string()
    .min(1, "La fecha y hora de inicio es requerida"),
  estimated_hours: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine(
      (val) => {
        if (!val || val.trim() === "") return false;
        const num = Number(val);
        return !isNaN(num) && num >= 0.5;
      },
      { message: "Las horas estimadas deben ser un número mayor o igual a 0.5" }
    ),
});

type EditPlanningFormData = z.infer<typeof editPlanningSchema>;

interface EditPlanningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planning: WorkOrderPlanningResource | null;
  onSubmit: (id: number, data: EditPlanningFormData) => void;
  isSubmitting?: boolean;
}

export function EditPlanningModal({
  open,
  onOpenChange,
  planning,
  onSubmit,
  isSubmitting = false,
}: EditPlanningModalProps) {
  const form = useForm({
    resolver: zodResolver(editPlanningSchema),
    defaultValues: {
      planned_start_datetime: "",
      estimated_hours: "",
    },
  });

  // Actualizar valores cuando cambia el planning
  useEffect(() => {
    if (planning && open) {
      // Convertir la fecha ISO a formato local datetime (YYYY-MM-DDTHH:mm)
      let formattedDateTime = "";
      if (planning.planned_start_datetime) {
        const date = parseISO(planning.planned_start_datetime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      form.reset({
        planned_start_datetime: formattedDateTime,
        estimated_hours: planning.estimated_hours?.toString() || "",
      });
    }
  }, [planning, open, form]);

  const handleSubmit = (data: any): void => {
    if (planning) {
      onSubmit(planning.id, data as EditPlanningFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Planificación</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Fecha y Hora de Inicio con validación */}
            <DateTimePickerForm
              name="planned_start_datetime"
              label="Fecha y Hora de Inicio"
              control={form.control}
              placeholder="Seleccione fecha y hora"
              description="Horario permitido: 8:00 AM - 6:00 PM (excluyendo 1:00 PM - 2:24 PM)"
            />

            {/* Duración */}
            <FormInput
              name="estimated_hours"
              label="Duración del Trabajo (horas)"
              placeholder="Ej: 2.5"
              control={form.control}
              type="text"
              description="Ingrese la duración real del trabajo en horas (puede usar decimales)"
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
