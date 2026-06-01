"use client";

import { useForm, useWatch } from "react-hook-form";
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
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";
import { parseISO } from "date-fns";

// Schema solo para los campos editables
const editPlanningSchema = z.object({
  planned_start_datetime: z
    .string()
    .min(1, "La fecha y hora de inicio es requerida"),
  planned_end_datetime: z.string().min(1, "La fecha y hora fin es requerida"),
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
      planned_end_datetime: "",
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
        planned_end_datetime: planning.planned_end_datetime
          ? parseISO(planning.planned_end_datetime).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [planning, open, form]);

  const startDatetime = useWatch({
    control: form.control,
    name: "planned_start_datetime",
  });

  // Auto-calcular hora fin cuando cambia la hora inicio (usando estimated_hours del planning)
  useEffect(() => {
    if (!startDatetime || !planning?.estimated_hours) return;

    const start = new Date(startDatetime);
    if (isNaN(start.getTime())) return;

    const end = new Date(
      start.getTime() + planning.estimated_hours * 60 * 60 * 1000,
    );
    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, "0");
    const day = String(end.getDate()).padStart(2, "0");
    const hours = String(end.getHours()).padStart(2, "0");
    const minutes = String(end.getMinutes()).padStart(2, "0");
    form.setValue(
      "planned_end_datetime",
      `${year}-${month}-${day}T${hours}:${minutes}`,
    );
  }, [startDatetime, planning?.estimated_hours, form]);

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

            <DateTimePickerForm
              name="planned_end_datetime"
              label="Fecha y Hora de Fin"
              control={form.control}
              placeholder="Seleccione fecha y hora"
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
