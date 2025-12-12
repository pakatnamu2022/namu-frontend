"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  OrderQuotationSchema,
  orderQuotationSchemaCreate,
  orderQuotationSchemaUpdate,
} from "../lib/proforma.schema";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllVehicles } from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { Car, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface OrderQuotationFormProps {
  defaultValues: Partial<OrderQuotationSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export default function OrderQuotationForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: OrderQuotationFormProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? orderQuotationSchemaCreate
        : orderQuotationSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const quotationDate = form.watch("quotation_date");
  const vehicleId = form.watch("vehicle_id");

  const { data: vehicles = [], isLoading: isLoadingVehicles } =
    useAllVehicles();

  useEffect(() => {
    if (vehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find((v) => v.id.toString() === vehicleId);
      setSelectedVehicle(vehicle || null);
    } else {
      setSelectedVehicle(null);
    }
  }, [vehicleId, vehicles]);

  useEffect(() => {
    if (quotationDate) {
      const quotationDateObj = new Date(quotationDate);
      const expirationDateObj = new Date(quotationDateObj);
      expirationDateObj.setDate(quotationDateObj.getDate() + 7);
      form.setValue("expiration_date", expirationDateObj);
    } else {
      form.setValue("expiration_date", "");
    }
  }, [quotationDate, form]);

  if (isLoadingVehicles) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormSelect
            name="vehicle_id"
            label="Vehículo"
            placeholder="Seleccione vehículo"
            options={vehicles.map((item) => ({
              label: `${item.vin || "S/N"} | ${item.plate || ""} | ${
                item.model?.brand || ""
              }`,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <DatePickerFormField
            control={form.control}
            name="quotation_date"
            label="Fecha de Apertura"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={{ before: new Date() }}
          />

          <DatePickerFormField
            control={form.control}
            name="expiration_date"
            label="Fecha de Vencimiento"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabled={true}
          />
        </div>

        {/* Información del Vehículo Seleccionado */}
        {selectedVehicle && (
          <div className="col-span-1 md:col-span-3">
            <Card className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Car className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-gray-800">
                  Información del Vehículo
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">VIN</p>
                  <p className="font-semibold text-sm">
                    {selectedVehicle.vin || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Marca</p>
                  <p className="font-semibold text-sm">
                    {selectedVehicle.model?.brand || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Modelo</p>
                  <p className="font-semibold text-sm truncate">
                    {selectedVehicle.model?.version || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Año</p>
                  <p className="font-semibold text-sm">
                    {selectedVehicle.year || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Color</p>
                  <p className="font-semibold text-sm">
                    {selectedVehicle.vehicle_color || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Motor</p>
                  <p className="font-semibold text-sm">
                    {selectedVehicle.engine_type || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">N° Motor</p>
                  <p className="font-semibold text-sm">
                    {selectedVehicle.engine_number || "N/A"}
                  </p>
                </div>
                {selectedVehicle.owner !== null && (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 pt-2 border-t border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-primary" />
                      <p className="text-xs font-semibold text-gray-700">
                        Propietario
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Nombre</p>
                        <p className="font-medium text-sm">
                          {selectedVehicle.owner.full_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Documento</p>
                        <p className="font-medium text-sm">
                          {selectedVehicle.owner.num_doc}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Teléfono</p>
                        <p className="font-medium text-sm">
                          {selectedVehicle.owner.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Notas adicionales sobre la cotización..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
              ? "Crear Cotización"
              : "Actualizar Cotización"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
