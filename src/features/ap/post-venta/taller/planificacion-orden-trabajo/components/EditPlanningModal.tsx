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
import { FormSelect } from "@/shared/components/FormSelect";
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";
import { parseISO } from "date-fns";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";

// Schema completo (planificación editable normalmente)
const editPlanningSchema = z.object({
  worker_id: z.string().min(1, "El técnico es requerido"),
  planned_start_datetime: z
    .string()
    .min(1, "La fecha y hora de inicio es requerida"),
  planned_end_datetime: z.string().min(1, "La fecha y hora fin es requerida"),
});

// Schema reducido: planificación completada, solo se puede cambiar el técnico
const editWorkerOnlySchema = z.object({
  worker_id: z.string().min(1, "El técnico es requerido"),
  planned_start_datetime: z.string().optional(),
  planned_end_datetime: z.string().optional(),
});

interface EditPlanningSubmitData {
  worker_id: number;
  planned_start_datetime?: string;
  planned_end_datetime?: string;
}

interface EditPlanningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planning: WorkOrderPlanningResource | null;
  onSubmit: (id: number, data: EditPlanningSubmitData) => void;
  isSubmitting?: boolean;
  sedeId?: string;
}

export function EditPlanningModal({
  open,
  onOpenChange,
  planning,
  onSubmit,
  isSubmitting = false,
  sedeId,
}: EditPlanningModalProps) {
  const isCompleted = planning?.status === "completed";

  const form = useForm({
    resolver: zodResolver(
      isCompleted ? editWorkerOnlySchema : editPlanningSchema,
    ),
    defaultValues: {
      worker_id: "",
      planned_start_datetime: "",
      planned_end_datetime: "",
    },
  });

  const { data: workers = [] } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    ...(sedeId
      ? { sede_id: Number(sedeId) }
      : { sede$empresa_id: EMPRESA_AP.id }),
  });

  // Actualizar valores cuando cambia el planning
  useEffect(() => {
    if (planning && open) {
      // Convertir la fecha ISO a formato local datetime (YYYY-MM-DDTHH:mm)
      const toLocalDateTime = (isoString: string): string => {
        const date = parseISO(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      form.reset({
        worker_id: planning.worker_id ? planning.worker_id.toString() : "",
        planned_start_datetime: planning.planned_start_datetime
          ? toLocalDateTime(planning.planned_start_datetime)
          : "",
        planned_end_datetime: planning.planned_end_datetime
          ? toLocalDateTime(planning.planned_end_datetime)
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
    if (isCompleted || !startDatetime || !planning?.estimated_hours) return;

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
  }, [startDatetime, planning?.estimated_hours, isCompleted, form]);

  const handleSubmit = (data: {
    worker_id: string;
    planned_start_datetime?: string;
    planned_end_datetime?: string;
  }): void => {
    if (!planning) return;

    if (isCompleted) {
      onSubmit(planning.id, { worker_id: Number(data.worker_id) });
      return;
    }

    onSubmit(planning.id, {
      worker_id: Number(data.worker_id),
      planned_start_datetime: data.planned_start_datetime,
      planned_end_datetime: data.planned_end_datetime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCompleted ? "Cambiar Operario" : "Editar Planificación"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Técnico asignado */}
            <FormSelect
              name="worker_id"
              label="Técnico"
              placeholder="Seleccione un técnico"
              options={workers.map((worker) => ({
                label: worker.name,
                value: worker.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
            />

            {!isCompleted && (
              <>
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
              </>
            )}

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
