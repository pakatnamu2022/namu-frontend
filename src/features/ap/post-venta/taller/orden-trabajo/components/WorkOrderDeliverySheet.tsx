import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { TimePickerForm } from "@/shared/components/TimePickerForm";
import { generateDelivery } from "../lib/workOrder.actions";
import { errorToast, successToast } from "@/core/core.function";

const DAY_LABELS: { value: number; short: string; long: string }[] = [
  { value: 1, short: "L", long: "Lunes" },
  { value: 2, short: "M", long: "Martes" },
  { value: 3, short: "X", long: "Miércoles" },
  { value: 4, short: "J", long: "Jueves" },
  { value: 5, short: "V", long: "Viernes" },
  { value: 6, short: "S", long: "Sábado" },
  { value: 7, short: "D", long: "Domingo" },
];

const deliverySchema = z
  .object({
    actual_delivery_date: z.string().min(1, "La fecha de entrega es requerida"),
    time_start: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
    time_end: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
  })
  .refine((v) => v.time_start < v.time_end, {
    message: "La hora fin debe ser mayor a la hora inicio",
    path: ["time_end"],
  });

type DeliveryFormValues = z.infer<typeof deliverySchema>;

interface WorkOrderDeliverySheetProps {
  open: boolean;
  onClose: () => void;
  workOrderId: number;
  onSuccess?: () => void;
}

export function WorkOrderDeliverySheet({
  open,
  onClose,
  workOrderId,
  onSuccess,
}: WorkOrderDeliverySheetProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [daysError, setDaysError] = useState<string | null>(null);

  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      actual_delivery_date: "",
      time_start: "08:00",
      time_end: "10:00",
    },
  });

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
    setDaysError(null);
  };

  const handleClose = () => {
    form.reset();
    setSelectedDays([1]);
    setDaysError(null);
    onClose();
  };

  const onSubmit = async (values: DeliveryFormValues) => {
    if (selectedDays.length === 0) {
      setDaysError("Seleccione al menos un día");
      return;
    }

    try {
      await generateDelivery(workOrderId, {
        actual_delivery_date:
          values.actual_delivery_date.replace("T", " ") + ":00",
        follow_ups: selectedDays.map((day) => ({
          days: day,
          time_start: values.time_start,
          time_end: values.time_end,
        })),
      });
      successToast("Entrega generada exitosamente");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al generar la entrega",
      );
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Entrega de Vehículo"
      icon="Car"
      size="lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pb-4"
        >
          <DateTimePickerForm
            name="actual_delivery_date"
            label="Fecha y Hora de Entrega"
            control={form.control}
            placeholder="Seleccione fecha y hora"
          />

          {/* Day selector */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Días de seguimiento</span>
            <div className="flex gap-2 flex-wrap">
              {DAY_LABELS.map(({ value, short, long }) => {
                const active = selectedDays.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    title={long}
                    onClick={() => toggleDay(value)}
                    className={`w-9 h-9 rounded-full text-sm font-medium border transition-colors
                      ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-input hover:bg-accent"
                      }`}
                  >
                    {short}
                  </button>
                );
              })}
            </div>
            {daysError && (
              <p className="text-sm text-destructive">{daysError}</p>
            )}
          </div>

          {/* Time range */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Rango de horario</span>
            <div className="flex gap-3">
              <TimePickerForm
                control={form.control}
                name="time_start"
                label="Hora inicio"
              />
              <TimePickerForm
                control={form.control}
                name="time_end"
                label="Hora fin"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="mt-2"
          >
            {form.formState.isSubmitting ? "Generando..." : "Generar Entrega"}
          </Button>
        </form>
      </Form>
    </GeneralSheet>
  );
}
