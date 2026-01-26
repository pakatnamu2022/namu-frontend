"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Cog, Equal, Info, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import {
  PayrollConceptSchema,
  payrollConceptSchemaCreate,
  payrollConceptSchemaUpdate,
} from "../lib/payroll-concept.schema";
import {
  PAYROLL_CONCEPT,
  PAYROLL_CONCEPT_TYPE_OPTIONS,
  PAYROLL_CONCEPT_CATEGORY_OPTIONS,
} from "../lib/payroll-concept.constant";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { GroupFormSection } from "@/shared/components/GroupFormSection";

const { ABSOLUTE_ROUTE } = PAYROLL_CONCEPT;

interface PayrollConceptFormProps {
  defaultValues: Partial<PayrollConceptSchema>;
  onSubmit: (data: PayrollConceptSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const PayrollConceptForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: PayrollConceptFormProps) => {
  const form = useForm<PayrollConceptSchema>({
    resolver: zodResolver(
      mode === "create"
        ? payrollConceptSchemaCreate
        : payrollConceptSchemaUpdate,
    ) as any,
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: "EARNING",
      category: "BASE_SALARY",
      formula: "",
      formula_description: "",
      is_taxable: true,
      calculation_order: 0,
      active: true,
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <GroupFormSection
          title="Información General"
          cols={{ md: 2 }}
          icon={Info}
        >
          <FormInput
            control={form.control}
            name="code"
            label="Código"
            placeholder="Ej: BASIC_SALARY"
            required
          />

          <FormInput
            control={form.control}
            name="name"
            label="Nombre"
            placeholder="Ej: Salario Básico"
            required
          />

          <FormSelect
            control={form.control}
            name="type"
            label="Tipo"
            placeholder="Selecciona tipo"
            options={PAYROLL_CONCEPT_TYPE_OPTIONS}
            required
          />

          <FormSelect
            control={form.control}
            name="category"
            label="Categoría"
            placeholder="Selecciona categoría"
            options={PAYROLL_CONCEPT_CATEGORY_OPTIONS}
            required
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción del concepto"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        <GroupFormSection
          title="Fórmula de Cálculo"
          cols={{ md: 2 }}
          icon={Equal}
        >
          <FormInput
            control={form.control}
            name="formula"
            label="Fórmula"
            placeholder="Ej: SUELDO * DAYS_WORKED / 30"
          />

          <FormInput
            control={form.control}
            name="formula_description"
            label="Descripción de Fórmula"
            placeholder="Ej: Sueldo x Días Trabajados / 30"
          />

          <FormInput
            control={form.control}
            name="calculation_order"
            label="Orden de Cálculo"
            type="number"
            placeholder="0"
          />
        </GroupFormSection>

        <GroupFormSection title="Configuración" cols={{ md: 2 }} icon={Cog}>
          <FormField
            control={form.control}
            name="is_taxable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Afecto a Impuestos</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Indica si este concepto está sujeto a impuestos
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
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Activo</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Indica si el concepto está activo
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
        </GroupFormSection>

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
              className={`mr-2 h-4 w-4 animate-spin ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
