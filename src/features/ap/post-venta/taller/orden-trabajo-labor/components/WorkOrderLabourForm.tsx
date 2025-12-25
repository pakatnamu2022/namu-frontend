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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStoreWorkOrderLabour } from "../lib/workOrderLabour.hook";
import { WorkOrderLabourRequest } from "../lib/workOrderLabour.interface";
import {
  workOrderLabourSchema,
  WorkOrderLabourFormValues,
} from "../lib/workOrderLabour.schema";

interface WorkOrderLabourFormProps {
  workOrderId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WorkOrderLabourForm({
  workOrderId,
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
    },
  });

  const onSubmit = (data: WorkOrderLabourFormValues) => {
    const payload: WorkOrderLabourRequest = {
      description: data.description,
      time_spent: data.time_spent,
      hourly_rate: data.hourly_rate,
      work_order_id: data.work_order_id,
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describa el trabajo de mano de obra realizado..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="time_spent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiempo Empleado (horas)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Ej: 2.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourly_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarifa por Hora (S/)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Ej: 50.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
