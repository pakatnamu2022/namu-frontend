"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInputText } from "@/shared/components/FormInputText";
import { useGetAllWorkOrder } from "../../orden-trabajo/lib/workOrder.hook";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { requiredStringId, requiredText } from "@/shared/lib/global.schema";

const miniFormSchema = z.object({
  work_order_id: requiredStringId("La orden de trabajo es requerida"),
  description: requiredText("La descripción", 3, 255),
});

type MiniFormValues = z.infer<typeof miniFormSchema>;

interface PlanningMiniFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MiniFormValues) => void | Promise<void>;
  isLoading?: boolean;
  selectedWorkerName?: string;
  selectedTime?: string;
  estimatedHours?: number;
}

export function PlanningMiniForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  selectedWorkerName,
  selectedTime,
  estimatedHours,
}: PlanningMiniFormProps) {
  const form = useForm<MiniFormValues>({
    resolver: zodResolver(miniFormSchema),
    defaultValues: {
      work_order_id: "",
      description: "",
    },
  });

  const { data: workOrders = [], isLoading: isLoadingWorkOrders } =
    useGetAllWorkOrder();

  const handleFormSubmit = (data: MiniFormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Completar Planificación</DialogTitle>
        </DialogHeader>

        {selectedWorkerName && selectedTime && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
            <p className="text-sm text-muted-foreground">
              <strong>Operario:</strong> {selectedWorkerName}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Horario:</strong> {selectedTime}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Duración:</strong> {estimatedHours}h
            </p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormSelect
              name="work_order_id"
              label="Orden de Trabajo"
              placeholder="Seleccione una orden"
              options={workOrders.map((item) => ({
                label: `#${item.correlative} - ${item.vehicle_plate}`,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={isLoadingWorkOrders}
            />

            <FormInputText
              control={form.control}
              name="description"
              label="Descripción"
              placeholder="Describir la tarea a realizar"
              rows={4}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? "Guardando..." : "Crear Planificación"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
