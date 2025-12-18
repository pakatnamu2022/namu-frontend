"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import {
  ExhibitionVehiclesSchema,
  exhibitionVehiclesSchemaCreate,
  exhibitionVehiclesSchemaUpdate,
} from "../lib/exhibitionVehicles.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { EXHIBITION_VEHICLES } from "../lib/exhibitionVehicles.constants";
import { useAllSuppliers } from "../../proveedores/lib/suppliers.hook";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useAllVehicleStatus } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.hook";
import { Switch } from "@/components/ui/switch";

interface ExhibitionVehiclesFormProps {
  defaultValues: Partial<ExhibitionVehiclesSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  isLoadingData?: boolean;
}

export const ExhibitionVehiclesForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ExhibitionVehiclesFormProps) => {
  const { ROUTE } = EXHIBITION_VEHICLES;
  const navigate = useNavigate();

  const form = useForm<ExhibitionVehiclesSchema>({
    resolver: zodResolver(
      mode === "create"
        ? exhibitionVehiclesSchemaCreate
        : exhibitionVehiclesSchemaUpdate
    ),
    defaultValues: {
      status: true,
      items: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Datos para los selects
  const { data: suppliers = [] } = useAllSuppliers();
  const { data: warehouses = [] } = useAllWarehouse();
  const { data: workers = [] } = useAllWorkers();
  const { data: vehicleStatuses = [] } = useAllVehicleStatus();

  const handleFormSubmit = (data: ExhibitionVehiclesSchema) => {
    onSubmit(data);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          <GroupFormSection
            title="Información General"
            description="Datos principales del vehículo de exhibición"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Proveedor */}
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Proveedor</FormLabel>
                    <FormControl>
                      <FormSelect
                        options={suppliers.map((s) => ({
                          value: s.id.toString(),
                          label: `${s.full_name} - ${s.num_doc}`,
                        }))}
                        value={field.value?.toString() || ""}
                        onChange={(value) => field.onChange(Number(value))}
                        placeholder="Seleccionar proveedor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número de Guía */}
              <FormField
                control={form.control}
                name="guia_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Guía</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: T603-00077561" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha de Guía */}
              <FormField
                control={form.control}
                name="guia_date"
                render={({ field }) => (
                  <DatePickerFormField
                    field={field}
                    label="Fecha de Guía"
                    placeholder="Seleccionar fecha"
                  />
                )}
              />

              {/* Fecha de Llegada */}
              <FormField
                control={form.control}
                name="llegada"
                render={({ field }) => (
                  <DatePickerFormField
                    field={field}
                    label="Fecha de Llegada"
                    placeholder="Seleccionar fecha"
                  />
                )}
              />

              {/* Ubicación */}
              <FormField
                control={form.control}
                name="ubicacion_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <FormSelect
                        options={warehouses.map((w) => ({
                          value: w.id.toString(),
                          label: w.description,
                        }))}
                        value={field.value?.toString() || ""}
                        onChange={(value) => field.onChange(Number(value))}
                        placeholder="Seleccionar ubicación"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Asesor */}
              <FormField
                control={form.control}
                name="advisor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asesor (Opcional)</FormLabel>
                    <FormControl>
                      <FormSelect
                        options={workers.map((w) => ({
                          value: w.id.toString(),
                          label: w.nombre_completo,
                        }))}
                        value={field.value?.toString() || ""}
                        onChange={(value) =>
                          field.onChange(value ? Number(value) : null)
                        }
                        placeholder="Seleccionar asesor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Propietario */}
              <FormField
                control={form.control}
                name="propietario_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Propietario (Opcional)</FormLabel>
                    <FormControl>
                      <FormSelect
                        options={workers.map((w) => ({
                          value: w.id.toString(),
                          label: w.nombre_completo,
                        }))}
                        value={field.value?.toString() || ""}
                        onChange={(value) =>
                          field.onChange(value ? Number(value) : null)
                        }
                        placeholder="Seleccionar propietario"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado del Vehículo */}
              <FormField
                control={form.control}
                name="ap_vehicle_status_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del Vehículo</FormLabel>
                    <FormControl>
                      <FormSelect
                        options={vehicleStatuses.map((vs) => ({
                          value: vs.id.toString(),
                          label: vs.description,
                        }))}
                        value={field.value?.toString() || ""}
                        onChange={(value) => field.onChange(Number(value))}
                        placeholder="Seleccionar estado"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pedido Sucursal */}
              <FormField
                control={form.control}
                name="pedido_sucursal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido Sucursal (Opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el pedido" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número DUA */}
              <FormField
                control={form.control}
                name="dua_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número DUA</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: DUA-2025-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observaciones */}
              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Observaciones (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ingrese observaciones..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-full">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Estado</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Activar o desactivar el registro
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </GroupFormSection>

          {/* TODO: Aquí agregar la sección de Items (vehículos y equipos) */}
          {/* Esta sección requiere un componente de array dinámico con useFieldArray */}
          <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
            <p className="text-sm">
              Nota: La gestión de items (vehículos y equipos) requiere implementación adicional con useFieldArray.
            </p>
            <p className="text-xs mt-2">
              Por favor, completa esta sección según los requisitos específicos del negocio.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTE)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Crear" : "Actualizar"}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        open={false}
        onOpenChange={() => {}}
        onConfirm={() => navigate(ROUTE)}
        title="¿Cancelar cambios?"
        description="Los cambios no guardados se perderán. ¿Desea continuar?"
        confirmText="Sí, cancelar"
        cancelText="No, continuar editando"
      />
    </>
  );
};
