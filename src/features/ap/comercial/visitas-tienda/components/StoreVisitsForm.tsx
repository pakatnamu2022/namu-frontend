"use client";

import {
  StoreVisitsSchema,
  storeVisitsSchemaCreate,
  storeVisitsSchemaUpdate,
} from "../lib/storeVisits.schema";
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
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import {
  EMPRESA_AP,
  TIPO_LEADS,
  VALIDATABLE_DOCUMENT,
} from "@/core/core.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllDocumentType } from "@/features/ap/configuraciones/maestros-general/tipos-documento/lib/documentTypes.hook";
import {
  useDniValidation,
  useRucValidation,
} from "@/shared/hooks/useDocumentValidation";
import { useEffect, useState, useRef } from "react";
import { DocumentValidationStatus } from "../../../../../shared/components/DocumentValidationStatus";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import { useAllIncomeSector } from "../../sectores-ingreso/lib/incomeSector.hook";
import {
  useAllBrandsBySede,
  useAllWorkersBySedeAndBrand,
} from "@/features/ap/configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.hook";
import { STORE_VISITS } from "../lib/storeVisits.constants";
import { AREA_CM_ID } from "@/features/ap/lib/ap.constants";

interface StoreVisitsFormProps {
  defaultValues: Partial<StoreVisitsSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const StoreVisitsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: StoreVisitsFormProps) => {
  const { ABSOLUTE_ROUTE } = STORE_VISITS;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? storeVisitsSchemaCreate : storeVisitsSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      area_id: AREA_CM_ID.COMERCIAL,
      type: TIPO_LEADS.VISITA,
      campaign: TIPO_LEADS.VISITA,
    },
    mode: "onChange",
  });
  const [companyStatus, setCompanyStatus] = useState("-");
  const [companyCondition, setCompanyCondition] = useState("-");
  const prevSedeId = useRef(defaultValues.sede_id);
  const prevBrandId = useRef(defaultValues.vehicle_brand_id);
  const documentTypeId = form.watch("document_type_id");
  const documentNumber = form.watch("num_doc");
  const selectedSedeId = form.watch("sede_id");
  const selectedBrandId = form.watch("vehicle_brand_id");

  // Consultas para selects
  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    empresa_id: EMPRESA_AP.id,
  });
  const { data: documentTypes = [], isLoading: isLoadingTypesDocument } =
    useAllDocumentType();
  const { data: incomeSector = [], isLoading: isLoadingIncomeSector } =
    useAllIncomeSector();
  const { data: vehicleBrands = [], isLoading: isLoadingVehicleBrands } =
    useAllBrandsBySede(selectedSedeId ? Number(selectedSedeId) : undefined);
  const { data: workers = [], isLoading: isLoadingWorkers } =
    useAllWorkersBySedeAndBrand(
      selectedSedeId ? Number(selectedSedeId) : undefined,
      selectedBrandId ? Number(selectedBrandId) : undefined
    );

  const selectedDocumentType = documentTypes.find(
    (type) => type.id.toString() === documentTypeId
  );

  const shouldValidate = VALIDATABLE_DOCUMENT.IDS.includes(documentTypeId!);
  const validationType = VALIDATABLE_DOCUMENT.TYPE_MAP[documentTypeId!] || null;
  const expectedDigits = selectedDocumentType?.code
    ? Number(selectedDocumentType.code)
    : 0;
  const isValidLength =
    documentNumber && documentNumber.length === expectedDigits;

  const shouldTriggerValidation = Boolean(
    shouldValidate && isValidLength && validationType
  );

  // Hooks de validación condicional
  const {
    data: dniData,
    isLoading: isDniLoading,
    error: dniError,
  } = useDniValidation(
    documentNumber,
    validationType === "dni" && shouldTriggerValidation
  );

  const {
    data: rucData,
    isLoading: isRucLoading,
    error: rucError,
  } = useRucValidation(
    documentNumber,
    validationType === "ruc" && shouldTriggerValidation
  );

  // Datos consolidados
  const validationData = dniData || rucData;
  const validationError = dniError || rucError;

  // Estado de carga consolidado
  const isValidatingDocument = isDniLoading || isRucLoading;

  // Efecto para auto-completar campos cuando se obtienen datos válidos
  useEffect(() => {
    if (validationData?.success && validationData.data) {
      if (dniData?.data && dniData.success && dniData.data.valid) {
        const dniInfo = dniData.data;
        form.setValue("full_name", dniInfo.names, { shouldValidate: true });
      } else if (rucData?.data && rucData.success && rucData.data.valid) {
        const rucInfo = rucData.data;
        form.setValue("full_name", rucInfo.business_name || "", {
          shouldValidate: true,
        });

        // Asignar estado y condición de la empresa
        const status = rucInfo.status || "NO PROCESADO";
        const condition = rucInfo.condition || "NO PROCESADO";
        setCompanyStatus(status);
        setCompanyCondition(condition);
      } else {
        form.setValue("full_name", "", { shouldValidate: true });
        setCompanyStatus("-");
        setCompanyCondition("-");
      }
    }
  }, [validationData, form, dniData, rucData]);

  // Limpiar campos dependientes cuando cambia la sede
  useEffect(() => {
    if (
      prevSedeId.current !== selectedSedeId &&
      prevSedeId.current !== undefined
    ) {
      form.setValue("vehicle_brand_id", undefined);
      form.setValue("worker_id", undefined);
    }
    prevSedeId.current = selectedSedeId;
  }, [selectedSedeId, form]);

  // Limpiar worker_id cuando cambia la marca
  useEffect(() => {
    if (
      prevBrandId.current !== selectedBrandId &&
      prevBrandId.current !== undefined
    ) {
      form.setValue("worker_id", undefined);
    }
    prevBrandId.current = selectedBrandId;
  }, [selectedBrandId, form]);

  const shouldDisableMainFields = Boolean(
    validationData?.success && validationData.data
  );

  if (isLoadingSedes || isLoadingTypesDocument || isLoadingIncomeSector)
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormSelect
            name="income_sector_id"
            label="Ingreso Por"
            placeholder="Selecciona ingreso"
            options={incomeSector.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona sede"
            options={sedes.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            name="vehicle_brand_id"
            label="Marca Vehículo"
            placeholder="Selecciona marca"
            options={vehicleBrands.map((item) => ({
              label: item.name,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
            disabled={isLoadingVehicleBrands}
          />

          <FormSelect
            name="worker_id"
            label="Asesor"
            placeholder="Selecciona asesor"
            options={workers.map((item) => ({
              label: item.name,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
            disabled={isLoadingWorkers}
          />

          <FormSelect
            name="document_type_id"
            label="Tipo Documento"
            placeholder="Selecciona tipo"
            options={documentTypes.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <FormField
            control={form.control}
            name="num_doc"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 relative">
                  Núm. Documento
                  <DocumentValidationStatus
                    shouldValidate={shouldValidate}
                    documentNumber={documentNumber!}
                    expectedDigits={expectedDigits}
                    isValidating={isValidatingDocument}
                  />
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={
                        selectedDocumentType
                          ? `Ingrese ${expectedDigits} dígitos`
                          : "Ingrese número"
                      }
                      {...field}
                      maxLength={expectedDigits || undefined}
                    />
                    <ValidationIndicator
                      show={shouldValidate && !!documentNumber}
                      isValidating={isValidatingDocument}
                      isValid={validationData?.success && !!validationData.data}
                      hasError={
                        !!validationError ||
                        (!!validationData && !validationData.data)
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
            name="full_name"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>
                  {validationType === "ruc" ? "Razón Social" : "Nombres"}
                  {validationType === "ruc" &&
                    companyStatus !== "-" &&
                    companyCondition !== "-" && (
                      <div className="absolute right-0 top-0 flex gap-2">
                        {/* Estado */}
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            companyStatus === "ACTIVO"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              companyStatus === "ACTIVO"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          {companyStatus}
                        </div>

                        {/* Condición */}
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            companyCondition === "HABIDO"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              companyCondition === "HABIDO"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                          {companyCondition}
                        </div>
                      </div>
                    )}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Juan"
                    {...field}
                    disabled={shouldDisableMainFields}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: example@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 987635542" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Visita"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
