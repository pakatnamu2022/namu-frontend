"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook";
import { requiredStringId } from "@/shared/lib/global.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { useStoreWorkOrderItem } from "../lib/workOrderItem.hook";
import { WorkOrderItemRequest } from "../lib/workOrderItem.interface";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";

const workOrderItemSchema = z.object({
  work_order_id: z.number(),
  group_number: z.number().int().min(1, "Número de grupo debe ser mayor a 0"),
  type_planning_id: requiredStringId("Tipo de planificación es requerido"),
  description: z.string().min(1, "Descripción es requerida"),
});

type WorkOrderItemFormValues = z.infer<typeof workOrderItemSchema>;

interface WorkOrderItemFormProps {
  workOrderId: number;
  defaultGroupNumber: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WorkOrderItemForm({
  workOrderId,
  defaultGroupNumber,
  onSuccess,
  onCancel,
}: WorkOrderItemFormProps) {
  const { data: typesPlanning = [], isLoading: isLoadingTypes } =
    useAllTypesPlanning();

  const storeMutation = useStoreWorkOrderItem();

  const form = useForm<WorkOrderItemFormValues>({
    resolver: zodResolver(workOrderItemSchema),
    defaultValues: {
      work_order_id: workOrderId,
      group_number: defaultGroupNumber,
      type_planning_id: "",
      description: "",
    },
  });

  const onSubmit = (data: WorkOrderItemFormValues) => {
    const payload: WorkOrderItemRequest = {
      work_order_id: data.work_order_id,
      group_number: data.group_number,
      type_planning_id: data.type_planning_id,
      description: data.description,
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
        <FormInput
          control={form.control}
          name="group_number"
          label="Número de Grupo"
          type="number"
          placeholder="1"
        />

        <FormSelect
          name="type_planning_id"
          label="Tipo de Planificación"
          placeholder="Seleccione un tipo"
          options={typesPlanning.map((item) => ({
            label: item.description,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
          disabled={isLoadingTypes}
        />

        <FormInputText
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Describa el trabajo de servicio..."
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={storeMutation.isPending}>
            {storeMutation.isPending ? "Guardando..." : "Agregar Trabajo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
