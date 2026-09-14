"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import { useActivities } from "@/features/ap/comercial/marketing/actividades/lib/activities.hook";
import { useAllPlans } from "@/features/ap/comercial/marketing/planes/lib/plans.hook";
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

/** Marcas cuya referencia de proveedor se llama "PLANKET" en vez de "MIGO" (espejo de MktPurchaseOrder::REFERENCE_LABEL_BRANDS). */
const REFERENCE_LABEL_BRANDS: Record<string, string> = {
  SUBARU: "PLANKET",
  DFSK: "PLANKET",
};
const REFERENCE_LABEL_DEFAULT = "MIGO";

interface Props {
  defaultValues: Partial<PurchaseOrdersSchema>;
  onSubmit: (data: PurchaseOrdersSchema, file: File | null) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  statusLabel?: string | null;
  /** Cuando la OC se genera desde "Completar" en un Plan, viene fija y no se muestra como campo editable. */
  planName?: string | null;
  /** Marca del plan fijo (cuando `planName` viene dado), para calcular la etiqueta de referencia. */
  planBrandName?: string | null;
  /** URL del PDF ya cargado (modo edición); se muestra como referencia. */
  existingFileUrl?: string | null;
}

export const PurchaseOrdersForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  statusLabel,
  planName,
  planBrandName,
  existingFileUrl,
}: Props) => {
  const form = useForm<PurchaseOrdersSchema>({
    resolver: zodResolver(purchaseOrdersSchema) as any,
    defaultValues,
  });
  const [file, setFile] = useState<File | null>(null);

  const { data: plans = [] } = useAllPlans();
  const { data: currencies = [] } = useAllCurrencyTypes();

  const selectedPlanId = useWatch({ control: form.control, name: "plan_id" });
  const referenceLabel = useMemo(() => {
    const brandName = planName
      ? planBrandName
      : plans.find((p) => p.id.toString() === selectedPlanId)?.brand?.name;
    return REFERENCE_LABEL_BRANDS[(brandName ?? "").toUpperCase()] ?? REFERENCE_LABEL_DEFAULT;
  }, [planName, planBrandName, plans, selectedPlanId]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(data, file))}
        className="space-y-6"
      >
        <GroupFormSection
          icon={ShoppingCart}
          title="Información de la Orden de Compra"
          cols={{ sm: 1, md: 2 }}
        >
          {planName ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Plan</span>
              <div>
                <Badge variant="outline">{planName}</Badge>
              </div>
            </div>
          ) : (
            <FormSelect
              name="plan_id"
              label="Plan"
              placeholder="Selecciona un plan"
              options={plans.map((p) => ({ label: p.name, value: p.id.toString() }))}
              control={form.control}
            />
          )}
          <FormInput
            name="number"
            label="N° de OC"
            placeholder="Ej: OC-0042"
            control={form.control}
            uppercase
          />
          <FormInput
            name="reference"
            label={`N° ${referenceLabel}`}
            placeholder={`Referencia del proveedor (${referenceLabel})`}
            control={form.control}
            uppercase
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
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <FileUploadWithCamera
              label="PDF de la Orden de Compra"
              accept="application/pdf"
              value={file}
              onChange={(f) => setFile(f)}
              disabled={isSubmitting}
            />
            {mode === "update" && existingFileUrl && !file && (
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary underline underline-offset-2 w-fit"
              >
                Ver PDF actual
              </a>
            )}
          </div>
          <FormInput
            name="notes"
            label="Notas"
            control={form.control}
            className="md:col-span-2"
            uppercase
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
