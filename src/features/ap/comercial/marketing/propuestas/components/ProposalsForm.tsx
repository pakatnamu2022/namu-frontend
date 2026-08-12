"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileCheck2, Loader } from "lucide-react";
import { ProposalsSchema, proposalsSchema } from "../lib/proposals.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useAllActivities } from "@/features/ap/comercial/marketing/actividades/lib/activities.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useBusinessPartners } from "@/features/ap/business-partners/lib/businessPartners.hook";
import { PROPOSAL_STATUS_OPTIONS, PROPOSALS } from "../lib/proposals.constants";

interface Props {
  defaultValues: Partial<ProposalsSchema>;
  onSubmit: (data: ProposalsSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ProposalsForm = ({ defaultValues, onSubmit, isSubmitting = false }: Props) => {
  const form = useForm<ProposalsSchema>({
    resolver: zodResolver(proposalsSchema) as any,
    defaultValues,
  });

  const { data: activities = [] } = useAllActivities();
  const { data: currencies = [] } = useAllCurrencyTypes();
  const { data: suppliers } = useBusinessPartners({ all: true, type: "PROVEEDOR" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GroupFormSection icon={FileCheck2} title="Información de la Propuesta" cols={{ sm: 1, md: 2 }}>
          <FormSelect
            name="activity_id"
            label="Actividad"
            placeholder="Selecciona una actividad"
            options={activities.map((a) => ({ label: a.name, value: a.id.toString() }))}
            control={form.control}
            required
          />
          <FormSelect
            name="supplier_id"
            label="Proveedor"
            placeholder="Selecciona un proveedor"
            options={(suppliers?.data ?? []).map((s) => ({ label: s.full_name, value: s.id.toString() }))}
            control={form.control}
            required
          />
          <FormSelect
            name="currency_id"
            label="Moneda"
            placeholder="Selecciona una moneda"
            options={currencies.map((c) => ({ label: `${c.name} (${c.symbol})`, value: c.id.toString() }))}
            control={form.control}
            required
          />
          <FormInput name="amount" label="Monto" type="number" step="0.01" control={form.control} required />
          <FormSelect
            name="status"
            label="Estado"
            placeholder="Selecciona un estado"
            options={PROPOSAL_STATUS_OPTIONS}
            control={form.control}
          />
          <FormInput name="description" label="Descripción" control={form.control} className="md:col-span-2" />
          <FormInput name="notes" label="Notas" control={form.control} className="md:col-span-2" />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={PROPOSALS.ABSOLUTE_ROUTE!}>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
            {isSubmitting ? "Guardando" : "Guardar Propuesta"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
