"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook";
import { requiredStringId } from "@/shared/lib/global.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { useStoreWorkOrderItem } from "../lib/workOrderItem.hook";
import {
  WorkOrderItemRequest,
  WorkOrderItemResource,
} from "../lib/workOrderItem.interface";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { useAllTypesOperationsAppointment } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.hook";
import { useUpdateWorkOrderItems } from "../../orden-trabajo/lib/workOrder.hook";

const workOrderItemSchema = z.object({
  work_order_id: z.number(),
  group_number: z.number().int().min(1, "Número de grupo debe ser mayor a 0"),
  type_planning_id: requiredStringId("Tipo de planificación es requerido"),
  type_operation_id: requiredStringId("Tipo de operación es requerido"),
  description: z.string().min(1, "Descripción es requerida"),
});

type WorkOrderItemFormValues = z.infer<typeof workOrderItemSchema>;

interface WorkOrderItemFormProps {
  workOrderId: number;
  defaultGroupNumber: number;
  item?: WorkOrderItemResource;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WorkOrderItemForm({
  workOrderId,
  defaultGroupNumber,
  item,
  onSuccess,
  onCancel,
}: WorkOrderItemFormProps) {
  const isEditing = !!item;

  const { data: typesPlanning = [], isLoading: isLoadingTypes } =
    useAllTypesPlanning();

  const { data: typesOperation = [], isLoading: isLoadingTypesOperation } =
    useAllTypesOperationsAppointment();

  const storeMutation = useStoreWorkOrderItem();
  const updateMutation = useUpdateWorkOrderItems(workOrderId);

  const form = useForm<WorkOrderItemFormValues>({
    resolver: zodResolver(workOrderItemSchema),
    defaultValues: {
      work_order_id: workOrderId,
      group_number: item?.group_number ?? defaultGroupNumber,
      type_planning_id: item?.type_planning_id
        ? item.type_planning_id.toString()
        : "",
      type_operation_id: item?.type_operation_id
        ? item.type_operation_id.toString()
        : "",
      description: item?.description ?? "",
    },
  });

  const watchedTypePlanningId = useWatch({
    control: form.control,
    name: "type_planning_id",
  });

  const skipAutoSetRef = useRef(isEditing);

  useEffect(() => {
    if (!watchedTypePlanningId) return;
    if (isLoadingTypes || isLoadingTypesOperation) return;

    if (skipAutoSetRef.current) {
      skipAutoSetRef.current = false;
      return;
    }

    const planningSelected = typesPlanning.find(
      (tp) => tp.id.toString() === watchedTypePlanningId,
    );
    if (!planningSelected) return;

    const matchedOperation = typesOperation.find(
      (to) => to.description === planningSelected.description,
    );

    if (matchedOperation) {
      form.setValue("type_operation_id", matchedOperation.id.toString(), {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      form.setValue("type_operation_id", "", {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [
    watchedTypePlanningId,
    typesPlanning,
    typesOperation,
    form,
    isLoadingTypes,
    isLoadingTypesOperation,
  ]);

  const onSubmit = (data: WorkOrderItemFormValues) => {
    if (isEditing && item) {
      updateMutation.mutate(
        {
          id: item.id,
          type_planning_id: Number(data.type_planning_id),
          type_operation_id: Number(data.type_operation_id),
          description: data.description,
        },
        {
          onSuccess: () => {
            onSuccess();
          },
        },
      );
      return;
    }

    const payload: WorkOrderItemRequest = {
      work_order_id: data.work_order_id,
      group_number: data.group_number,
      type_planning_id: data.type_planning_id,
      type_operation_id: data.type_operation_id, // Aquí podrías agregar un campo adicional en el formulario si es necesario
      description: data.description,
    };

    storeMutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      },
    });
  };

  const isPending = storeMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <FormSelect
          name="type_operation_id"
          label="Tipo de Operación"
          placeholder="Seleccione operación"
          options={typesOperation.map((item) => ({
            label: item.description,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
          disabled={isLoadingTypesOperation}
        />

        <FormTextArea
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Describa el trabajo de servicio..."
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Guardando..."
              : isEditing
                ? "Guardar Cambios"
                : "Agregar Trabajo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
