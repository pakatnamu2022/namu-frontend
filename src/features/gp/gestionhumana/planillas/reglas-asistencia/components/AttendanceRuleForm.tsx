"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  AttendanceRuleSchema,
  attendanceRuleSchemaUpdate,
} from "../lib/attendance-rule.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { ATTENDANCE_RULE } from "../lib/attendance-rule.constant";
import { FormSelect } from "@/shared/components/FormSelect";
import { Option } from "@/core/core.interface";
import { FormInput } from "@/shared/components/FormInput";
import { FormSwitch } from "@/shared/components/FormSwitch";

const HOUR_TYPE_OPTIONS: Option[] = [
  { label: "Diurno", value: "DIURNO" },
  { label: "Nocturno", value: "NOCTURNO" },
  { label: "Refrigerio", value: "REFRIGERIO" },
];

interface AttendanceRuleFormProps {
  defaultValues: Partial<AttendanceRuleSchema>;
  onSubmit: (data: AttendanceRuleSchema) => void;
  isSubmitting?: boolean;
}

export const AttendanceRuleForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: AttendanceRuleFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = ATTENDANCE_RULE;

  const form = useForm<AttendanceRuleSchema>({
    resolver: zodResolver(attendanceRuleSchemaUpdate) as any,
    defaultValues: {
      code: defaultValues.code ?? "",
      hour_type: defaultValues.hour_type ?? undefined,
      description: defaultValues.description ?? "",
      hours: defaultValues.hours ?? null,
      multiplier: defaultValues.multiplier ?? 1,
      pay: defaultValues.pay ?? false,
      use_shift: defaultValues.use_shift ?? false,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormInput
            name="code"
            label="Código"
            placeholder="Ej: HE, HN"
            control={form.control}
            required
          />

          <FormSelect
            name="hour_type"
            label="Tipo de Hora"
            placeholder="Seleccione tipo de hora"
            options={HOUR_TYPE_OPTIONS}
            control={form.control}
            required
          />

          <FormInput
            name="description"
            label="Descripción"
            placeholder="Ej: FERIADO NOCHE TRABAJADO"
            control={form.control}
            required
          />

          <FormInput
            name="hours"
            label="Horas"
            type="number"
            min={0}
            max={24}
            step="0.01"
            placeholder="Ej: 8.5"
            control={form.control}
          />

          <div>
            <FormInput
              name="multiplier"
              label="Multiplicador"
              type="number"
              min={0}
              step="0.01"
              placeholder="Ej: 1.5"
              control={form.control}
            />
          </div>

          <FormSwitch
            name="pay"
            label="¿Se paga?"
            description="Indica si esta regla genera pago al trabajador"
            text={form.watch("pay") ? "Sí" : "No"}
            control={form.control}
          />

          <FormSwitch
            name="use_shift"
            label="¿Usa turno?"
            description="Indica si esta regla aplica según el turno asignado"
            text={form.watch("use_shift") ? "Sí" : "No"}
            control={form.control}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
