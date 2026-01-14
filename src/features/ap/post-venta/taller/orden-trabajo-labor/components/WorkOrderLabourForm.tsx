"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useStoreWorkOrderLabour } from "../lib/workOrderLabour.hook";
import { WorkOrderLabourRequest } from "../lib/workOrderLabour.interface";
import {
  workOrderLabourSchema,
  WorkOrderLabourFormValues,
} from "../lib/workOrderLabour.schema";
import { useGetConsolidatedWorkers } from "../../planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";

interface WorkOrderLabourFormProps {
  workOrderId: number;
  groupNumber: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WorkOrderLabourForm({
  workOrderId,
  groupNumber,
  onSuccess,
  onCancel,
}: WorkOrderLabourFormProps) {
  const storeMutation = useStoreWorkOrderLabour();

  const form = useForm<WorkOrderLabourFormValues>({
    resolver: zodResolver(workOrderLabourSchema),
    defaultValues: {
      description: "",
      time_spent: "",
      hourly_rate: "",
      work_order_id: workOrderId.toString(),
      group_number: groupNumber,
    },
  });

  const {
    data: consolidatedWorkers = [],
    isLoading: isLoadingConsolidatedWorkers,
  } = useGetConsolidatedWorkers(workOrderId);

  // Auto-seleccionar el operario si solo hay uno disponible
  useEffect(() => {
    if (consolidatedWorkers.length === 1) {
      form.setValue("worker_id", consolidatedWorkers[0].worker_id.toString());
    }
  }, [consolidatedWorkers, form]);

  const onSubmit = (data: WorkOrderLabourFormValues) => {
    const payload: WorkOrderLabourRequest = {
      description: data.description,
      time_spent: data.time_spent,
      hourly_rate: data.hourly_rate,
      work_order_id: data.work_order_id,
      worker_id: Number(data.worker_id),
      group_number: data.group_number,
    };

    storeMutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInputText
          name="description"
          label="Descripción"
          placeholder="Describa el trabajo de mano de obra realizado..."
          rows={4}
          control={form.control}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="time_spent"
            label="Tiempo Empleado (horas)"
            placeholder="Ej: 2.5"
            control={form.control}
          />

          <FormInput
            name="hourly_rate"
            label="Tarifa por Hora (S/)"
            placeholder="Ej: 50.00"
            control={form.control}
          />

          <FormSelect
            name="worker_id"
            label="Operario (Opcional)"
            placeholder="Seleccione un operario"
            options={consolidatedWorkers.map((item) => ({
              label: item.worker_name,
              value: item.worker_id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
            disabled={isLoadingConsolidatedWorkers}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={storeMutation.isPending}>
            {storeMutation.isPending ? "Guardando..." : "Agregar Mano de Obra"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
