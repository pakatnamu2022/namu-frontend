"use client";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
import { Loader2, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkScheduleSchema } from "../lib/work-schedule.schema";
import { WORK_SCHEDULE_STATUS_OPTIONS } from "../lib/work-schedule.constant";
import { WorkScheduleResource } from "../lib/work-schedule.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "@/shared/components/FormInput";

interface WorkScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WorkScheduleSchema) => void;
  isSubmitting?: boolean;
  codes: string[];
  periodId: number;
  workerId: number;
  workerName: string;
  selectedDate: Date;
  editingSchedule?: WorkScheduleResource | null;
}

export function WorkScheduleForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  codes,
  periodId,
  workerId,
  workerName,
  selectedDate,
  editingSchedule,
}: WorkScheduleFormProps) {
  const isEditing = !!editingSchedule;

  const form = useForm({
    defaultValues: {
      worker_id: workerId,
      code: editingSchedule?.work_type.code ?? codes[0] ?? "",
      period_id: periodId,
      work_date: editingSchedule?.work_date ?? selectedDate.toISOString(),
      hours_worked: editingSchedule?.hours_worked ?? null,
      extra_hours: editingSchedule?.extra_hours ?? 0,
      notes: editingSchedule?.notes ?? null,
      status: editingSchedule?.status ?? "WORKED",
    },
  });

  const handleSubmit = (data: any) => {
    const finalData: WorkScheduleSchema = {
      worker_id: data.worker_id,
      code: data.code,
      period_id: data.period_id,
      work_date: data.work_date,
      hours_worked: data.hours_worked ?? null,
      extra_hours: data.extra_hours ?? 0,
      notes: data.notes,
      status: data.status,
    };
    onSubmit(finalData);
  };

  const codeOptions = codes.map((c) => ({
    value: c,
    label: c,
  }));

  const statusOptions = WORK_SCHEDULE_STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar" : "Agregar"} Día de Trabajo
          </DialogTitle>
          <DialogDescription>
            {workerName} - {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormSelect
              control={form.control}
              name="code"
              label="Código"
              placeholder="Selecciona el código"
              options={codeOptions}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="hours_worked"
                label="Horas Trabajadas"
                type="number"
                placeholder="8"
              />

              <FormInput
                control={form.control}
                name="extra_hours"
                label="Horas Extra"
                type="number"
                placeholder="0"
              />
            </div>

            <FormSelect
              control={form.control}
              name="status"
              label="Estado"
              placeholder="Selecciona el estado"
              options={statusOptions}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales (opcional)"
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? "Actualizar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
