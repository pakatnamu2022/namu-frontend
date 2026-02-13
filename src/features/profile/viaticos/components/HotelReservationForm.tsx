"use client";

import { useForm } from "react-hook-form";
import {
  HotelReservationSchema,
  hotelReservationSchema,
} from "../lib/hotelReservation.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Upload } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { FormSelect } from "@/shared/components/FormSelect";
import { Option } from "@/core/core.interface";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";
import { HotelAgreementResource } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.interface";

interface HotelReservationFormProps {
  defaultValues?: Partial<HotelReservationSchema>;
  onSubmit: (data: HotelReservationSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  hotelAgreements: HotelAgreementResource[];
  perDiemStartDate?: string | Date;
  perDiemEndDate?: string | Date;
  mode?: "create" | "update";
  existingFileUrl?: string;
}

export const HotelReservationForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
  hotelAgreements,
  perDiemStartDate,
  perDiemEndDate,
  mode = "create",
  existingFileUrl,
}: HotelReservationFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Convertir las fechas del viático a Date para validación
  const tripStartDate = useMemo(() => {
    if (!perDiemStartDate) return undefined;
    return new Date(perDiemStartDate);
  }, [perDiemStartDate]);

  const tripEndDate = useMemo(() => {
    if (!perDiemEndDate) return undefined;
    return new Date(perDiemEndDate);
  }, [perDiemEndDate]);

  // Convertir hotelAgreements a opciones para FormSelect
  const hotelAgreementOptions: Option[] = useMemo(() => {
    const options: Option[] = [];

    hotelAgreements.forEach((agreement) => {
      options.push({
        value: agreement.id.toString(),
        label: `${agreement.name} - ${agreement.city} (S/ ${agreement.corporate_rate})`,
      });
    });

    return options;
  }, [hotelAgreements]);

  const form = useForm<HotelReservationSchema>({
    resolver: zodResolver(hotelReservationSchema) as any,
    defaultValues: {
      hotel_agreement_id: "",
      hotel_name: "",
      address: "",
      phone: "",
      checkin_date: perDiemStartDate || "",
      checkout_date: perDiemEndDate || "",
      total_cost: 0,
      notes: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Actualizar costo total y campos cuando cambian las fechas o el convenio
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Autocompletar campos cuando se selecciona un convenio
      if (name === "hotel_agreement_id") {
        const agreementValue = value.hotel_agreement_id;

        if (
          !agreementValue ||
          (typeof agreementValue === "string" && agreementValue === "none")
        ) {
          form.setValue("ruc", "");
          form.setValue("hotel_name", "");
          form.setValue("address", "");
          form.setValue("phone", "");
          return;
        }

        const agreementId =
          typeof agreementValue === "string"
            ? parseInt(agreementValue)
            : agreementValue;
        const agreement = hotelAgreements.find((a) => a.id === agreementId);

        if (agreement) {
          form.setValue("ruc", agreement.ruc);
          form.setValue("hotel_name", agreement.name);
          form.setValue("address", agreement.address);
          form.setValue("phone", agreement.phone);

          // Sugerir el costo basado en la tarifa corporativa y las noches
          const checkin = form.getValues("checkin_date");
          const checkout = form.getValues("checkout_date");
          if (checkin && checkout) {
            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);
            const nights = Math.ceil(
              (checkoutDate.getTime() - checkinDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            const corporateRate = parseFloat(agreement.corporate_rate);
            if (!isNaN(corporateRate) && nights > 0) {
              form.setValue("total_cost", corporateRate * nights);
            }
          }
        }
      }

      // Actualizar costo total cuando cambian las fechas
      if (name === "checkin_date" || name === "checkout_date") {
        const checkin = value.checkin_date;
        const checkout = value.checkout_date;
        const agreementId = value.hotel_agreement_id;

        if (checkin && checkout && agreementId) {
          const checkinDate = new Date(checkin);
          const checkoutDate = new Date(checkout);
          const nights = Math.ceil(
            (checkoutDate.getTime() - checkinDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          const agreement = hotelAgreements.find(
            (a) => a.id === Number(agreementId),
          );
          if (agreement && nights > 0) {
            const corporateRate = parseFloat(agreement.corporate_rate);
            if (!isNaN(corporateRate)) {
              form.setValue("total_cost", corporateRate * nights);
            }
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, hotelAgreements]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("receipt_file", file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Selector de Convenio */}
        <FormSelect
          control={form.control}
          name="hotel_agreement_id"
          label="Convenio de Hotel (Opcional)"
          placeholder="Selecciona un convenio"
          options={hotelAgreementOptions}
          description="Selecciona un convenio para autocompletar los datos del hotel"
        />

        {/* Dirección */}
        <FormInput
          control={form.control}
          name="ruc"
          label="RUC del Hotel"
          placeholder="Ej: 20512345678"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre del Hotel */}
          <FormInput
            control={form.control}
            name="hotel_name"
            label="Nombre del Hotel"
            placeholder="Ej: Hotel Costa del Sol"
          />

          {/* Teléfono */}
          <FormInput
            control={form.control}
            name="phone"
            label="Teléfono"
            placeholder="Ej: (01) 123-4567"
          />
        </div>

        {/* Dirección */}
        <FormInput
          control={form.control}
          name="address"
          label="Dirección"
          placeholder="Ej: Av. Principal 123, Distrito"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check-in */}
          <DateTimePickerForm
            control={form.control}
            name="checkin_date"
            label="Fecha y Hora de Check-in"
            placeholder="Selecciona fecha y hora de entrada"
            minDate={tripStartDate}
            maxDate={tripEndDate}
            description={`Rango permitido: ${
              tripStartDate
                ? new Date(tripStartDate).toLocaleDateString("es-PE")
                : "N/A"
            } - ${
              tripEndDate
                ? new Date(tripEndDate).toLocaleDateString("es-PE")
                : "N/A"
            }`}
          />

          {/* Check-out */}
          <DateTimePickerForm
            control={form.control}
            name="checkout_date"
            label="Fecha y Hora de Check-out"
            placeholder="Selecciona fecha y hora de salida"
            minDate={tripStartDate}
            maxDate={tripEndDate}
            description={`Debe ser posterior al check-in y dentro del periodo del viaje`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Costo Total */}
          <FormInput
            control={form.control}
            name="total_cost"
            label="Costo Total (S/)"
            placeholder="0.00"
          />
          {/* Nro del Documento */}
          <FormInput
            control={form.control}
            name="document_number"
            label="Nro del Documento"
            placeholder="Ej: F001-123456"
          />
        </div>

        {/* Comprobante */}
        <FormField
          control={form.control}
          name="receipt_file"
          render={() => (
            <FormItem>
              <FormLabel>
                Comprobante{" "}
                {mode === "create" && <span className="text-red-500">*</span>}
                {mode === "update" && (
                  <span className="text-muted-foreground text-sm">
                    (Opcional - dejar en blanco para mantener el actual)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <span className="text-muted-foreground">
                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                  {!selectedFile && existingFileUrl && mode === "update" && (
                    <div className="text-sm text-muted-foreground">
                      Archivo actual:{" "}
                      <a
                        href={existingFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Ver comprobante
                      </a>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Formatos permitidos: PDF, JPG, JPEG, PNG. Tamaño máximo: 10MB
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notas */}
        <FormInputText
          control={form.control}
          name="notes"
          label="Notas (Opcional)"
          placeholder="Observaciones adicionales sobre la reserva..."
        />

        <div className="flex gap-4 w-full justify-end pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}

          <Button type="submit" disabled={isSubmitting}>
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting
              ? "Guardando..."
              : mode === "update"
                ? "Actualizar Reserva"
                : "Crear Reserva"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
