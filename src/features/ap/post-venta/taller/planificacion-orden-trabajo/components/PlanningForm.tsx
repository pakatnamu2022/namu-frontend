"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  workOrderPlanningSchema,
  WorkOrderPlanningFormValues,
} from "../lib/workOrderPlanning.schema";
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";
import { useGetAllWorkOrder } from "../../orden-trabajo/lib/workOrder.hook";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";

interface PlanningFormProps {
  onSubmit: (data: WorkOrderPlanningFormValues) => void | Promise<void>;
  initialData?: WorkOrderPlanningResource;
  isLoading?: boolean;
}

export function PlanningForm({
  onSubmit,
  initialData,
  isLoading,
}: PlanningFormProps) {
  // Convertir ISO a formato datetime-local (yyyy-MM-ddTHH:mm)
  const toDatetimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<WorkOrderPlanningFormValues>({
    resolver: zodResolver(workOrderPlanningSchema),
    defaultValues: initialData
      ? {
          work_order_id: String(initialData.work_order_id),
          worker_id: String(initialData.worker_id),
          description: initialData.description,
          estimated_hours: String(initialData.estimated_hours),
          planned_start_datetime: initialData.planned_start_datetime
            ? toDatetimeLocal(initialData.planned_start_datetime)
            : toDatetimeLocal(new Date().toISOString()),
        }
      : {
          work_order_id: "",
          worker_id: "",
          description: "",
          estimated_hours: "",
          planned_start_datetime: toDatetimeLocal(new Date().toISOString()),
        },
  });

  const { data: workers = [], isLoading: isLoadingWorkers } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  const { data: workOrder = [], isLoading: isLoadingWorkOrder } =
    useGetAllWorkOrder();

  const handleFormSubmit = (data: WorkOrderPlanningFormValues) => {
    // Convertir datetime-local a ISO
    const formattedData = {
      ...data,
      planned_start_datetime: new Date(
        data.planned_start_datetime
      ).toISOString(),
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormSelect
          name="work_order_id"
          label="Orden de Trabajo"
          placeholder="Seleccione una orden"
          options={workOrder.map((item) => ({
            label: `#${item.correlative} - ${item.vehicle_plate}`,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
          disabled={isLoadingWorkOrder}
        />

        <FormSelect
          name="worker_id"
          label="Operario"
          placeholder="Seleccione una operario"
          options={workers.map((item) => ({
            label: item.name,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
          disabled={isLoadingWorkers}
        />

        <FormInputText
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Describir la tarea a realizar"
          rows={4}
        />

        <FormInput
          control={form.control}
          name="estimated_hours"
          label="Horas Estimadas"
          placeholder="Ej: 2.5"
          type="number"
        />

        <FormInput
          control={form.control}
          name="planned_start_datetime"
          label="Fecha y Hora de Inicio Planificada"
          type="datetime-local"
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading || !form.formState.isValid}>
            {isLoading
              ? "Guardando..."
              : initialData
              ? "Actualizar"
              : "Crear Planificación"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
