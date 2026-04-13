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
  useVehicleById,
  useVehicles,
} from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import {
  Car,
  ExternalLink,
  FileText,
  User,
  Gauge,
  Calendar,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import CustomerModal from "@/features/ap/comercial/clientes/components/CustomerModal";
import { EMPRESA_AP, STATUS_ACTIVE } from "@/core/core.constants";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { OrderQuotationResource } from "../lib/proforma.interface";
import { VEHICLES_TLL } from "@/features/ap/comercial/vehiculos/lib/vehicles.constants";
import { AREA_TALLER } from "@/features/ap/ap-master/lib/apMaster.constants";
import { DataCard } from "@/components/DataCard";
import { FormSwitch } from "@/shared/components/FormSwitch";

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
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? orderQuotationSchemaCreate
        : orderQuotationSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      area_id: AREA_TALLER.toString(),
    },
    mode: "onChange",
  });

  const quotationDate = form.watch("quotation_date");
  const vehicleId = form.watch("vehicle_id");

  const { data: vehicleById } = useVehicleById(Number(vehicleId) || 0);

  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes({
      enable_after_sales: STATUS_ACTIVE,
    });

  useEffect(() => {
    setSelectedVehicle(vehicleById ?? null);
  }, [vehicleById]);

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

  if (isLoadingMySedes || isLoadingCurrencyTypes)
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
            label="Moneda"
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
              onClick={() => setIsCustomerModalOpen(true)}
              tooltip="Agregar nuevo cliente"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </FormSelectAsync>

          <FormSelectAsync
            placeholder="Seleccionar vehículo"
            control={form.control}
            label={"Vehículo"}
            name="vehicle_id"
            useQueryHook={useVehicles}
            mapOptionFn={(item: VehicleResource) => ({
              value: item.id.toString(),
              label: item.plate
                ? `${item.plate} - ${item.vin || ""}`
                : item.vin || "-",
            })}
            perPage={10}
            debounceMs={500}
            defaultOption={
              proforma
                ? {
                    value: proforma.vehicle.id.toString(),
                    label: proforma.vehicle.plate
                      ? `${proforma.vehicle.plate} - ${proforma.vehicle.vin || ""}`
                      : proforma.vehicle.vin || "-",
                  }
                : undefined
            }
          >
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="aspect-square"
              onClick={() => window.open(VEHICLES_TLL.ROUTE_ADD, "_blank")}
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
          <DataCard
            title="INFORMACIÓN DEL VEHÍCULO"
            columns={3}
            fields={[
              {
                key: "vin",
                label: "VIN",
                icon: FileText,
                value: selectedVehicle.vin || "N/A",
              },
              {
                key: "brand",
                label: "Marca",
                icon: Car,
                value: selectedVehicle.model?.brand || "N/A",
              },
              {
                key: "model",
                label: "Modelo",
                icon: FileText,
                value: selectedVehicle.model?.version || "N/A",
              },
              {
                key: "year",
                label: "Año",
                icon: Calendar,
                value: selectedVehicle.year || "N/A",
              },
              {
                key: "color",
                label: "Color",
                icon: Car,
                value: selectedVehicle.vehicle_color || "N/A",
              },
              {
                key: "engine_type",
                label: "Motor",
                icon: Gauge,
                value: selectedVehicle.engine_type || "N/A",
              },
              {
                key: "engine_number",
                label: "N° Motor",
                icon: FileText,
                value: selectedVehicle.engine_number || "N/A",
              },
            ]}
            sections={
              selectedVehicle.owner
                ? [
                    {
                      key: "owner",
                      title: "Propietario",
                      icon: User,
                      fields: [
                        {
                          key: "owner_name",
                          label: "Nombre",
                          icon: User,
                          value: selectedVehicle.owner.full_name || "N/A",
                        },
                        {
                          key: "owner_document",
                          label: "Documento",
                          icon: FileText,
                          value: selectedVehicle.owner.num_doc || "N/A",
                        },
                        {
                          key: "owner_phone",
                          label: "Teléfono",
                          icon: User,
                          value: selectedVehicle.owner.phone || "N/A",
                        },
                      ],
                    },
                  ]
                : undefined
            }
          />
        )}

        <FormSwitch
          control={form.control}
          name="is_requested_by_management"
          text={form.watch("is_requested_by_management") ? "Si" : "No"}
          label="¿Solicitado por Gerencia?"
          description="Indica si esta cotización ha sido solicitada por el área de gerencia."
        />

        <FormTextArea
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

      <CustomerModal
        open={isCustomerModalOpen}
        onClose={(newCustomer) => {
          setIsCustomerModalOpen(false);
          if (newCustomer) {
            form.setValue("client_id", newCustomer.id.toString(), {
              shouldValidate: true,
            });
          }
        }}
        title="Agregar Nuevo Cliente"
      />
    </Form>
  );
}
