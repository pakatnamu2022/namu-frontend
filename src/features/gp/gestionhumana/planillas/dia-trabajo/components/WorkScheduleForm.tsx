"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
import { WorkScheduleResource } from "../lib/work-schedule.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";

interface AttendanceCode {
  code: string;
  description: string | null;
}

interface WorkScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WorkScheduleSchema) => void;
  isSubmitting?: boolean;
  codes: AttendanceCode[];
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

  const codeOptions = codes.map((c) => ({
    value: c.code,
    label: c.description ? `${c.code} — ${c.description}` : c.code,
  }));

  const form = useForm({
    defaultValues: {
      worker_id: workerId,
      code: editingSchedule?.code ?? codes[0]?.code ?? "",
      period_id: periodId,
      work_date: editingSchedule
        ? format(new Date(editingSchedule.work_date + (editingSchedule.work_date.includes("T") ? "" : "T00:00:00")), "yyyy-MM-dd")
        : format(selectedDate, "yyyy-MM-dd"),
      notes: editingSchedule?.notes ?? null,
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit({
      worker_id: data.worker_id,
      code: data.code,
      period_id: data.period_id,
      work_date: data.work_date,
      notes: data.notes || null,
    });
  };

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
            {workerName} — {formattedDate}
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
              label="Código de asistencia"
              placeholder="Selecciona el código"
              options={codeOptions}
              required
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
