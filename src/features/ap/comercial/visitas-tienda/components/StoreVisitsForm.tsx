"use client";

import {
  StoreVisitsSchema,
  storeVisitsSchemaCreate,
  storeVisitsSchemaUpdate,
} from "../lib/storeVisits.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import {
  BUSINESS_PARTNERS,
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
import { useAllIncomeSector } from "../../sectores-ingreso/lib/incomeSector.hook";
import {
  useAllBrandsBySede,
  useAllWorkersBySedeAndBrand,
  useWorkerConfig,
} from "@/features/ap/configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.hook";
import { STORE_VISITS } from "../lib/storeVisits.constants";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";
import { FormInput } from "@/shared/components/FormInput";
import {
  NUM_DIGITS_CE,
  NUM_DIGITS_DNI,
  NUM_DIGITS_RUC,
} from "@/features/ap/configuraciones/maestros-general/tipos-documento/lib/documentTypes.constants";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";

interface StoreVisitsFormProps {
  defaultValues: Partial<StoreVisitsSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  lockedType?: string;
  onCancel?: () => void;
  disableIncomeSector?: boolean;
  canViewAdvisors?: boolean;
  loggedWorkerId?: number;
}

export const StoreVisitsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  lockedType,
  onCancel,
  disableIncomeSector = false,
  canViewAdvisors = true,
  loggedWorkerId,
}: StoreVisitsFormProps) => {
  const { ABSOLUTE_ROUTE } = STORE_VISITS;
  const resolvedType = lockedType ?? TIPO_LEADS.VISITA;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? storeVisitsSchemaCreate : storeVisitsSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      area_id: AREA_COMERCIAL.toString(),
      type: resolvedType,
      campaign: resolvedType,
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
  const { data: allSedes = [], isLoading: isLoadingAllSedes } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });
  const { data: workerConfig, isLoading: isLoadingWorkerConfig } =
    useWorkerConfig(!canViewAdvisors ? loggedWorkerId : undefined);
  const { data: documentTypes = [], isLoading: isLoadingTypesDocument } =
    useAllDocumentType();
  const { data: incomeSector = [], isLoading: isLoadingIncomeSector } =
    useAllIncomeSector();
  const { data: vehicleBrands = [], isLoading: isLoadingVehicleBrands } =
    useAllBrandsBySede(
      canViewAdvisors && selectedSedeId ? Number(selectedSedeId) : undefined,
    );
  const { data: workers = [], isLoading: isLoadingWorkers } =
    useAllWorkersBySedeAndBrand(
      canViewAdvisors && selectedSedeId ? Number(selectedSedeId) : undefined,
      canViewAdvisors && selectedBrandId ? Number(selectedBrandId) : undefined,
    );

  const isLoadingSedes = canViewAdvisors
    ? isLoadingAllSedes
    : isLoadingWorkerConfig;
  const sedes = canViewAdvisors
    ? allSedes
    : (workerConfig?.sedes ?? []).map((s) => ({
        id: Number(s.id),
        description: s.localidad,
      }));

  const workerBrandsForSede =
    !canViewAdvisors && selectedSedeId
      ? (workerConfig?.brands ?? []).filter(
          (b) => b.sede_id === Number(selectedSedeId),
        )
      : [];

  const sedeVehicleBrands = canViewAdvisors
    ? vehicleBrands
    : workerBrandsForSede.map((b) => ({ id: b.id, name: b.name }));

  const selectedDocumentType = documentTypes.find(
    (type) => type.id.toString() === documentTypeId,
  );

  const shouldValidate = VALIDATABLE_DOCUMENT.IDS.includes(documentTypeId!);
  const validationType = VALIDATABLE_DOCUMENT.TYPE_MAP[documentTypeId!] || null;
  const DIGITS_MAP: Record<string, number> = {
    [BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID]: NUM_DIGITS_DNI,
    [BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID]: NUM_DIGITS_RUC,
    [BUSINESS_PARTNERS.TYPE_DOCUMENT_CE_ID]: NUM_DIGITS_CE,
    // si hay CE, agregar aquí
  };
  const expectedDigits = DIGITS_MAP[documentTypeId!] ?? 0;
  const isValidLength =
    documentNumber && documentNumber.length === expectedDigits;

  const shouldTriggerValidation = Boolean(
    shouldValidate && isValidLength && validationType,
  );

  // Hooks de validación condicional
  const {
    data: dniData,
    isLoading: isDniLoading,
    error: dniError,
  } = useDniValidation(
    documentNumber,
    validationType === "dni" && shouldTriggerValidation,
  );

  const {
    data: rucData,
    isLoading: isRucLoading,
    error: rucError,
  } = useRucValidation(
    documentNumber,
    validationType === "ruc" && shouldTriggerValidation,
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

  // Auto-set worker_id and sede_id when not canViewAdvisors and config loads
  useEffect(() => {
    if (!canViewAdvisors && workerConfig?.worker) {
      form.setValue("worker_id", workerConfig.worker.id.toString() as any, {
        shouldValidate: true,
      });
    }
    if (!canViewAdvisors && workerConfig?.sedes?.length === 1) {
      form.setValue("sede_id", workerConfig.sedes[0].id.toString() as any, {
        shouldValidate: true,
      });
    }
  }, [canViewAdvisors, workerConfig, form]);

  // Limpiar campos dependientes cuando cambia la sede
  useEffect(() => {
    if (
      prevSedeId.current !== selectedSedeId &&
      prevSedeId.current !== undefined
    ) {
      form.setValue("vehicle_brand_id", undefined);
      if (canViewAdvisors) {
        form.setValue("worker_id", undefined);
      }
    }
    prevSedeId.current = selectedSedeId;
  }, [selectedSedeId, form, canViewAdvisors]);

  // Limpiar worker_id cuando cambia la marca (solo si puede ver asesores)
  useEffect(() => {
    if (
      canViewAdvisors &&
      prevBrandId.current !== selectedBrandId &&
      prevBrandId.current !== undefined
    ) {
      form.setValue("worker_id", undefined);
    }
    prevBrandId.current = selectedBrandId;
  }, [selectedBrandId, form, canViewAdvisors]);

  const shouldDisableMainFields = Boolean(
    validationData?.success && validationData.data,
  );

  if (isLoadingSedes || isLoadingTypesDocument || isLoadingIncomeSector)
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
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
            disabled={disableIncomeSector}
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
            options={sedeVehicleBrands.map((item) => ({
              label: item.name,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
            disabled={
              canViewAdvisors ? isLoadingVehicleBrands : !selectedSedeId
            }
          />

          {canViewAdvisors ? (
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
          ) : (
            <FormSelect
              name="worker_id"
              label="Asesor"
              placeholder="Asesor asignado"
              options={
                workerConfig?.worker
                  ? [
                      {
                        label: workerConfig.worker.nombre_completo,
                        value: workerConfig.worker.id.toString(),
                      },
                    ]
                  : []
              }
              control={form.control}
              disabled
            />
          )}

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

          <FormInput
            control={form.control}
            label={
              <div className="flex items-center justify-between gap-2 w-full">
                Núm. Documento
                <DocumentValidationStatus
                  shouldValidate={shouldValidate}
                  documentNumber={documentNumber!}
                  expectedDigits={expectedDigits}
                  isValidating={isValidatingDocument}
                />
              </div>
            }
            name="num_doc"
            type="text"
            inputMode="numeric"
            placeholder={
              selectedDocumentType
                ? `Ingrese ${expectedDigits} dígitos`
                : "Ingrese número"
            }
            maxLength={expectedDigits || undefined}
            onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
            addonEnd={
              <ValidationIndicator
                show={!!documentNumber}
                isValidating={isValidatingDocument}
                isValid={validationData?.success && !!validationData.data}
                hasError={
                  !!validationError ||
                  (validationData && !validationData.success)
                }
                positioned={false}
              />
            }
          />

          <FormInput
            control={form.control}
            name="full_name"
            label={
              <div className="flex items-center justify-between gap-2 w-full">
                {validationType === "ruc" ? "Razón Social" : "Nombres"}
                {validationType === "ruc" &&
                  companyStatus !== "-" &&
                  companyCondition !== "-" && (
                    <div className="flex gap-2">
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
                        />
                        {companyStatus}
                      </div>
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
                        />
                        {companyCondition}
                      </div>
                    </div>
                  )}
              </div>
            }
            placeholder="Ej: Juan"
            disabled={shouldDisableMainFields}
          />

          <FormInput
            control={form.control}
            label="Email"
            name="email"
            type="email"
            placeholder="Ej: example@gmail.com"
          />

          <FormInput
            control={form.control}
            label="Teléfono"
            name="phone"
            type="text"
            inputMode="numeric"
            placeholder="Ej: 987635542"
            maxLength={9}
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          ) : (
            <Link to={ABSOLUTE_ROUTE}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          )}

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
