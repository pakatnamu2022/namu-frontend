"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoanSchema, loanSchema } from "../lib/loan.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { LOAN } from "../lib/loan.constant";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface LoanFormProps {
  defaultValues: Partial<LoanSchema>;
  onSubmit: (data: LoanSchema) => void;
  isSubmitting?: boolean;
}

export const LoanForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: LoanFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = LOAN;

  const form = useForm<LoanSchema>({
    resolver: zodResolver(loanSchema) as any,
    defaultValues: {
      worker_id: defaultValues.worker_id ?? undefined,
      delivery_date: defaultValues.delivery_date ?? null,
      reason: defaultValues.reason ?? null,
      payment_start: defaultValues.payment_start ?? null,
      payment_days: defaultValues.payment_days ?? [],
      loan_amount: defaultValues.loan_amount ?? 0,
      installments_count: defaultValues.installments_count ?? null,
      installment_amount: defaultValues.installment_amount ?? 0,
      status: defaultValues.status ?? null,
    },
    mode: "onChange",
  });

  const loanAmount = useWatch({ control: form.control, name: "loan_amount" });
  const installmentsCount = useWatch({ control: form.control, name: "installments_count" });

  useEffect(() => {
    const amount = Number(loanAmount) || 0;
    const count = Number(installmentsCount) || 0;
    if (count > 0) {
      const installment = parseFloat((amount / count).toFixed(2));
      form.setValue("installment_amount", installment, { shouldValidate: true });
    }
  }, [loanAmount, installmentsCount, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormSelectAsync
            name="worker_id"
            label="Trabajador"
            placeholder="Seleccione trabajador"
            control={form.control}
            required
            useQueryHook={useWorkers}
            mapOptionFn={(item) => ({
              label: item.name,
              value: String(item.id),
            })}
          />

          <DatePickerFormField
            name="delivery_date"
            label="Fecha de Entrega"
            control={form.control}
          />

          <DatePickerFormField
            name="payment_start"
            label="Inicio de Pago"
            control={form.control}
          />

          <FormInput
            name="loan_amount"
            label="Monto del Préstamo"
            type="number"
            min={0}
            step="0.01"
            placeholder="Ej: 3000.00"
            control={form.control}
            required
          />

          <FormInput
            name="installments_count"
            label="N° de Cuotas"
            type="number"
            min={1}
            step={1}
            placeholder="Ej: 12"
            control={form.control}
          />

          <FormInput
            name="installment_amount"
            label="Monto de Cuota"
            type="number"
            min={0}
            step="0.01"
            placeholder="Ej: 250.00"
            control={form.control}
            readOnly
            required
          />

          <div className="md:col-span-2">
            <FormTextArea
              name="reason"
              label="Motivo"
              placeholder="Describa el motivo del préstamo"
              control={form.control}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="payment_days"
              render={({ field }) => {
                const selected: number[] = field.value ?? [];
                const toggle = (day: number) => {
                  const next = selected.includes(day)
                    ? selected.filter((d) => d !== day)
                    : [...selected, day].sort((a, b) => a - b);
                  field.onChange(next);
                };
                return (
                  <FormItem>
                    <FormLabel>Días de descuento</FormLabel>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggle(day)}
                          className={cn(
                            "size-8 rounded text-xs font-mono border transition-colors",
                            selected.includes(day)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-border",
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </FormItem>
                );
              }}
            />
          </div>
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
