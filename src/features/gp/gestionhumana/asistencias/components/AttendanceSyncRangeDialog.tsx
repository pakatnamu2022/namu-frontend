"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarRange, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { errorToast, successToast } from "@/core/core.function";
import { syncAttendanceUnified } from "@/features/gp/gestionhumana/asistencias/lib/attendance.actions";
import type { AttendanceSyncRangeKey } from "@/features/gp/gestionhumana/asistencias/lib/attendance.interface";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelect } from "@/shared/components/FormSelect";
import type { Option } from "@/core/core.interface";

const RANGE_KEYS = [
  "today",
  "yesterday",
  "this_week",
  "this_month",
  "last_month",
  "last_3_months",
  "last_6_months",
  "custom",
] as const;

const RANGE_OPTIONS: Option[] = [
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "this_week", label: "Esta semana" },
  { value: "this_month", label: "Este mes" },
  { value: "last_month", label: "Mes anterior" },
  { value: "last_3_months", label: "Últimos 3 meses" },
  { value: "last_6_months", label: "Últimos 6 meses" },
  { value: "custom", label: "Rango personalizado" },
];

const schema = z
  .object({
    range: z.enum(RANGE_KEYS),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.range !== "custom") return;
    if (!data.date_from) {
      ctx.addIssue({ code: "custom", message: "Requerido", path: ["date_from"] });
    }
    if (!data.date_to) {
      ctx.addIssue({ code: "custom", message: "Requerido", path: ["date_to"] });
    }
    if (data.date_from && data.date_to && data.date_to < data.date_from) {
      ctx.addIssue({
        code: "custom",
        message: "Debe ser mayor o igual a la fecha inicio",
        path: ["date_to"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  onSynced?: () => void;
}

export default function AttendanceSyncRangeDialog({ onSynced }: Props) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { range: "today", date_from: "", date_to: "" },
  });

  const range = form.watch("range");
  const todayStr = new Date().toISOString().split("T")[0];

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload =
        values.range === "custom"
          ? { range: values.range, date_from: values.date_from!, date_to: values.date_to! }
          : { range: values.range as AttendanceSyncRangeKey };

      const result = await syncAttendanceUnified(payload);

      const detail =
        result.new_records !== undefined
          ? `${result.new_records} registros nuevos`
          : result.days !== undefined
            ? `${result.days} jobs despachados`
            : "";

      successToast(
        result.message ?? `Sincronización completada${detail ? `: ${detail}` : ""}`,
      );
      handleClose();
      onSynced?.();
    } catch (err: any) {
      errorToast(err?.response?.data?.message ?? "Error al sincronizar");
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <CalendarRange className="size-4 mr-1.5" />
        Sincronizar
      </Button>

      <GeneralModal
        open={open}
        onClose={handleClose}
        title="Sincronizar asistencias"
        subtitle='"Hoy" es síncrono · el resto despacha jobs async'
        size="md"
        icon="CalendarRange"
        childrenFooter={
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Sincronizando…
                </>
              ) : (
                "Sincronizar"
              )}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <div className="grid gap-4 py-2">
            <FormSelect
              name="range"
              label="Rango"
              control={form.control}
              options={RANGE_OPTIONS}
              required
            />

            {range === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="sync-date-from" className="text-xs md:text-sm">
                    Desde
                  </Label>
                  <input
                    id="sync-date-from"
                    type="date"
                    max={todayStr}
                    {...form.register("date_from")}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  {form.formState.errors.date_from && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.date_from.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="sync-date-to" className="text-xs md:text-sm">
                    Hasta
                  </Label>
                  <input
                    id="sync-date-to"
                    type="date"
                    max={todayStr}
                    {...form.register("date_to")}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  {form.formState.errors.date_to && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.date_to.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Form>
      </GeneralModal>
    </>
  );
}
