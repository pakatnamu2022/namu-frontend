"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoanSchema, loanSchema } from "../lib/loan.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { LOAN } from "../lib/loan.constant";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { Option } from "@/core/core.interface";

const STATUS_OPTIONS: Option[] = [
  { label: "Activo", value: "ACTIVO" },
  { label: "Completado", value: "COMPLETADO" },
  { label: "Anulado", value: "ANULADO" },
];

interface LoanFormProps {
  defaultValues: Partial<LoanSchema>;
  onSubmit: (data: LoanSchema) => void;
  isSubmitting?: boolean;
  conceptOptions: Option[];
  workerOptions: Option[];
}

export const LoanForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  conceptOptions,
  workerOptions,
}: LoanFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = LOAN;

  const form = useForm<LoanSchema>({
    resolver: zodResolver(loanSchema) as any,
    defaultValues: {
      concept_id: defaultValues.concept_id ?? undefined,
      worker_id: defaultValues.worker_id ?? undefined,
      delivery_date: defaultValues.delivery_date ?? "",
      reason: defaultValues.reason ?? "",
      payment_start: defaultValues.payment_start ?? "",
      loan_amount: defaultValues.loan_amount ?? 0,
      installments_count: defaultValues.installments_count ?? 1,
      installment_amount: defaultValues.installment_amount ?? 0,
      status: defaultValues.status ?? "ACTIVO",
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormSelect
            name="concept_id"
            label="Concepto"
            placeholder="Seleccione concepto"
            options={conceptOptions}
            control={form.control}
            required
          />

          <FormSelect
            name="worker_id"
            label="Trabajador"
            placeholder="Seleccione trabajador"
            options={workerOptions}
            control={form.control}
            required
          />

          <FormInput
            name="delivery_date"
            label="Fecha de Entrega"
            type="date"
            control={form.control}
            required
          />

          <FormInput
            name="payment_start"
            label="Inicio de Pago"
            type="date"
            control={form.control}
            required
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
            required
          />

          <FormInput
            name="installment_amount"
            label="Monto de Cuota"
            type="number"
            min={0}
            step="0.01"
            placeholder="Ej: 250.00"
            control={form.control}
            required
          />

          <FormSelect
            name="status"
            label="Estado"
            placeholder="Seleccione estado"
            options={STATUS_OPTIONS}
            control={form.control}
            required
          />

          <div className="md:col-span-2">
            <FormTextArea
              name="reason"
              label="Motivo"
              placeholder="Describa el motivo del préstamo"
              control={form.control}
              required
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
