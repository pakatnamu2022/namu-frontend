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
import { Car, Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useModelsVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { useAllVehicleColor } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.hook";
import { useAllEngineTypes } from "@/features/ap/configuraciones/vehiculos/tipos-motor/lib/engineTypes.hook";
import { useWarehouseByModelSede } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useNavigate } from "react-router-dom";
import { VEHICLES_PV } from "../lib/vehicles.constants";
import { CM_POSTVENTA_ID, EMPRESA_AP } from "@/core/core.constants";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import { usePlateValidation } from "@/shared/hooks/useDocumentValidation";
import { useEffect, useState } from "react";

interface VehiclePVFormProps {
  defaultValues: Partial<VehicleSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const VehiclePVForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: VehiclePVFormProps) => {
  const router = useNavigate();
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? vehicleSchemaCreate : vehicleSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      type_operation_id: String(CM_POSTVENTA_ID),
    },
    mode: "onChange",
  });
  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");
  const { data: colors = [], isLoading: isLoadingColors } =
    useAllVehicleColor();
  const { data: engineTypes = [], isLoading: isLoadingEngineTypes } =
    useAllEngineTypes();
  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });
  const { data: warehouses = [] } = useWarehouseByModelSede({
    model_vn_id: String(form.watch("ap_models_vn_id")),
    sede_id: String(form.watch("sede_id")),
    is_received: 1,
  });

  // Watch para plate
  const plateWatch = form.watch("plate");

  useEffect(() => {
    if (isFirstLoad && plateWatch) {
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, plateWatch]);

  const {
    data: plateData,
    isLoading: isPlateLoading,
    error: plateError,
  } = usePlateValidation(
    plateWatch,
    !isFirstLoad && !!plateWatch && plateWatch.length === Number(6)
  );

  useEffect(() => {
    if (isFirstLoad) return;

    if (plateData?.success && plateData.data) {
      const plateInfo = plateData.data;
      form.setValue("vin", plateInfo.vin);
      form.setValue("engine_number", plateInfo.engine_number);
    } else {
      form.setValue("vin", "");
      form.setValue("engine_number", "");
    }
  }, [plateData, form]);

  // Auto-seleccionar el primer almacén cuando se carguen los datos
  useEffect(() => {
    if (warehouses.length > 0 && !form.watch("warehouse_physical_id")) {
      form.setValue("warehouse_physical_id", warehouses[0].id.toString());
    }
  }, [warehouses, form]);

  // Obtener la información de la API para mostrar como guía
  const apiInfo = plateData?.success && plateData.data ? plateData.data : null;

  const isLoading = isLoadingColors || isLoadingEngineTypes || isLoadingMySedes;

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <GroupFormSection
          title="Información del Vehículo"
          icon={Car}
          cols={{ sm: 1, md: 2 }}
        >
          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona una sede"
            options={mySedes.map((item) => ({
              label: item.abreviatura,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 relative">
                  Nro. Placa
                  <DocumentValidationStatus
                    shouldValidate={true}
                    documentNumber={plateWatch || ""}
                    expectedDigits={6}
                    isValidating={isPlateLoading}
                    leftPosition="right-0"
                  />
                </FormLabel>

                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Número de Placa"
                      {...field}
                      maxLength={8}
                    />
                    <ValidationIndicator
                      show={!!plateWatch}
                      isValidating={isPlateLoading}
                      isValid={plateData?.success && !!plateData.data}
                      hasError={
                        !!plateError || (plateData && !plateData.success)
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormSelectAsync
            control={form.control}
            name="ap_models_vn_id"
            label={() => (
              <FormLabel className="flex items-center gap-2 relative">
                Modelo
                {apiInfo && apiInfo.brand && apiInfo.model && (
                  <span className="absolute right-0 text-xs font-normal text-muted-foreground">
                    {apiInfo.brand} - {apiInfo.model}
                  </span>
                )}
              </FormLabel>
            )}
            placeholder="Seleccionar modelo"
            useQueryHook={useModelsVn}
            mapOptionFn={(model) => ({
              value: model.id.toString(),
              label: `${model.code} - ${model.version}`,
            })}
            perPage={10}
            debounceMs={500}
          />

          <FormField
            control={form.control}
            name="vehicle_color_id"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 relative">
                  Color
                  {apiInfo && apiInfo.color && (
                    <span className="absolute right-0 text-xs font-normal text-muted-foreground">
                      {apiInfo.color}
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <FormSelect
                    placeholder="Seleccionar color"
                    control={form.control}
                    name="vehicle_color_id"
                    options={colors.map((color) => ({
                      value: color.id.toString(),
                      label: color.description,
                    }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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

          <FormSelect
            name="warehouse_physical_id"
            placeholder="Seleccionar almacén"
            control={form.control}
            options={warehouses.map((warehouse) => ({
              value: warehouse.id.toString(),
              label: warehouse.description,
            }))}
            label={"Almacén Físico"}
            disabled={true}
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router(VEHICLES_PV.ABSOLUTE_ROUTE)}
          >
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
