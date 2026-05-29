"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInDays, parseISO } from "date-fns";
import { CalendarRange, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/shared/components/GeneralModal";
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

  const footer = (
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="ghost" onClick={handleClose} disabled={form.formState.isSubmitting}>
        Cancelar
      </Button>
      <Button
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
  );

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <CalendarRange className="size-4 mr-1.5" />
        Sincronizar rango
      </Button>

      <GeneralModal
        open={open}
        onClose={handleClose}
        title="Sincronizar por rango"
        subtitle="Despacha un job por día en el rango seleccionado. Máximo 90 días."
        icon="CalendarRange"
        size="md"
        childrenFooter={footer}
      >
        <Form {...form}>
          <div className="grid gap-4">
            <DatePickerFormField
              control={form.control}
              name="date_from"
              label="Fecha inicio"
              disabledRange={{ after: today }}
              captionLayout="dropdown"
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
            />
          </div>
        </Form>
      </GeneralModal>
    </>
  );
}
