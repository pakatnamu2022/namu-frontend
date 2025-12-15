"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useStoreOperatorWorkOrder } from "../lib/operatorWorkOrder.hook";
import { OperatorWorkOrderRequest } from "../lib/operatorWorkOrder.interface";
import {
  operatorWorkOrderSchema,
  OperatorWorkOrderFormData,
} from "../lib/operatorWorkOrder.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { EMPRESA_AP } from "@/core/core.constants";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";

interface OperatorWorkOrderFormProps {
  workOrderId: number;
  groupNumber: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function OperatorWorkOrderForm({
  workOrderId,
  groupNumber,
  onSuccess,
  onCancel,
}: OperatorWorkOrderFormProps) {
  const storeMutation = useStoreOperatorWorkOrder();

  const form = useForm<OperatorWorkOrderFormData>({
    resolver: zodResolver(operatorWorkOrderSchema),
    defaultValues: {
      work_order_id: workOrderId,
      group_number: groupNumber,
      operator_id: undefined,
      observations: "",
    },
  });

  const { data: operators = [], isLoading: isLoadingOperators } = useAllWorkers(
    {
      cargo_id: POSITION_TYPE.OPERATORS,
      status_id: STATUS_WORKER.ACTIVE,
      sede$empresa_id: EMPRESA_AP.id,
    }
  );

  const onSubmit = async (data: OperatorWorkOrderFormData) => {
    const payload: OperatorWorkOrderRequest = {
      work_order_id: data.work_order_id,
      group_number: data.group_number,
      operator_id: String(data.operator_id),
      observations: data.observations || "",
    };

    storeMutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Información del grupo */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-gray-900">
            Asignando operario para el Grupo {groupNumber}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Todos los items del grupo serán asignados a este operario
          </p>
        </div>

        {/* Seleccionar Operario */}
        <FormSelect
          name="operator_id"
          label="Operario"
          placeholder="Seleccione un operario..."
          options={operators.map((item) => ({
            label: `${item.name}`,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
          disabled={isLoadingOperators}
        />

        {/* Observaciones */}
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Instrucciones especiales para el operario..."
                  rows={4}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones */}
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
