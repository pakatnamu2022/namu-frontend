"use client";

import { useForm } from "react-hook-form";
import {
  HotelAgreementSchema,
  hotelAgreementSchemaCreate,
  hotelAgreementSchemaUpdate,
} from "../lib/hotelAgreement.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Info, Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSwitch } from "@/shared/components/FormSwitch";

interface HotelAgreementFormProps {
  defaultValues: Partial<HotelAgreementSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const HotelAgreementForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: HotelAgreementFormProps) => {
  const form = useForm<HotelAgreementSchema>({
    resolver: zodResolver(
      mode === "create"
        ? hotelAgreementSchemaCreate
        : hotelAgreementSchemaUpdate,
    ),
    defaultValues: {
      features: "",
      includes_breakfast: false,
      includes_lunch: false,
      includes_dinner: false,
      includes_parking: false,
      active: true,
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <GroupFormSection
          title="Información del Hotel"
          cols={{
            md: 2,
            lg: 3,
          }}
          icon={Info}
        >
          <FormInput
            control={form.control}
            name="ruc"
            label="RUC"
            placeholder="Ej: 20123456789"
            type="text"
            maxLength={11}
          />

          <FormInput
            control={form.control}
            name="city"
            label="Ciudad"
            placeholder="Ej: Lima"
            type="text"
          />

          <FormInput
            control={form.control}
            name="name"
            label="Nombre del Hotel"
            placeholder="Ej: Hotel Costa del Sol"
            type="text"
          />

          <FormInput
            control={form.control}
            name="corporate_rate"
            label="Tarifa Corporativa (S/)"
            placeholder="Ej: 150.00"
            type="number"
          />

          <FormInput
            control={form.control}
            name="phone"
            label="Teléfono"
            placeholder="Ej: (01) 123-4567"
            type="text"
          />

          <FormInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="Ej: reservas@hotel.com"
            type="email"
          />

          <FormInput
            control={form.control}
            name="website"
            label="Sitio Web"
            placeholder="Ej: https://www.hotel.com"
            type="text"
          />

          <div className="col-span-2">
            <FormInput
              control={form.control}
              name="address"
              label="Dirección"
              placeholder="Ej: Av. Principal 123, Distrito"
              type="text"
            />
          </div>

          <div className="col-span-full">
            <FormTextArea
              control={form.control}
              name="features"
              label="Características (Opcional)"
              placeholder="Ej: WiFi, Piscina, Gimnasio, Room Service..."
              description="Describe las amenidades y servicios del hotel"
            />
          </div>
        </GroupFormSection>

        <GroupFormSection
          title="Servicios Incluidos"
          cols={{
            md: 2,
            lg: 4,
          }}
          icon={Info}
        >
          <FormSwitch
            control={form.control}
            name="includes_breakfast"
            label="Incluye Desayuno"
            text="Desayuno incluido"
          />
          <FormSwitch
            control={form.control}
            name="includes_lunch"
            label="Incluye Almuerzo"
            text="Almuerzo incluido"
          />
          <FormSwitch
            control={form.control}
            name="includes_dinner"
            label="Incluye Cena"
            text="Cena incluida"
          />
          <FormSwitch
            control={form.control}
            name="includes_parking"
            label="Incluye Estacionamiento"
            text="Estacionamiento incluido"
          />
        </GroupFormSection>

        {mode === "update" && (
          <FormSwitch
            control={form.control}
            name="active"
            label="Convenio Activo"
            text="Marcar si este convenio está vigente actualmente"
          />
        )}

        <div className="flex gap-4 w-full justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting ? "Guardando..." : "Guardar Convenio"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
