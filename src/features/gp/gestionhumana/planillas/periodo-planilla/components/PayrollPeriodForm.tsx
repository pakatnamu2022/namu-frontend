"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  PayrollPeriodSchema,
  payrollPeriodSchemaCreate,
  payrollPeriodSchemaUpdate,
} from "../lib/payroll-period.schema";
import { Loader } from "lucide-react";
import { Form } from "@/components/ui/form";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { PAYROLL_PERIOD } from "../lib/payroll-period.constant";

const MONTHS = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

interface PayrollPeriodFormProps {
  defaultValues: Partial<PayrollPeriodSchema>;
  onSubmit: (data: PayrollPeriodSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const PayrollPeriodForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}: PayrollPeriodFormProps) => {
  const { MODEL } = PAYROLL_PERIOD;

  const form = useForm<PayrollPeriodSchema>({
    resolver: zodResolver(
      mode === "create" ? payrollPeriodSchemaCreate : payrollPeriodSchemaUpdate,
    ) as any,
    defaultValues: {
      year: String(defaultValues.year ?? new Date().getFullYear()) as any,
      month: String(defaultValues.month ?? new Date().getMonth() + 1) as any,
      payment_date: defaultValues.payment_date ?? "",
      company_id: defaultValues.company_id,
    },
    mode: "onChange",
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => ({
    value: (currentYear - 5 + i).toString(),
    label: (currentYear - 5 + i).toString(),
  }));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormSelect
            control={form.control}
            name="year"
            label="Año"
            placeholder="Selecciona el año"
            options={years}
          />

          <FormSelect
            control={form.control}
            name="month"
            label="Mes"
            placeholder="Selecciona el mes"
            options={MONTHS}
          />

          <DatePickerFormField
            control={form.control}
            name="payment_date"
            label="Fecha de Pago"
            placeholder="Selecciona la fecha de pago"
            captionLayout="dropdown"
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

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
