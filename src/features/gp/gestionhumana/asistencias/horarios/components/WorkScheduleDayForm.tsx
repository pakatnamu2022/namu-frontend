"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import {
  workScheduleDetailSchema,
  type WorkScheduleDetailSchema,
} from "../lib/work-schedule.schema";
import { DAY_OF_WEEK_OPTIONS } from "../lib/work-schedule.constants";
import type { Option } from "@/core/core.interface";

interface WorkScheduleDayFormProps {
  defaultValues?: Partial<WorkScheduleDetailSchema>;
  usedDays?: number[];
  onSubmit: (data: WorkScheduleDetailSchema) => void;
  onCancel: () => void;
}

export function WorkScheduleDayForm({
  defaultValues,
  usedDays = [],
  onSubmit,
  onCancel,
}: WorkScheduleDayFormProps) {
  const form = useForm<WorkScheduleDetailSchema>({
    resolver: zodResolver(workScheduleDetailSchema) as any,
    defaultValues: {
      day_of_week: defaultValues?.day_of_week ?? undefined,
      checkin: defaultValues?.checkin ?? null,
      lunch_out: defaultValues?.lunch_out ?? null,
      lunch_in: defaultValues?.lunch_in ?? null,
      checkout: defaultValues?.checkout ?? null,
    },
    mode: "onChange",
  });

  const isEditing = defaultValues?.day_of_week !== undefined;

  const availableDays: Option[] = DAY_OF_WEEK_OPTIONS.filter(
    (opt) =>
      !usedDays.includes(Number(opt.value)) ||
      Number(opt.value) === defaultValues?.day_of_week,
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormSelect
          name="day_of_week"
          label="Día de la semana"
          placeholder="Seleccione un día"
          options={availableDays}
          control={form.control as any}
          required
          disabled={isEditing}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="checkin"
            label="Entrada"
            type="time"
            control={form.control}
            optional
          />
          <FormInput
            name="lunch_out"
            label="Salida almuerzo"
            type="time"
            control={form.control}
            optional
          />
          <FormInput
            name="lunch_in"
            label="Regreso almuerzo"
            type="time"
            control={form.control}
            optional
          />
          <FormInput
            name="checkout"
            label="Salida"
            type="time"
            control={form.control}
            optional
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Deja un campo vacío para heredar el horario general del día.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!form.formState.isValid}>
            <Loader
              className={`mr-2 h-4 w-4 ${!form.formState.isSubmitting ? "hidden" : ""}`}
            />
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}
