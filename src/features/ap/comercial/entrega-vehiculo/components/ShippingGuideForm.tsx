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
import { useEffect, useState, useRef } from "react";
import {
  useLicenseValidation,
  useRucValidation,
} from "@/shared/hooks/useDocumentValidation";
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
    resolver: zodResolver(shippingGuideSchema),
    defaultValues: {
      transfer_modality_id: defaultValues?.transfer_modality_id || "",
      driver_doc: defaultValues?.driver_doc || "",
      license: defaultValues?.license || "",
      driver_name: defaultValues?.driver_name || "",
      carrier_ruc: defaultValues?.carrier_ruc || "",
      company_name_transport: defaultValues?.company_name_transport || "",
      plate: defaultValues?.plate || "",
      notes: defaultValues?.notes || "",
    },
    mode: "onChange",
  });

  const [carrierStatus, setCarrierStatus] = useState("-");
  const [carrierCondition, setCarrierCondition] = useState("-");

  const driverDocChangedByUser = useRef(false);
  const carrierRucChangedByUser = useRef(false);
  const initialDriverDoc = useRef<string>("");
  const initialCarrierRuc = useRef<string>("");

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        transfer_modality_id: defaultValues.transfer_modality_id || "",
        driver_doc: defaultValues.driver_doc || "",
        license: defaultValues.license || "",
        driver_name: defaultValues.driver_name || "",
        carrier_ruc: defaultValues.carrier_ruc || "",
        company_name_transport: defaultValues.company_name_transport || "",
        plate: defaultValues.plate || "",
        notes: defaultValues.notes || "",
      });
      initialDriverDoc.current = defaultValues.driver_doc || "";
      initialCarrierRuc.current = defaultValues.carrier_ruc || "";
      driverDocChangedByUser.current = false;
      carrierRucChangedByUser.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultValues?.transfer_modality_id,
    defaultValues?.driver_doc,
    defaultValues?.license,
    defaultValues?.driver_name,
    defaultValues?.carrier_ruc,
    defaultValues?.company_name_transport,
    defaultValues?.plate,
    defaultValues?.notes,
  ]);

  const transferModalityId = form.watch("transfer_modality_id");
  const conductorDni = form.watch("driver_doc");
  const carrierRuc = form.watch("carrier_ruc");

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

  useEffect(() => {
    if (!isPublicTransport || !carrierRuc) return;
    if (carrierRuc !== initialCarrierRuc.current) {
      carrierRucChangedByUser.current = true;
    }
  }, [carrierRuc, isPublicTransport]);

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

  const shouldValidateRuc =
    isPublicTransport &&
    !!carrierRuc &&
    carrierRuc.length === 11 &&
    carrierRucChangedByUser.current;

  const {
    data: rucData,
    isLoading: isRucLoading,
    error: rucError,
  } = useRucValidation(carrierRuc, shouldValidateRuc);

  useEffect(() => {
    if (isPublicTransport) {
      form.setValue("driver_doc", "", { shouldValidate: true });
      form.setValue("license", "", { shouldValidate: true });
      form.setValue("driver_name", "", { shouldValidate: true });
      driverDocChangedByUser.current = false;
    } else if (isPrivateTransport) {
      form.setValue("carrier_ruc", "", { shouldValidate: true });
      form.setValue("company_name_transport", "", { shouldValidate: true });
      setCarrierStatus("-");
      setCarrierCondition("-");
      carrierRucChangedByUser.current = false;
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
        form.setValue("license", "", { shouldValidate: true, shouldDirty: true });
      }
      if (form.getValues("driver_name") !== "") {
        form.setValue("driver_name", "", { shouldValidate: true, shouldDirty: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conductorDniData, isPrivateTransport]);

  useEffect(() => {
    if (!isPublicTransport) return;
    if (rucData?.success && rucData.data && rucData.data.valid) {
      const rucInfo = rucData.data;
      if (form.getValues("company_name_transport") !== (rucInfo.business_name || "")) {
        form.setValue("company_name_transport", rucInfo.business_name || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      setCarrierStatus(rucInfo.status || "NO PROCESADO");
      setCarrierCondition(rucInfo.condition || "NO PROCESADO");
    } else if (rucData !== undefined) {
      if (form.getValues("company_name_transport") !== "") {
        form.setValue("company_name_transport", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      setCarrierStatus("-");
      setCarrierCondition("-");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rucData, isPublicTransport]);

  const shouldDisableRucFields = Boolean(
    rucData?.success && rucData.data && rucData.data.valid,
  );
  const shouldDisableLicenseFields = Boolean(
    conductorDniData?.success && conductorDniData.data,
  );

  if (isLoadingTypeTransportation) {
    return <FormSkeleton />;
  }

  const carrierStatusBadges = carrierStatus !== "-" && carrierCondition !== "-" && (
    <div className="absolute right-0 -top-1 flex gap-1">
      <div
        className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
          carrierStatus === "ACTIVO"
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${carrierStatus === "ACTIVO" ? "bg-green-500" : "bg-red-500"}`} />
        {carrierStatus}
      </div>
      <div
        className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
          carrierCondition === "HABIDO"
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
        }`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${carrierCondition === "HABIDO" ? "bg-green-500" : "bg-yellow-500"}`} />
        {carrierCondition}
      </div>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
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
              type="number"
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
            <FormInput
              control={form.control}
              name="carrier_ruc"
              label={
                <div className="flex items-center gap-2 relative">
                  RUC del Transportista
                  <DocumentValidationStatus
                    shouldValidate={true}
                    documentNumber={carrierRuc || ""}
                    expectedDigits={11}
                    isValidating={isRucLoading}
                    leftPosition="right-0"
                  />
                </div>
              }
              placeholder="Ej: 20123456789"
              type="number"
              maxLength={11}
              disabled={isDisabled}
              addonEnd={
                <ValidationIndicator
                  show={!!carrierRuc}
                  isValidating={isRucLoading}
                  isValid={rucData?.success && rucData.data && rucData.data.valid}
                  hasError={
                    !!rucError ||
                    (rucData &&
                      (!rucData.success ||
                        (rucData.data && !rucData.data.valid)))
                  }
                />
              }
            />
            <FormInput
              control={form.control}
              name="company_name_transport"
              label={
                <div className="flex items-center gap-2 relative w-full">
                  Razón Social
                  {carrierStatusBadges}
                </div>
              }
              placeholder="Razón social del transportista"
              disabled={isDisabled || shouldDisableRucFields}
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
