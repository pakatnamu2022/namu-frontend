"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileText, Loader, Truck, User } from "lucide-react";
import {
  shippingGuideSchema,
  ShippingGuideSchema,
} from "../lib/ShippingGuides.schema";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";
import { useLicenseValidation } from "@/shared/hooks/useDocumentValidation";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import { FormSelect } from "@/shared/components/FormSelect";
import {
  SUNAT_CONCEPTS_TYPE,
  SUNAT_CONCEPTS_ID,
} from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface";

interface ShippingGuideFormProps {
  defaultValues?: Partial<ShippingGuideSchema>;
  onSubmit: (data: ShippingGuideSchema) => void;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  onCancel?: () => void;
}

export const ShippingGuideForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  isDisabled = false,
  onCancel,
}: ShippingGuideFormProps) => {
  const form = useForm<ShippingGuideSchema>({
    resolver: zodResolver(shippingGuideSchema) as any,
    defaultValues: {
      transfer_modality_id: defaultValues?.transfer_modality_id || "",
      driver_doc: defaultValues?.driver_doc || "",
      license: defaultValues?.license || "",
      driver_name: defaultValues?.driver_name || "",
      transport_company_id: defaultValues?.transport_company_id || "",
      plate: defaultValues?.plate || "",
      notes: defaultValues?.notes || "",
    },
    mode: "onChange",
  });

  const driverDocChangedByUser = useRef(false);
  const initialDriverDoc = useRef<string>("");

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        transfer_modality_id: defaultValues.transfer_modality_id || "",
        driver_doc: defaultValues.driver_doc || "",
        license: defaultValues.license || "",
        driver_name: defaultValues.driver_name || "",
        transport_company_id: defaultValues.transport_company_id || "",
        plate: defaultValues.plate || "",
        notes: defaultValues.notes || "",
      });
      initialDriverDoc.current = defaultValues.driver_doc || "";
      driverDocChangedByUser.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultValues?.transfer_modality_id,
    defaultValues?.driver_doc,
    defaultValues?.license,
    defaultValues?.driver_name,
    defaultValues?.transport_company_id,
    defaultValues?.plate,
    defaultValues?.notes,
  ]);

  const transferModalityId = form.watch("transfer_modality_id");
  const conductorDni = String(form.watch("driver_doc") ?? "");

  const isPrivateTransport =
    transferModalityId === SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PRIVATE;
  const isPublicTransport =
    transferModalityId === SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PUBLIC;

  useEffect(() => {
    if (!isPrivateTransport || !conductorDni) return;
    if (conductorDni !== initialDriverDoc.current) {
      driverDocChangedByUser.current = true;
    }
  }, [conductorDni, isPrivateTransport]);

  const shouldValidateDriver =
    isPrivateTransport &&
    !!conductorDni &&
    conductorDni.length === 8 &&
    driverDocChangedByUser.current;

  const {
    data: conductorDniData,
    isLoading: isConductorDniLoading,
    error: conductorDniError,
  } = useLicenseValidation(conductorDni, shouldValidateDriver);

  const {
    data: typeTransportation = [],
    isLoading: isLoadingTypeTransportation,
  } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.TYPE_TRANSPORTATION],
  });

  useEffect(() => {
    if (isPublicTransport) {
      form.setValue("driver_doc", "", { shouldValidate: true });
      form.setValue("license", "", { shouldValidate: true });
      form.setValue("driver_name", "", { shouldValidate: true });
      driverDocChangedByUser.current = false;
    } else if (isPrivateTransport) {
      form.setValue("transport_company_id", "", { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferModalityId]);

  useEffect(() => {
    if (!isPrivateTransport) return;
    if (conductorDniData?.success && conductorDniData.data) {
      const licenseInfo = conductorDniData.data;
      if (form.getValues("license") !== (licenseInfo.licencia.numero || "")) {
        form.setValue("license", licenseInfo.licencia.numero || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (form.getValues("driver_name") !== (licenseInfo.full_name || "")) {
        form.setValue("driver_name", licenseInfo.full_name || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else if (conductorDniData !== undefined) {
      if (form.getValues("license") !== "") {
        form.setValue("license", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (form.getValues("driver_name") !== "") {
        form.setValue("driver_name", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conductorDniData, isPrivateTransport]);

  const shouldDisableLicenseFields = Boolean(
    conductorDniData?.success && conductorDniData.data,
  );

  if (isLoadingTypeTransportation) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit as any)}
        className="space-y-4 w-full"
      >
        {/* Sección 1: Información de Traslado */}
        <GroupFormSection
          title="Información de Traslado"
          icon={FileText}
          cols={{ sm: 1 }}
          gap="gap-4"
        >
          <FormSelect
            name="transfer_modality_id"
            label="Modalidad de Traslado"
            placeholder="Selecciona tipo de transporte"
            options={typeTransportation.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas u Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales sobre el traslado..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Sección 2: Datos del Conductor (Transporte Privado) */}
        {isPrivateTransport && (
          <GroupFormSection
            title="Datos del Conductor"
            icon={User}
            cols={{ sm: 1, md: 2 }}
            gap="gap-4"
          >
            <FormInput
              control={form.control}
              name="driver_doc"
              label={
                <div className="flex items-center gap-2 relative">
                  DNI del Conductor
                  <DocumentValidationStatus
                    shouldValidate={true}
                    documentNumber={conductorDni || ""}
                    expectedDigits={8}
                    isValidating={isConductorDniLoading}
                    leftPosition="right-0"
                  />
                </div>
              }
              placeholder="Ej: 12345678"
              inputMode="numeric"
              maxLength={8}
              disabled={isDisabled}
              addonEnd={
                <ValidationIndicator
                  show={!!conductorDni}
                  isValidating={isConductorDniLoading}
                  isValid={conductorDniData?.success && !!conductorDniData.data}
                  hasError={
                    !!conductorDniError ||
                    (conductorDniData && !conductorDniData.success)
                  }
                />
              }
            />
            <FormInput
              control={form.control}
              name="driver_name"
              label="Nombre del Conductor"
              placeholder="Nombre completo"
              disabled={isDisabled || shouldDisableLicenseFields}
            />
            <FormInput
              control={form.control}
              name="license"
              label="Licencia de Conducir"
              placeholder="Ej: A12345678"
              disabled={isDisabled || shouldDisableLicenseFields}
            />
            <FormInput
              control={form.control}
              name="plate"
              label="Placa del Vehículo"
              placeholder="Ej: ABC-123"
              disabled={isDisabled}
              uppercase
            />
          </GroupFormSection>
        )}

        {/* Sección 2: Datos del Transportista (Transporte Público) */}
        {isPublicTransport && (
          <GroupFormSection
            title="Datos del Transportista"
            icon={Truck}
            cols={{ sm: 1, md: 2 }}
            gap="gap-4"
          >
            <FormSelectAsync
              control={form.control as any}
              name="transport_company_id"
              label="Transportista"
              placeholder="Buscar transportista..."
              useQueryHook={useSuppliers}
              mapOptionFn={(item: SuppliersResource) => ({
                value: item.id.toString(),
                label: `${item.num_doc || "S/N"} | ${item.full_name || "S/N"}`,
              })}
              perPage={10}
              debounceMs={500}
              disabled={isDisabled}
            />
            <FormInput
              control={form.control}
              name="plate"
              label="Placa del Vehículo (Opcional)"
              placeholder="Ej: ABC-123"
              disabled={isDisabled}
              uppercase
              optional
            />
          </GroupFormSection>
        )}

        {!isDisabled && (
          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 animate-spin ${!isSubmitting ? "hidden" : ""}`}
              />
              {isSubmitting ? "Guardando..." : "Guardar Guía"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
