import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  AccountingAccountPlanSchema,
  accountingAccountPlanSchemaCreate,
  accountingAccountPlanSchemaUpdate,
} from "../lib/accountingAccountPlan.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { FormCheckbox } from "@/shared/components/FormCheckbox";
import { FormInput } from "@/shared/components/FormInput";

interface AccountingAccountPlanFormProps {
  defaultValues: Partial<AccountingAccountPlanSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const AccountingAccountPlanForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: AccountingAccountPlanFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? accountingAccountPlanSchemaCreate
        : accountingAccountPlanSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const isDetraction = form.watch("is_detraction");

  useEffect(() => {
    if (!isDetraction) {
      form.setValue("detraction_percentage", "", { shouldValidate: true });
    }
  }, [isDetraction]);

  const enableCommercialError = form.formState.errors.enable_commercial;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            name="account"
            label="Cuenta"
            placeholder="Ej: 7521000"
            control={form.control}
          />

          <FormInput
            name="code_dynamics"
            label="Cód. Dyn"
            placeholder="Ej: V000002"
            control={form.control}
          />

          <FormInput
            name="description"
            label="Descripción"
            placeholder="Ej: Comision Venta Consignación"
            control={form.control}
          />

          <FormSwitch
            control={form.control}
            name="is_detraction"
            label="Detracción"
            text="¿Es detracción?"
          />

          {isDetraction && (
            <FormInput
              name="detraction_percentage"
              label="Porcentaje de detracción"
              placeholder="Ej: 10"
              inputMode="numeric"
              maxLength={2}
              control={form.control}
              required
            />
          )}
        </div>

        {/* Habilitación por área */}
        <div className="space-y-2">
          <FormLabel
            className={enableCommercialError ? "text-destructive" : ""}
          >
            Habilitado para <span className="text-destructive">*</span>
          </FormLabel>
          <div className="flex flex-wrap gap-3">
            <FormCheckbox
              control={form.control}
              name="enable_commercial"
              label="Comercial"
            />
            <FormCheckbox
              control={form.control}
              name="enable_after_sales"
              label="Post Venta"
            />
          </div>
          {enableCommercialError && (
            <p className="text-sm font-medium text-destructive">
              {enableCommercialError.message}
            </p>
          )}
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
            {isSubmitting ? "Guardando" : "Guardar Plan de Cuenta"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
