import { useForm } from "react-hook-form";
import {
  AccountingAccountPlanSchema,
  accountingAccountPlanSchemaCreate,
  accountingAccountPlanSchemaUpdate,
} from "../lib/accountingAccountPlan.schema";
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
import { Loader } from "lucide-react";
import { FormSelect } from "@/src/shared/components/FormSelect";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { useAllAccountingAccountType } from "@/src/features/ap/configuraciones/maestros-general/tipos-cuenta-contable/lib/accountingAccountType.hook";

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
        : accountingAccountPlanSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const {
    data: accountingAccountPlans = [],
    isLoading: isLoadingAccountingAccountPlans,
  } = useAllAccountingAccountType();

  if (isLoadingAccountingAccountPlans) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuenta</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 7521000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code_dynamics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Dynamics</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: V000002" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Comision Venta Consignación"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="accounting_type_id"
            label="Tipo de Cuenta"
            placeholder="Selecciona un Tipo de Cuenta"
            options={accountingAccountPlans.map((accountingAccountPlan) => ({
              label: accountingAccountPlan.description,
              value: accountingAccountPlan.id.toString(),
            }))}
            control={form.control}
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
            {isSubmitting ? "Guardando" : "Guardar Plan de Cuenta"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
