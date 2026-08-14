"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, ShoppingCart } from "lucide-react";
import {
  PurchaseOrdersSchema,
  purchaseOrdersSchema,
} from "../lib/purchaseOrders.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useActivities } from "@/features/ap/comercial/marketing/actividades/lib/activities.hook";
import { useProposals } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useBusinessPartners } from "@/features/ap/business-partners/lib/businessPartners.hook";
import {
  MARKETING_PURCHASE_ORDERS,
  PURCHASE_ORDER_STATUS_OPTIONS,
} from "../lib/purchaseOrders.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { BUSINESS_PARTNER_TYPE } from "@/features/ap/business-partners/lib/businessPartners.constants";
import { BusinessPartnersResource } from "@/features/ap/business-partners/lib/businessPartners.interface";
import { ProposalsResource } from "../../propuestas/lib/proposals.interface";

interface Props {
  defaultValues: Partial<PurchaseOrdersSchema>;
  onSubmit: (data: PurchaseOrdersSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  statusLabel?: string | null;
}

export const PurchaseOrdersForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  statusLabel,
}: Props) => {
  const form = useForm<PurchaseOrdersSchema>({
    resolver: zodResolver(purchaseOrdersSchema) as any,
    defaultValues,
  });

  const { data: currencies = [] } = useAllCurrencyTypes();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GroupFormSection
          icon={ShoppingCart}
          title="Información de la Orden de Compra"
          cols={{ sm: 1, md: 2 }}
        >
          <FormInput
            name="number"
            label="N° de OC"
            placeholder="Ej: OC-0042"
            control={form.control}
          />
          <FormSelectAsync
            name="supplier_id"
            label="Proveedor"
            placeholder="Selecciona un proveedor"
            useQueryHook={useBusinessPartners}
            additionalParams={{
              type: [
                BUSINESS_PARTNER_TYPE.BOTH,
                BUSINESS_PARTNER_TYPE.SUPPLIER,
              ],
            }}
            mapOptionFn={(supplier: BusinessPartnersResource) => ({
              label: supplier.full_name,
              value: supplier.id.toString(),
              description: supplier.num_doc,
            })}
            control={form.control}
            required
          />
          <FormSelectAsync
            name="activity_id"
            label="Actividad"
            placeholder="Selecciona una actividad"
            useQueryHook={useActivities}
            mapOptionFn={(activity) => ({
              label: activity.name,
              value: activity.id.toString(),
            })}
            control={form.control}
          />
          <FormSelectAsync
            name="proposal_id"
            label="Propuesta"
            placeholder="Selecciona una propuesta"
            useQueryHook={useProposals}
            mapOptionFn={(proposal: ProposalsResource) => ({
              label: proposal.description ?? "-",
              value: proposal.id.toString(),
            })}
            control={form.control}
          />
          <FormSelect
            name="currency_id"
            label="Moneda"
            placeholder="Selecciona una moneda"
            options={currencies.map((c) => ({
              label: `${c.name} (${c.symbol})`,
              value: c.id.toString(),
            }))}
            control={form.control}
            required
          />
          <FormInput
            name="amount"
            label="Monto"
            type="number"
            step="0.01"
            control={form.control}
            required
          />
          <DatePickerFormField
            name="issue_date"
            label="Fecha de Emisión"
            control={form.control}
          />
          {mode === "update" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Estado</span>
              <div>
                <Badge className="capitalize">
                  {statusLabel ??
                    (PURCHASE_ORDER_STATUS_OPTIONS.find(
                      (s) => s.value === defaultValues.status,
                    )?.label as string) ??
                    defaultValues.status}
                </Badge>
              </div>
            </div>
          )}
          <FormInput
            name="notes"
            label="Notas"
            control={form.control}
            className="md:col-span-2"
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={MARKETING_PURCHASE_ORDERS.ABSOLUTE_ROUTE!}>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Orden de Compra"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
