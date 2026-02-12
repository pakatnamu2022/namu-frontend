"use client";

import { useEffect, useMemo } from "react";
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
import { FormCombobox } from "@/shared/components/FormCombobox";
import { WorkOrderItemResource } from "../../orden-trabajo-item/lib/workOrderItem.interface";

interface WorkOrderLabourFormProps {
  workOrderId: number;
  groupNumber: number;
  onSuccess: () => void;
  onCancel: () => void;
  workOrderItems?: WorkOrderItemResource[];
  currencySymbol?: string;
}

export default function WorkOrderLabourForm({
  workOrderId,
  groupNumber,
  onSuccess,
  onCancel,
  workOrderItems = [],
  currencySymbol = "S/",
}: WorkOrderLabourFormProps) {
  const storeMutation = useStoreWorkOrderLabour();

  const form = useForm<WorkOrderLabourFormValues>({
    resolver: zodResolver(workOrderLabourSchema),
    defaultValues: {
      description: "",
      time_spent: "",
      hourly_rate: "",
      discount_percentage: "0",
      work_order_id: workOrderId.toString(),
      group_number: groupNumber,
    },
  });

  const {
    data: consolidatedWorkers = [],
    isLoading: isLoadingConsolidatedWorkers,
  } = useGetConsolidatedWorkers(workOrderId);

  // Crear opciones de descripción a partir de los items de la orden de trabajo
  const descriptionOptions = useMemo(() => {
    return workOrderItems.map((item) => ({
      label: item.description,
      value: item.description,
      description: item.type_planning_name,
    }));
  }, [workOrderItems]);

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
      discount_percentage: data.discount_percentage,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormCombobox
          name="description"
          label="Descripción"
          placeholder="Seleccione o escriba una descripción..."
          options={descriptionOptions}
          control={form.control}
          allowCreate={true}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FormInput
            name="time_spent"
            label="Horas"
            placeholder="Ej: 2.5"
            control={form.control}
          />

          <FormInput
            name="hourly_rate"
            label={`Tarifa/Hora (${currencySymbol})`}
            placeholder="Ej: 50.00"
            control={form.control}
          />

          <FormInput
            name="discount_percentage"
            label="Descuento (%)"
            placeholder="0.0"
            control={form.control}
          />

          <FormSelect
            name="worker_id"
            label="Operario"
            placeholder="Operario"
            options={consolidatedWorkers.map((item) => ({
              label: item.worker_name,
              value: item.worker_id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
            disabled={isLoadingConsolidatedWorkers}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} size="sm">
            Cancelar
          </Button>
          <Button type="submit" disabled={storeMutation.isPending} size="sm">
            {storeMutation.isPending ? "Guardando..." : "Agregar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
