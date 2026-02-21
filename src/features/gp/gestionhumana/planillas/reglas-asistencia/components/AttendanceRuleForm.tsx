"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={24}
                    step="0.01"
                    placeholder="Ej: 8.5"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="multiplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Multiplicador</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Ej: 1.5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pay"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>¿Se paga?</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Indica si esta regla genera pago al trabajador
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="use_shift"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>¿Usa turno?</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Indica si esta regla aplica según el turno asignado
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
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
