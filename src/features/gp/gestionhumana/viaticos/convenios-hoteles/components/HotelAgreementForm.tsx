"use client";

import { useForm } from "react-hook-form";
import {
  HotelAgreementSchema,
  HotelAgreementSchemaUpdate,
  hotelAgreementSchemaCreate,
  hotelAgreementSchemaUpdate,
} from "../lib/hotelAgreement.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";

interface HotelAgreementFormProps {
  defaultValues: Partial<HotelAgreementSchema | HotelAgreementSchemaUpdate>;
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
  const form = useForm<HotelAgreementSchema | HotelAgreementSchemaUpdate>({
    resolver: zodResolver(
      mode === "create"
        ? hotelAgreementSchemaCreate
        : hotelAgreementSchemaUpdate,
    ) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="ruc"
            label="RUC"
            placeholder="Ej: 20123456789"
            type="text"
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
        </div>

        <FormInput
          control={form.control}
          name="address"
          label="Dirección"
          placeholder="Ej: Av. Principal 123, Distrito"
          type="text"
        />

        <FormInputText
          control={form.control}
          name="features"
          label="Características (Opcional)"
          placeholder="Ej: WiFi, Piscina, Gimnasio, Room Service..."
          description="Describe las amenidades y servicios del hotel"
        />

        <div className="space-y-4 rounded-md border p-4">
          <h3 className="font-medium text-sm">Servicios Incluidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="includes_breakfast"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Incluye Desayuno</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includes_lunch"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Incluye Almuerzo</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includes_dinner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Incluye Cena</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includes_parking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Incluye Estacionamiento</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {mode === "update" && (
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Convenio Activo</FormLabel>
                  <FormDescription>
                    Marcar si este convenio está vigente actualmente
                  </FormDescription>
                </div>
              </FormItem>
            )}
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
