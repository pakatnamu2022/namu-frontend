"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, Plus } from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Link } from "react-router-dom";
import { FormSelect } from "@/shared/components/FormSelect";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import {
  OpportunitySchema,
  opportunitySchemaCreate,
  opportunitySchemaUpdate,
} from "../lib/opportunities.schema";
import {
  useOpportunityStatuses,
  useClientStatuses,
  useOpportunityTypes,
  useFamilies,
} from "../lib/opportunities.hook";
import { useAllCustomers } from "../../clientes/lib/customers.hook";
import { TYPE_BUSINESS_PARTNERS } from "@/core/core.constants";
import { FamiliesResource } from "@/features/ap/configuraciones/vehiculos/familias/lib/families.interface";
import { OPPORTUNITIES } from "../lib/opportunities.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";

interface OpportunityFormProps {
  defaultValues: Partial<OpportunitySchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  clientId?: number;
  showClientSelector?: boolean; // New prop to control if client selector is shown
  leadBrandId?: number;
}

export const OpportunityForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  clientId,
  showClientSelector = false,
  leadBrandId,
}: OpportunityFormProps) => {
  const { ABSOLUTE_ROUTE } = OPPORTUNITIES;
  const router = useNavigate();
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? opportunitySchemaCreate : opportunitySchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      client_id: clientId?.toString() || defaultValues?.client_id?.toString(),
    },
    mode: "onChange",
  });

  const { data: opportunityStatuses, isLoading: isLoadingStatuses } =
    useOpportunityStatuses();
  const { data: clientStatuses, isLoading: isLoadingClientStatuses } =
    useClientStatuses();
  const { data: opportunityTypes, isLoading: isLoadingTypes } =
    useOpportunityTypes();
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useAllCustomers({
      type: [TYPE_BUSINESS_PARTNERS.CLIENTE, TYPE_BUSINESS_PARTNERS.AMBOS],
    });

  const isLoading =
    isLoadingStatuses ||
    isLoadingClientStatuses ||
    isLoadingTypes ||
    (showClientSelector && isLoadingCustomers);

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showClientSelector && (
            <div className="col-span-1 md:col-span-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <FormSelect
                    name="client_id"
                    label="Cliente"
                    placeholder="Selecciona cliente"
                    options={
                      customers?.map((item: any) => ({
                        label: `${item.full_name} - ${item.num_doc}`,
                        value: item.id.toString(),
                      })) || []
                    }
                    control={form.control}
                    strictFilter={true}
                  />
                </div>
                <Link to="/ap/comercial/clientes/agregar?redirect_to=opportunities">
                  <Button type="button" variant="outline" className="h-10">
                    <Plus className="size-4 mr-2" />
                    Agregar Cliente
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <FormSelectAsync
            name="family_id"
            label="Familia de Producto"
            placeholder="Selecciona familia"
            useQueryHook={useFamilies}
            mapOptionFn={(item: FamiliesResource) => ({
              label: item.brand + " " + item.description,
              value: item.id.toString(),
            })}
            control={form.control}
            additionalParams={leadBrandId ? { brand_id: leadBrandId } : {}}
          />

          <FormSelect
            name="opportunity_type_id"
            label="Tipo de Oportunidad"
            placeholder="Selecciona tipo"
            options={
              opportunityTypes?.data?.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              })) || []
            }
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            name="client_status_id"
            label="Estado del Cliente"
            placeholder="Selecciona estado"
            options={
              clientStatuses?.data?.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              })) || []
            }
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            name="opportunity_status_id"
            label="Estado de la Oportunidad"
            placeholder="Selecciona estado"
            options={
              opportunityStatuses?.data?.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              })) || []
            }
            control={form.control}
            strictFilter={true}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <ConfirmationDialog
            trigger={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
            title="¿Cancelar registro?"
            variant="destructive"
            icon="warning"
            onConfirm={() => {
              router(ABSOLUTE_ROUTE);
            }}
          />

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando..." : "Guardar Oportunidad"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
