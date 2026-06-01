"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInDays, parseISO } from "date-fns";
import { CalendarRange, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { errorToast, successToast } from "@/core/core.function";
import { syncAttendanceRange } from "@/features/gp/gestionhumana/asistencias/lib/attendance.actions";

const today = new Date();
today.setHours(0, 0, 0, 0);

const schema = z
  .object({
    date_from: z.string().min(1, "Requerido"),
    date_to: z.string().min(1, "Requerido"),
  })
  .refine((d) => !d.date_from || !d.date_to || d.date_to >= d.date_from, {
    message: "Debe ser mayor o igual a la fecha inicio",
    path: ["date_to"],
  })
  .refine(
    (d) => {
      if (!d.date_from || !d.date_to) return true;
      return differenceInDays(parseISO(d.date_to), parseISO(d.date_from)) < 90;
    },
    { message: "El rango máximo es 90 días", path: ["date_to"] },
  );

type FormValues = z.infer<typeof schema>;

interface Props {
  onSynced?: () => void;
}

export default function AttendanceSyncRangeDialog({ onSynced }: Props) {
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date_from: "", date_to: "" },
    mode: "onChange",
  });

  const dateFrom = form.watch("date_from");

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await syncAttendanceRange(values);
      successToast(result.message ?? `Se despacharon ${result.days} jobs`);
      handleClose();
      onSynced?.();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al sincronizar el rango",
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <CalendarRange className="size-4 mr-1.5" />
          Sincronizar rango
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        {/* Los calendarios de DatePickerFormField se renderizan como portal
            dentro de este div, evitando el problema de "click outside" */}
        <div ref={setContainer}>
          <div className="mb-3">
            <p className="text-sm font-medium">Sincronizar por rango</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Despacha un job por día. Máximo 90 días.
            </p>
          </div>

          <Form {...form}>
            <div className="grid gap-4">
              <DatePickerFormField
                control={form.control}
                name="date_from"
                label="Fecha inicio"
                disabledRange={{ after: today }}
                captionLayout="dropdown"
                container={container}
              />
              <DatePickerFormField
                control={form.control}
                name="date_to"
                label="Fecha fin"
                disabledRange={[
                  { after: today },
                  ...(dateFrom ? [{ before: parseISO(dateFrom) }] : []),
                ]}
                captionLayout="dropdown"
                container={container}
              />
            </div>
          </Form>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Sincronizando…
                </>
              ) : (
                "Sincronizar"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
