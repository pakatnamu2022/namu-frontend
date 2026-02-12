"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  TelephoneAccountSchema,
  telephoneAccountSchemaCreate,
  telephoneAccountSchemaUpdate,
} from "../lib/telephoneAccount.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormCombobox } from "@/shared/components/FormCombobox";
import { useTelephoneOperators } from "../lib/telephoneAccount.hook";

interface TelephoneAccountFormProps {
  defaultValues: Partial<TelephoneAccountSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  companies?: any[];
  onCancel?: () => void;
}

export const TelephoneAccountForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  companies = [],
  onCancel,
}: TelephoneAccountFormProps) => {
  const { data: operators = [], isLoading: isLoadingOperators } =
    useTelephoneOperators();

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? telephoneAccountSchemaCreate
        : telephoneAccountSchemaUpdate,
    ),
    defaultValues,
    mode: "onChange",
  });

  const operatorOptions = operators.map((operator) => ({
    label: operator,
    value: operator,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            control={form.control}
            name="company_id"
            label="Empresa"
            placeholder="Selecciona una empresa"
            options={companies.map((company: any) => ({
              label: company.businessName || company.name,
              value: company.id.toString(),
            }))}
          />

          <FormInput
            control={form.control}
            name="account_number"
            label="Número de cuenta"
            placeholder="Ej: 12345678"
            type="text"
          />

          <FormCombobox
            control={form.control}
            name="operator"
            label="Operador"
            placeholder="Selecciona o escribe un operador"
            options={operatorOptions}
            allowCreate={true}
            isLoadingOptions={isLoadingOperators}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Guardando..." : "Guardar cuenta"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
