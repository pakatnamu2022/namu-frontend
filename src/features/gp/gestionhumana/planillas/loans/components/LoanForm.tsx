"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoanSchema, loanSchema } from "../lib/loan.schema";
import { CalendarDays, Loader } from "lucide-react";
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
  const installmentsCount = useWatch({
    control: form.control,
    name: "installments_count",
  });

  useEffect(() => {
    const amount = Number(loanAmount) || 0;
    const count = Number(installmentsCount) || 0;
    if (count > 0) {
      const installment = parseFloat((amount / count).toFixed(2));
      form.setValue("installment_amount", installment, {
        shouldValidate: true,
      });
    }
  }, [loanAmount, installmentsCount, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Left: form fields */}
          <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 gap-y-5 items-start">
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
            <div className="sm:col-span-2">
              <FormTextArea
                name="reason"
                label="Motivo"
                placeholder="Describa el motivo del préstamo"
                control={form.control}
              />
            </div>
          </div>

          {/* Right: day picker calendar */}
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
              const selectAll = () =>
                field.onChange(Array.from({ length: 31 }, (_, i) => i + 1));
              const clearAll = () => field.onChange([]);

              return (
                <FormItem className="w-full lg:w-72 lg:shrink-0">
                  <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        <FormLabel className="text-sm font-semibold leading-none">
                          Días de descuento
                        </FormLabel>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {selected.length > 0
                          ? `${selected.length} seleccionado${selected.length > 1 ? "s" : ""}`
                          : "Ninguno"}
                      </span>
                    </div>

                    {/* Day grid */}
                    <div className="grid grid-cols-7 gap-1 p-3">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggle(day)}
                            className={cn(
                              "aspect-square w-full rounded-md text-xs font-medium transition-all duration-150 flex items-center justify-center",
                              selected.includes(day)
                                ? "bg-primary text-primary-foreground shadow-sm scale-105"
                                : "bg-background hover:bg-primary/10 text-foreground border border-transparent hover:border-primary/30",
                            )}
                          >
                            {day}
                          </button>
                        ),
                      )}
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20">
                      <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Limpiar
                      </button>
                      {selected.length > 0 && (
                        <div className="flex gap-1 flex-wrap justify-end max-w-40">
                          {selected.map((d) => (
                            <span
                              key={d}
                              className="inline-flex items-center justify-center size-5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Todos
                      </button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
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
