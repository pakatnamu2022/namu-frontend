"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  OrderQuotationSchema,
  orderQuotationSchemaCreate,
  orderQuotationSchemaUpdate,
} from "../lib/proforma.schema";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import {
  useAllVehicles,
  useVehicles,
} from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { Car, ExternalLink, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { EMPRESA_AP, STATUS_ACTIVE } from "@/core/core.constants";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { AREA_PM_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { FormInputText } from "@/shared/components/FormInputText";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { CUSTOMERS_PV } from "@/features/ap/comercial/clientes/lib/customers.constants";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { OrderQuotationResource } from "../lib/proforma.interface";

interface OrderQuotationFormProps {
  defaultValues: Partial<OrderQuotationSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  proforma?: OrderQuotationResource;
}

export default function OrderQuotationForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  proforma,
}: OrderQuotationFormProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? orderQuotationSchemaCreate
        : orderQuotationSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      area_id: AREA_PM_ID.TALLER,
    },
    mode: "onChange",
  });

  const quotationDate = form.watch("quotation_date");
  const vehicleId = form.watch("vehicle_id");

  const { data: vehicles = [], isLoading: isLoadingVehicles } =
    useAllVehicles();

  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes({
      enable_after_sales: STATUS_ACTIVE,
    });

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

  useEffect(() => {
    if (mode === "create") {
      if (mySedes.length > 0 && !form.getValues("sede_id")) {
        form.setValue("sede_id", mySedes[0].id.toString());
      }
      if (!form.getValues("quotation_date")) {
        form.setValue("quotation_date", new Date());
      }
    }
  }, [mode, mySedes, form]);

  if (isLoadingVehicles || isLoadingMySedes || isLoadingCurrencyTypes)
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormSelect
            control={form.control}
            name="currency_id"
            options={currencyTypes.map((type) => ({
              value: type.id.toString(),
              label: type.name,
            }))}
            label="Moneda (Cotizar repuestos)"
            placeholder="Seleccionar moneda"
            required
          />

          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona una sede"
            options={mySedes.map((item) => ({
              label: item.abreviatura,
              value: item.id.toString(),
            }))}
            control={form.control}
            required
          />

          <FormSelectAsync
            placeholder="Seleccionar cliente"
            control={form.control}
            label={"Cliente"}
            name="client_id"
            useQueryHook={useCustomers}
            mapOptionFn={(item: CustomersResource) => ({
              value: item.id.toString(),
              label: `${item.full_name}`,
            })}
            perPage={10}
            debounceMs={500}
            defaultOption={
              proforma
                ? {
                    value: proforma.client.id.toString(),
                    label: `${proforma.client.full_name}`,
                  }
                : undefined
            }
          >
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="aspect-square"
              onClick={() => window.open(CUSTOMERS_PV.ROUTE_ADD, "_blank")}
              tooltip="Agregar nuevo cliente"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </FormSelectAsync>

          <FormSelectAsync
            placeholder="Seleccionar vehículo"
            control={form.control}
            label={"Vehículo (Opcional)"}
            name="vehicle_id"
            useQueryHook={useVehicles}
            mapOptionFn={(item: VehicleResource) => ({
              value: item.id.toString(),
              label: `${item.plate || item.vin} - ${item.model?.code || ""}`,
            })}
            perPage={10}
            debounceMs={500}
            defaultOption={
              proforma
                ? {
                    value: proforma.vehicle.id.toString(),
                    label: `${proforma.vehicle.plate || proforma.vehicle.vin} - ${proforma.vehicle.model?.code || ""}`,
                  }
                : undefined
            }
          >
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="aspect-square"
              onClick={() => window.open(CUSTOMERS_PV.ROUTE_ADD, "_blank")}
              tooltip="Agregar nuevo vehículo"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </FormSelectAsync>

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

        <FormInputText
          name="observations"
          label="Observaciones"
          control={form.control}
          placeholder="Notas adicionales sobre la cotización..."
          required
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
