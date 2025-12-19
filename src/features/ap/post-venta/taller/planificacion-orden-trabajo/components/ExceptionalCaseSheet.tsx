"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useIsTablet } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/shared/components/FormSelect";
import { useGetAllWorkOrder } from "../../orden-trabajo/lib/workOrder.hook";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { useCreateWorkOrderPlanning } from "../lib/workOrderPlanning.hook";
import { toast } from "sonner";
import {
  exceptionalCaseSchema,
  ExceptionalCaseFormValues,
} from "../lib/workOrderPlanning.schema";
import { Loader } from "lucide-react";

interface ExceptionalCaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sedeId?: string;
}

export function ExceptionalCaseSheet({
  open,
  onOpenChange,
  sedeId,
}: ExceptionalCaseSheetProps) {
  const isTablet = useIsTablet();

  const form = useForm<ExceptionalCaseFormValues>({
    resolver: zodResolver(exceptionalCaseSchema),
    defaultValues: {
      work_order_id: "",
      worker_id: "",
      description: "",
      estimated_hours: "",
      planned_start_datetime: "",
    },
    mode: "onChange",
  });

  const { data: workOrders = [] } = useGetAllWorkOrder({
    ...(sedeId ? { sede_id: Number(sedeId) } : {}),
  });

  const { data: workers = [] } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    ...(sedeId
      ? { sede_id: Number(sedeId) }
      : { sede$empresa_id: EMPRESA_AP.id }),
  });

  const createPlanningMutation = useCreateWorkOrderPlanning();

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleFormSubmit = async (data: ExceptionalCaseFormValues) => {
    try {
      await createPlanningMutation.mutateAsync({
        work_order_id: Number(data.work_order_id),
        worker_id: Number(data.worker_id),
        description: data.description,
        estimated_hours: Number(data.estimated_hours),
        planned_start_datetime: data.planned_start_datetime,
        type: "external", // Tipo especial para casos excepcionales
      });

      toast.success("Planificación excepcional creada correctamente");

      // Limpiar formulario y cerrar
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Error al crear la planificación excepcional"
      );
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Caso Excepcional"
      subtitle="Registre una planificación fuera del horario normal o para casos especiales donde el trabajador terminó antes de lo planificado."
      type={isTablet ? "tablet" : "default"}
      className="sm:max-w-2xl"
      icon="AlertTriangle"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Orden de Trabajo */}
          <FormSelect
            name="work_order_id"
            label="Orden de Trabajo"
            placeholder="Seleccione una orden"
            options={workOrders.map((order) => ({
              label: `${order.correlative} - ${order.vehicle_plate}`,
              value: order.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          {/* Operario */}
          <FormSelect
            name="worker_id"
            label="Operario"
            placeholder="Seleccione un operario"
            options={workers.map((worker) => ({
              label: worker.name,
              value: worker.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          {/* Descripción */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa el trabajo a realizar..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha y Hora de Inicio */}
          <FormField
            control={form.control}
            name="planned_start_datetime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha y Hora de Inicio</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duración */}
          <FormField
            control={form.control}
            name="estimated_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración del Trabajo (horas)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="Ej: 2.5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Ingrese la duración real del trabajo en horas (puede usar
                  decimales)
                </p>
              </FormItem>
            )}
          />

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPlanningMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                createPlanningMutation.isPending || !form.formState.isValid
              }
            >
              <Loader
                className={`mr-2 h-4 w-4 ${
                  !createPlanningMutation.isPending ? "hidden" : ""
                }`}
              />
              {createPlanningMutation.isPending
                ? "Guardando..."
                : "Guardar Planificación"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
}
