"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { useIsTablet } from "@/hooks/use-tablet";
import { WorkOrderPlanningResource } from "../../planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  pauseWorkSchema,
  PauseWorkFormValues,
} from "../../planificacion-orden-trabajo/lib/workOrderPlanning.schema";

interface PauseWorkSheetProps {
  work: WorkOrderPlanningResource | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PauseWorkFormValues) => void;
}

export function PauseWorkSheet({
  work,
  open,
  onClose,
  onSubmit,
}: PauseWorkSheetProps) {
  const isTablet = useIsTablet();

  const pauseForm = useForm<PauseWorkFormValues>({
    resolver: zodResolver(pauseWorkSchema),
    defaultValues: {
      pause_reason: "",
    },
  });

  const handleClose = () => {
    pauseForm.reset();
    onClose();
  };

  const handleSubmit = (data: PauseWorkFormValues) => {
    onSubmit(data);
    pauseForm.reset();
  };

  if (!work) return null;

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={`Pausar Trabajo - ${work.work_order_correlative}`}
      type={isTablet ? "tablet" : "default"}
      className="sm:max-w-2xl"
    >
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">{work.description}</h3>
          <p className="text-sm text-muted-foreground">
            Orden: {work.work_order_correlative}
          </p>
          <p className="text-sm text-muted-foreground">
            Horas trabajadas: {Number(work.actual_hours).toFixed(1)}h
            {work.estimated_hours && ` / ${work.estimated_hours}h estimadas`}
          </p>
        </div>
        <Form {...pauseForm}>
          <form
            onSubmit={pauseForm.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={pauseForm.control}
              name="pause_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón de Pausa</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Esperando repuesto del almacén..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Pausar Trabajo
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </GeneralSheet>
  );
}
