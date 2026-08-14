"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader, Receipt } from "lucide-react";
import { SupportsSchema, supportsSchema } from "../lib/supports.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useActivities } from "@/features/ap/comercial/marketing/actividades/lib/activities.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useMarketingConstants } from "@/features/ap/comercial/marketing/lib/marketingConstants.hook";
import { SUPPORT_TYPE_OPTIONS, SUPPORTS } from "../lib/supports.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { ActivitiesResource } from "../../actividades/lib/activities.interface";
import { BUSINESS_PARTNER_TYPE } from "@/features/ap/business-partners/lib/businessPartners.constants";
import { BusinessPartnersResource } from "@/features/ap/business-partners/lib/businessPartners.interface";
import { useBusinessPartners } from "@/features/ap/business-partners/lib/businessPartners.hook";
import { usePurchaseOrders } from "../../ordenes-compra/lib/purchaseOrders.hook";
import { PurchaseOrdersResource } from "../../ordenes-compra/lib/purchaseOrders.interface";

interface Props {
  defaultValues: Partial<SupportsSchema>;
  onSubmit: (data: SupportsSchema) => void;
  isSubmitting?: boolean;
}

export const SupportsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: Props) => {
  const form = useForm<SupportsSchema>({
    resolver: zodResolver(supportsSchema) as any,
    defaultValues,
  });

  const { data: currencies = [] } = useAllCurrencyTypes();
  const { data: constants } = useMarketingConstants();
  const typeOptions = constants?.support_types ?? SUPPORT_TYPE_OPTIONS;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GroupFormSection
          icon={Receipt}
          title="Información del Sustento"
          cols={{ sm: 1, md: 2 }}
        >
          <FormSelect
            name="type"
            label="Tipo de Sustento"
            placeholder="Selecciona un tipo"
            options={typeOptions}
            control={form.control}
            required
          />
          <FormSelectAsync
            name="activity_id"
            label="Actividad"
            placeholder="Selecciona una actividad"
            useQueryHook={useActivities}
            mapOptionFn={(activity: ActivitiesResource) => ({
              label: activity.name,
              value: activity.id.toString(),
            })}
            control={form.control}
          />
          <FormSelectAsync
            name="purchase_order_id"
            label="Orden de Compra"
            placeholder="Selecciona una orden de compra"
            useQueryHook={usePurchaseOrders}
            mapOptionFn={(purchaseOrder: PurchaseOrdersResource) => ({
              label: purchaseOrder.number ?? `OC #${purchaseOrder.id}`,
              value: purchaseOrder.id.toString(),
              description: purchaseOrder.amount
                ? `${purchaseOrder.currency?.symbol ?? ""} ${purchaseOrder.amount}`
                : undefined,
            })}
            withValue={false}
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
          <FormInput
            name="document_series"
            label="Serie"
            placeholder="Ej: F001"
            control={form.control}
          />
          <FormInput
            name="document_number"
            label="Número"
            placeholder="Ej: 00123"
            control={form.control}
          />
          <FormInput
            name="issue_date"
            label="Fecha de Emisión"
            type="date"
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
          />
          <FormInput
            name="amount"
            label="Monto"
            type="number"
            step="0.01"
            control={form.control}
          />
          <FormInput
            name="file_path"
            label="Archivo (URL)"
            placeholder="Enlace o ruta del archivo"
            control={form.control}
          />
          <FormInput
            name="notes"
            label="Notas"
            control={form.control}
            className="md:col-span-2"
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={SUPPORTS.ABSOLUTE_ROUTE!}>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Sustento"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
