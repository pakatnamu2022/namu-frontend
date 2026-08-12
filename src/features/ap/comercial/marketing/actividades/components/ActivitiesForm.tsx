"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Loader } from "lucide-react";
import { ActivitiesSchema, activitiesSchema } from "../lib/activities.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useAllBudgets } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useBusinessPartners } from "@/features/ap/business-partners/lib/businessPartners.hook";
import { ACTIVITIES, ACTIVITY_STATUS_OPTIONS } from "../lib/activities.constants";

interface Props {
  defaultValues: Partial<ActivitiesSchema>;
  onSubmit: (data: ActivitiesSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ActivitiesForm = ({ defaultValues, onSubmit, isSubmitting = false }: Props) => {
  const form = useForm<ActivitiesSchema>({
    resolver: zodResolver(activitiesSchema) as any,
    defaultValues,
  });

  const { data: budgets = [] } = useAllBudgets();
  const { data: currencies = [] } = useAllCurrencyTypes();
  const { data: suppliers } = useBusinessPartners({ all: true, type: "PROVEEDOR" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GroupFormSection icon={CalendarCheck2} title="Información de la Actividad" cols={{ sm: 1, md: 2 }}>
          <FormSelect
            name="budget_id"
            label="Presupuesto"
            placeholder="Selecciona un presupuesto"
            options={budgets.map((b) => ({ label: `${b.plan?.name ?? "Presupuesto"} - ${b.type}`, value: b.id.toString() }))}
            control={form.control}
            required
          />
          <FormInput name="name" label="Nombre" placeholder="Ej: Lanzamiento SWIFT" control={form.control} required />
          <FormInput name="activity_type" label="Tipo de Actividad" placeholder="Ej: Evento" control={form.control} required />
          <FormInput name="channel" label="Canal" placeholder="Ej: Digital" control={form.control} />
          <FormInput name="responsible" label="Responsable" placeholder="Ej: Juan Pérez" control={form.control} />
          <FormSelect
            name="supplier_id"
            label="Proveedor"
            placeholder="Selecciona un proveedor"
            options={(suppliers?.data ?? []).map((s) => ({ label: s.full_name, value: s.id.toString() }))}
            control={form.control}
          />
          <FormInput name="start_date" label="Fecha Inicio" type="date" control={form.control} />
          <FormInput name="end_date" label="Fecha Fin" type="date" control={form.control} />
          <FormSelect
            name="currency_id"
            label="Moneda"
            placeholder="Selecciona una moneda"
            options={currencies.map((c) => ({ label: `${c.name} (${c.symbol})`, value: c.id.toString() }))}
            control={form.control}
            required
          />
          <FormInput
            name="estimated_amount"
            label="Monto Estimado"
            type="number"
            step="0.01"
            control={form.control}
            required
          />
          <FormSelect
            name="status"
            label="Estado"
            placeholder="Selecciona un estado"
            options={ACTIVITY_STATUS_OPTIONS}
            control={form.control}
          />
          <FormInput name="objective" label="Objetivo" placeholder="Objetivo de la actividad" control={form.control} className="md:col-span-2" />
          <FormInput name="description" label="Descripción" control={form.control} className="md:col-span-2" />
          <FormInput name="notes" label="Notas" control={form.control} className="md:col-span-2" />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ACTIVITIES.ABSOLUTE_ROUTE!}>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
            {isSubmitting ? "Guardando" : "Guardar Actividad"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
