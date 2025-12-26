"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  planned_start_datetime: z.string().min(1, "La fecha y hora de inicio es requerida"),
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
  const form = useForm<EditPlanningFormData>({
    resolver: zodResolver(editPlanningSchema),
    defaultValues: {
      planned_start_datetime: planning?.planned_start_datetime || "",
      estimated_hours: planning?.estimated_hours?.toString() || "",
    },
  });

  // Actualizar valores cuando cambia el planning
  if (planning && open) {
    const currentDateTime = form.getValues("planned_start_datetime");
    const currentHours = form.getValues("estimated_hours");

    // Convertir la fecha ISO a formato local datetime (YYYY-MM-DDTHH:mm)
    let formattedDateTime = planning.planned_start_datetime;
    if (formattedDateTime) {
      const date = parseISO(formattedDateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    if (currentDateTime !== formattedDateTime) {
      form.setValue("planned_start_datetime", formattedDateTime);
    }
    if (currentHours !== planning.estimated_hours?.toString()) {
      form.setValue("estimated_hours", planning.estimated_hours?.toString() || "");
    }
  }

  const handleSubmit = (data: EditPlanningFormData) => {
    if (planning) {
      onSubmit(planning.id, data);
    }
  };

  const validateWorkingHours = (datetime: string): boolean => {
    if (!datetime) return false;

    const date = new Date(datetime);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    // 8:00 AM = 480 min, 1:00 PM = 780 min, 2:24 PM = 864 min, 6:00 PM = 1080 min
    const start = 8 * 60; // 8:00 AM
    const lunchStart = 13 * 60; // 1:00 PM
    const lunchEnd = 14 * 60 + 24; // 2:24 PM
    const end = 18 * 60; // 6:00 PM

    // Verificar que esté dentro del rango permitido
    if (timeInMinutes < start || timeInMinutes > end) {
      return false;
    }

    // Verificar que no esté en horario de almuerzo
    if (timeInMinutes >= lunchStart && timeInMinutes <= lunchEnd) {
      return false;
    }

    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Planificación</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
