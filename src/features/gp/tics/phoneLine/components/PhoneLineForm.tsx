"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  PhoneLineSchema,
  phoneLineSchemaCreate,
  phoneLineSchemaUpdate,
} from "../lib/phoneLine.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { Link } from "react-router-dom";
import { PHONE_LINE } from "../lib/phoneLine.constants";

interface PhoneLineFormProps {
  defaultValues: Partial<PhoneLineSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  telephoneAccounts?: any[];
  telephonePlans?: any[];
}

export const PhoneLineForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  telephoneAccounts = [],
  telephonePlans = [],
}: PhoneLineFormProps) => {
  const { ABSOLUTE_ROUTE } = PHONE_LINE;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? phoneLineSchemaCreate : phoneLineSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      is_active: defaultValues?.is_active ?? false,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            control={form.control}
            name="telephone_account_id"
            label="Cuenta telefónica"
            placeholder="Selecciona una cuenta"
            options={telephoneAccounts.map((account: any) => ({
              label: account.account_number,
              description: account.company,
              value: account.id.toString(),
            }))}
          />

          <FormSelect
            control={form.control}
            name="telephone_plan_id"
            label="Plan telefónico"
            placeholder="Selecciona un plan"
            options={telephonePlans.map((plan: any) => ({
              label: plan.name || plan.description || `Plan ${plan.id}`,
              value: plan.id.toString(),
            }))}
          />

          <FormInput
            control={form.control}
            name="line_number"
            label="Número de línea"
            placeholder="Ej: 999999999"
            type="text"
            maxLength={9}
          />

          <FormSelect
            control={form.control}
            name="status"
            label="Estado"
            placeholder="Selecciona el estado"
            options={[
              { label: "Activo", value: "active" },
              { label: "Inactivo", value: "inactive" },
            ]}
          />

          <FormSwitch
            control={form.control}
            name="is_active"
            label="Estado activo"
            text="¿La línea está activa?"
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
            {isSubmitting ? "Guardando..." : "Guardar línea"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
