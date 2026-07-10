import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { AREA_OPTIONS } from "@/features/ap/ap-master/lib/apMaster.constants";
import {
  CampaignSchema,
  campaignSchemaCreate,
  campaignSchemaUpdate,
} from "../lib/campaign.schema";
import { CAMPAIGN, DISCOUNT_TYPE_OPTIONS } from "../lib/campaign.constants";

interface CampaignFormProps {
  defaultValues: Partial<CampaignSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const CampaignForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: CampaignFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? campaignSchemaCreate : campaignSchemaUpdate,
    ),
    defaultValues: {
      status: true,
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = CAMPAIGN;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormSelect
            name="area_id"
            label="Área"
            placeholder="Selecciona un Área"
            options={AREA_OPTIONS}
            control={form.control}
          />
          <FormInput
            control={form.control}
            name="code"
            label="Código"
            placeholder="Ej: CPD826"
            maxLength={50}
          />
          <FormInput
            control={form.control}
            name="name"
            label="Nombre"
            placeholder="Ej: Campaña Verano"
            maxLength={150}
          />
          <FormSelect
            name="discount_type"
            label="Tipo de Descuento"
            placeholder="Selecciona un tipo"
            options={DISCOUNT_TYPE_OPTIONS}
            control={form.control}
          />
          <FormInput
            control={form.control}
            name="discount_value"
            label="Valor de Descuento"
            type="number"
            step="0.01"
            min={0}
            placeholder="Ej: 10"
          />
          <FormInput
            control={form.control}
            name="start_date"
            label="Fecha de Inicio"
            type="date"
          />
          <FormInput
            control={form.control}
            name="end_date"
            label="Fecha de Fin"
            type="date"
          />
          <FormTextArea
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Ej: Descripción de la campaña"
            className="md:col-span-2 lg:col-span-3"
          />
          <FormSwitch
            name="status"
            label="Estado"
            text={form.watch("status") ? "Activo" : "Inactivo"}
            control={form.control}
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE!}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Campaña"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
