"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader, Wallet } from "lucide-react";
import { BudgetsSchema, budgetsSchema } from "../lib/budgets.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useAllPlans } from "@/features/ap/comercial/marketing/planes/lib/plans.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { MONTH_OPTIONS } from "@/core/core.constants";
import { useMarketingConstants } from "@/features/ap/comercial/marketing/lib/marketingConstants.hook";
import { BUDGET_STATUS_OPTIONS, BUDGET_TYPE_OPTIONS, BUDGETS } from "../lib/budgets.constants";

interface Props {
  defaultValues: Partial<BudgetsSchema>;
  onSubmit: (data: BudgetsSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const BudgetsForm = ({ defaultValues, onSubmit, isSubmitting = false }: Props) => {
  const form = useForm<BudgetsSchema>({
    resolver: zodResolver(budgetsSchema) as any,
    defaultValues,
  });

  const { data: plans = [] } = useAllPlans();
  const { data: currencies = [] } = useAllCurrencyTypes();
  const { data: constants } = useMarketingConstants();
  const typeOptions = constants?.budget_types ?? BUDGET_TYPE_OPTIONS;
  const statusOptions = constants?.budget_statuses ?? BUDGET_STATUS_OPTIONS;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GroupFormSection icon={Wallet} title="Información del Presupuesto" cols={{ sm: 1, md: 2 }}>
          <FormSelect
            name="plan_id"
            label="Plan"
            placeholder="Selecciona un plan"
            options={plans.map((p) => ({ label: p.name, value: p.id.toString() }))}
            control={form.control}
            required
          />
          <FormSelect
            name="type"
            label="Tipo"
            placeholder="Selecciona un tipo"
            options={typeOptions}
            control={form.control}
            required
          />
          <FormSelect
            name="period_month"
            label="Mes"
            placeholder="Selecciona un mes"
            options={MONTH_OPTIONS}
            control={form.control}
          />
          <FormSelect
            name="currency_id"
            label="Moneda"
            placeholder="Selecciona una moneda"
            options={currencies.map((c) => ({ label: `${c.name} (${c.symbol})`, value: c.id.toString() }))}
            control={form.control}
            required
          />
          <FormInput
            name="amount_estimated"
            label="Monto Estimado"
            type="number"
            step="0.01"
            placeholder="Ej: 50000"
            control={form.control}
            required
          />
          <FormSelect
            name="status"
            label="Estado"
            placeholder="Selecciona un estado"
            options={statusOptions}
            control={form.control}
          />
          <FormInput
            name="notes"
            label="Notas"
            placeholder="Notas adicionales"
            control={form.control}
            className="md:col-span-2"
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={BUDGETS.ABSOLUTE_ROUTE!}>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
            {isSubmitting ? "Guardando" : "Guardar Presupuesto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
