"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { VEHICLES } from "../lib/vehicles.constants";
import { storeVehicle } from "../lib/vehicles.actions";
import { CM_COMERCIAL_ID, EMPRESA_AP } from "@/core/core.constants";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useModelsVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { useVehicleColor } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.hook";
import { VehicleColorResource } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.interface";
import { useAllEngineTypes } from "@/features/ap/configuraciones/vehiculos/tipos-motor/lib/engineTypes.hook";
import { useWarehouseByModelSede } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import { useEffect } from "react";

// Schema para vehículos comerciales
const vehicleComercialSchema = z.object({
  sede_id: z.string().min(1, "La sede es requerida"),
  plate: z.string().length(6, "La placa debe tener 6 caracteres"),
  vin: z.string().length(17, "El VIN debe tener 17 caracteres"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  engine_number: z.string().min(1, "El número de motor es requerido"),
  ap_models_vn_id: z.string().min(1, "El modelo es requerido"),
  vehicle_color_id: z.string().min(1, "El color es requerido"),
  engine_type_id: z.string().min(1, "El tipo de motor es requerido"),
  warehouse_physical_id: z.string().min(1, "El almacén es requerido"),
});

type VehicleComercialSchema = z.infer<typeof vehicleComercialSchema>;

interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  typeOperationId?: number;
}

export default function VehicleModal({
  open,
  onClose,
  title = "Agregar Vehículo Comercial",
  typeOperationId = CM_COMERCIAL_ID,
}: VehicleModalProps) {
  const queryClient = useQueryClient();
  const { MODEL, ICON } = VEHICLES;

  const form = useForm<VehicleComercialSchema>({
    resolver: zodResolver(vehicleComercialSchema),
    defaultValues: {
      sede_id: "",
      plate: "",
      vin: "",
      year: new Date().getFullYear(),
      engine_number: "",
      ap_models_vn_id: "",
      vehicle_color_id: "",
      engine_type_id: "",
      warehouse_physical_id: "",
    },
    mode: "onChange",
  });

  const { data: engineTypes = [] } = useAllEngineTypes();
  const { data: mySedes = [] } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const { data: warehouses = [] } = useWarehouseByModelSede({
    model_vn_id: String(form.watch("ap_models_vn_id")),
    sede_id: String(form.watch("sede_id")),
    is_received: 1,
  });

  // Auto-seleccionar el primer almacén cuando se carguen los datos
  useEffect(() => {
    if (warehouses.length > 0 && !form.watch("warehouse_physical_id")) {
      form.setValue("warehouse_physical_id", warehouses[0].id.toString());
    }
  }, [warehouses, form]);

  // Auto-seleccionar primera sede por defecto
  useEffect(() => {
    if (mySedes.length > 0 && !form.getValues("sede_id")) {
      form.setValue("sede_id", mySedes[0].id.toString(), {
        shouldValidate: true,
      });
    }
  }, [mySedes, form]);

  const { mutate: createVehicle, isPending: isCreating } = useMutation({
    mutationFn: storeVehicle,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      queryClient.invalidateQueries({ queryKey: [VEHICLES.QUERY_KEY] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (
    data: VehicleComercialSchema,
    e?: React.BaseSyntheticEvent,
  ): void => {
    e?.preventDefault();
    e?.stopPropagation();
    createVehicle({
      ...data,
      type_operation_id: String(typeOperationId),
    } as any);
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      icon={ICON}
      subtitle="Completa los datos para agregar un nuevo vehículo comercial"
      size="4xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormLabel>Placa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: ABC123"
                      {...field}
                      maxLength={6}
                      className="uppercase"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
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
                      className="uppercase"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
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
                    <Input
                      placeholder="Ej: ENG32345XYZA"
                      {...field}
                      className="uppercase"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSelectAsync
              control={form.control}
              name="ap_models_vn_id"
              label="Modelo"
              placeholder="Seleccionar modelo"
              useQueryHook={useModelsVn}
              mapOptionFn={(item: ModelsVnResource) => ({
                value: item.id.toString(),
                label: `${item.code} - ${item.version}`,
              })}
              perPage={10}
              debounceMs={500}
            />

            <FormSelectAsync
              name="vehicle_color_id"
              label="Color"
              placeholder="Seleccionar color"
              control={form.control}
              useQueryHook={useVehicleColor}
              mapOptionFn={(item: VehicleColorResource) => ({
                value: item.id.toString(),
                label: item.description,
              })}
              perPage={10}
              debounceMs={500}
            />

            <FormSelect
              placeholder="Seleccionar tipo de motor"
              control={form.control}
              label="Tipo de Motor"
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
              label="Almacén Físico"
              disabled={!form.watch("ap_models_vn_id") || !form.watch("sede_id")}
            />
          </div>

          <div className="flex gap-4 w-full justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isCreating || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 animate-spin ${!isCreating ? "hidden" : ""}`}
              />
              {isCreating ? "Guardando..." : "Crear Vehículo"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
