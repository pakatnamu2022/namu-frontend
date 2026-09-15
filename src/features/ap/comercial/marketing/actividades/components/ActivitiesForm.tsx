"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck2, Loader } from "lucide-react";
import { ActivitiesSchema, activitiesSchema } from "../lib/activities.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormCombobox } from "@/shared/components/FormCombobox";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useAllBudgets } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useBusinessPartners } from "@/features/ap/business-partners/lib/businessPartners.hook";
import { BUSINESS_PARTNER_TYPE } from "@/features/ap/business-partners/lib/businessPartners.constants";
import { BusinessPartnersResource } from "@/features/ap/business-partners/lib/businessPartners.interface";
import { useActivityTypes, useActivityChannels } from "../lib/activities.hook";
import { ACTIVITIES, ACTIVITY_STATUS_OPTIONS } from "../lib/activities.constants";

interface Props {
  defaultValues: Partial<ActivitiesSchema>;
  onSubmit: (data: ActivitiesSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  statusLabel?: string | null;
  /** Cuando se crea desde un Presupuesto, este viene fijo y no se muestra como campo editable. */
  budgetLabel?: string | null;
  /** Oculta el footer con Cancelar/Guardar de página completa (para uso dentro de un modal). */
  hideFooter?: boolean;
  onCancel?: () => void;
}

export const ActivitiesForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  statusLabel,
  budgetLabel,
  hideFooter = false,
  onCancel,
}: Props) => {
  const form = useForm<ActivitiesSchema>({
    resolver: zodResolver(activitiesSchema) as any,
    defaultValues,
  });

  const { data: budgets = [] } = useAllBudgets();
  const { data: currencies = [] } = useAllCurrencyTypes();
  const { data: activityTypes = [], isLoading: isLoadingTypes } = useActivityTypes();
  const { data: channels = [], isLoading: isLoadingChannels } = useActivityChannels();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GroupFormSection icon={CalendarCheck2} title="Información de la Actividad" cols={{ sm: 1, md: 2 }}>
          {budgetLabel ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Presupuesto</span>
              <div>
                <Badge variant="outline">{budgetLabel}</Badge>
              </div>
            </div>
          ) : (
            <FormSelect
              name="budget_id"
              label="Presupuesto"
              placeholder="Selecciona un presupuesto"
              options={budgets.map((b) => ({ label: `${b.plan?.name ?? "Presupuesto"} - ${b.type}`, value: b.id.toString() }))}
              control={form.control}
              required
            />
          )}
          <FormInput name="name" label="Nombre" placeholder="Ej: Lanzamiento SWIFT" control={form.control} required uppercase />
          <FormCombobox
            name="activity_type"
            label="Tipo de Actividad"
            placeholder="Selecciona o escribe un tipo"
            options={activityTypes.map((t) => ({ label: t, value: t }))}
            isLoadingOptions={isLoadingTypes}
            control={form.control}
            required
          />
          <FormCombobox
            name="channel"
            label="Canal"
            placeholder="Selecciona o escribe un canal"
            options={channels.map((c) => ({ label: c, value: c }))}
            isLoadingOptions={isLoadingChannels}
            control={form.control}
          />
          <FormInput name="responsible" label="Responsable" placeholder="Ej: Juan Pérez" control={form.control} uppercase />
          <FormSelectAsync
            name="supplier_id"
            label="Proveedor"
            placeholder="Selecciona un proveedor"
            useQueryHook={useBusinessPartners}
            additionalParams={{
              type: [BUSINESS_PARTNER_TYPE.BOTH, BUSINESS_PARTNER_TYPE.SUPPLIER],
            }}
            mapOptionFn={(supplier: BusinessPartnersResource) => ({
              label: supplier.full_name,
              value: supplier.id.toString(),
              description: supplier.num_doc,
            })}
            control={form.control}
          />
          <DatePickerFormField name="start_date" label="Fecha Inicio" control={form.control} />
          <DatePickerFormField name="end_date" label="Fecha Fin" control={form.control} />
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
          {mode === "update" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Estado</span>
              <div>
                <Badge className="capitalize">
                  {statusLabel ??
                    (ACTIVITY_STATUS_OPTIONS.find((s) => s.value === defaultValues.status)?.label as string) ??
                    defaultValues.status}
                </Badge>
              </div>
            </div>
          )}
          <FormInput name="objective" label="Objetivo" placeholder="Objetivo de la actividad" control={form.control} className="md:col-span-2" uppercase />
          <FormInput name="description" label="Descripción" control={form.control} className="md:col-span-2" uppercase />
          <FormInput name="notes" label="Notas" control={form.control} className="md:col-span-2" uppercase />
        </GroupFormSection>

        {hideFooter ? (
          <div className="flex gap-4 w-full justify-end">
            <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
              {isSubmitting ? "Guardando" : "Guardar Actividad"}
            </Button>
          </div>
        ) : (
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
        )}
      </form>
    </Form>
  );
};
