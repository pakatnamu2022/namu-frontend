"use client";

import { useForm } from "react-hook-form";
import {
  VehicleSchema,
  vehicleSchemaCreate,
  vehicleSchemaUpdate,
} from "../lib/vehicles.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Loader, MapPin } from "lucide-react";
import { FormSelect } from "@/src/shared/components/FormSelect";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { useAllModelsVn } from "@/src/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { useAllVehicleColor } from "@/src/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.hook";
import { useAllEngineTypes } from "@/src/features/ap/configuraciones/vehiculos/tipos-motor/lib/engineTypes.hook";
import { useWarehouseByModelSede } from "@/src/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { GroupFormSection } from "@/src/shared/components/GroupFormSection";

interface VehicleFormProps {
  defaultValues: Partial<VehicleSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const VehicleForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: VehicleFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? vehicleSchemaCreate : vehicleSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Hooks for data
  const { data: modelsVn = [], isLoading: isLoadingModelsVn } =
    useAllModelsVn();
  const { data: colors = [], isLoading: isLoadingColors } =
    useAllVehicleColor();
  const { data: engineTypes = [], isLoading: isLoadingEngineTypes } =
    useAllEngineTypes();

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useWarehouseByModelSede({
      model_vn_id: String(form.watch("ap_models_vn_id")),
    });

  const isLoading =
    isLoadingModelsVn || isLoadingColors || isLoadingEngineTypes;

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información del Vehículo */}
        <GroupFormSection
          title="Información del Vehículo"
          icon={Car}
          cols={{ sm: 1, md: 2 }}
        >
          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 1HGBH41AX1N109189"
                    maxLength={17}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 2025"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="engine_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Motor</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: ENG32345XYZA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            placeholder="Seleccionar modelo"
            control={form.control}
            label={"Modelo"}
            name="ap_models_vn_id"
            options={modelsVn.map((model) => ({
              value: model.id.toString(),
              label: `${model.code} - ${model.version}`,
            }))}
          />

          <FormSelect
            placeholder="Seleccionar color"
            control={form.control}
            label={"Color"}
            name="vehicle_color_id"
            options={colors.map((color) => ({
              value: color.id.toString(),
              label: color.description,
            }))}
          />

          <FormSelect
            placeholder="Seleccionar tipo de motor"
            control={form.control}
            label={"Tipo de Motor"}
            name="engine_type_id"
            options={engineTypes.map((type) => ({
              value: type.id.toString(),
              label: type.description,
            }))}
          />
        </GroupFormSection>

        {/* Ubicación */}
        <GroupFormSection
          title="Ubicación"
          icon={MapPin}
          cols={{ sm: 1, md: 2 }}
        >
          <FormSelect
            name="physical_warehouse"
            placeholder="Seleccionar almacén"
            control={form.control}
            options={warehouses.map((warehouse) => ({
              value: warehouse.id.toString(),
              label: warehouse.description,
            }))}
            label={"Almacén Físico"}
            disabled={isLoadingWarehouses}
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting
              ? "Guardando"
              : mode === "create"
              ? "Crear Vehículo"
              : "Actualizar Vehículo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
