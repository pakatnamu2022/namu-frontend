"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader, NotebookPen } from "lucide-react";
import { PlansSchema, plansSchema } from "../lib/plans.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useAllBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook";
import { PLAN_STATUS_OPTIONS, PLANS } from "../lib/plans.constants";

interface Props {
  defaultValues: Partial<PlansSchema>;
  onSubmit: (data: PlansSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const PlansForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: Props) => {
  const form = useForm<PlansSchema>({
    resolver: zodResolver(plansSchema) as any,
    defaultValues,
  });

  const { data: brands = [] } = useAllBrands();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GroupFormSection
          icon={NotebookPen}
          title="Información del Plan"
          cols={{ sm: 1, md: 2 }}
        >
          <FormInput
            name="name"
            label="Nombre del Plan"
            placeholder="Ej: Plan Q4 Changan"
            control={form.control}
            required
          />
          <FormInput
            name="concept"
            label="Concepto"
            placeholder="Ej: SWIFT"
            control={form.control}
          />
          <FormSelect
            name="brand_id"
            label="Marca"
            placeholder="Selecciona una marca"
            options={brands.map((b) => ({ label: b.name, value: b.id.toString() }))}
            control={form.control}
          />
          <FormInput
            name="year"
            label="Año"
            type="number"
            placeholder="Ej: 2025"
            control={form.control}
            required
          />
          <FormSelect
            name="status"
            label="Estado"
            placeholder="Selecciona un estado"
            options={PLAN_STATUS_OPTIONS}
            control={form.control}
          />
          <FormInput
            name="description"
            label="Descripción"
            placeholder="Descripción del plan"
            control={form.control}
            className="md:col-span-2"
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={PLANS.ABSOLUTE_ROUTE!}>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
            {isSubmitting ? "Guardando" : "Guardar Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
