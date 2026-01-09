"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  User,
  Building2,
  FileText,
  Loader,
  Heart,
  Scale,
  Info,
} from "lucide-react";
import {
  CustomersSchema,
  customersSchemaCreate,
  customersSchemaUpdate,
} from "../lib/customers.schema";
import { useAllClientOrigin } from "@/features/ap/configuraciones/maestros-general/origen-cliente/lib/clientOrigin.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllDocumentType } from "@/features/ap/configuraciones/maestros-general/tipos-documento/lib/documentTypes.hook";
import { useAllTypeGender } from "@/features/ap/configuraciones/maestros-general/tipos-sexo/lib/typesGender.hook";
import { useAllMaritalStatus } from "@/features/ap/configuraciones/maestros-general/estado-civil/lib/maritalStatus.hook";
import { useDistricts } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.hook";
import { useAllTypeClient } from "@/features/ap/configuraciones/maestros-general/tipos-persona/lib/typeClient.hook";
import { useAllPersonSegment } from "@/features/ap/configuraciones/maestros-general/segmentos-persona/lib/personSegment.hook";
import { useAllTaxClassTypes } from "@/features/ap/configuraciones/maestros-general/tipos-clase-impuesto/lib/taxClassTypes.hook";
import {
  useDniValidation,
  useLicenseValidation,
  useRucValidation,
} from "@/shared/hooks/useDocumentValidation";
import { useEffect, useState } from "react";
import {
  BUSINESS_PARTNERS,
  EMPRESA_AP,
  LEGAL_AGE,
  TYPE_BUSINESS_PARTNERS,
  VALIDATABLE_DOCUMENT,
} from "@/core/core.constants";
import { useAllEconomicActivity } from "@/features/ap/configuraciones/maestros-general/actividad-economica/lib/economicActivity.hook";
import { DocumentValidationStatus } from "../../../../../shared/components/DocumentValidationStatus";
import { ValidationIndicator } from "../../../../../shared/components/ValidationIndicator";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { CUSTOMERS } from "../lib/customers.constants";
import { FormInput } from "@/shared/components/FormInput";

interface CustomersFormProps {
  defaultValues: Partial<CustomersSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  leadData?: {
    document_type_id?: string;
    num_doc?: string;
    phone?: string;
    email?: string;
    name?: string;
    surnames?: string;
  };
  isFirstLoadParam?: boolean;
  fromOpportunities?: boolean;
}

export const CustomersForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  leadData,
  fromOpportunities = false,
}: CustomersFormProps) => {
  const router = useNavigate();

  // Determine type_person_id based on document_type_id from leadData
  const getTypePersonFromDocument = (documentTypeId?: string) => {
    if (!documentTypeId) return undefined;
    if (documentTypeId === BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID) {
      return BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID;
    }
    if (documentTypeId === BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID) {
      return BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID;
    }
    // For other document types, assume natural person
    return BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID;
  };

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? customersSchemaCreate : customersSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      company_id: EMPRESA_AP.id,
      type: defaultValues?.type || TYPE_BUSINESS_PARTNERS.CLIENTE,
      ...(leadData?.document_type_id && {
        document_type_id: leadData.document_type_id,
        type_person_id: getTypePersonFromDocument(leadData.document_type_id),
      }),
      ...(leadData?.num_doc && { num_doc: leadData.num_doc }),
      ...(leadData?.phone && { phone: leadData.phone }),
      ...(leadData?.email && { email: leadData.email }),
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = CUSTOMERS;

  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");
  const [hasLoadedLeadData, setHasLoadedLeadData] = useState(!!leadData);
  const [companyStatus, setCompanyStatus] = useState("-");
  const [companyCondition, setCompanyCondition] = useState("-");
  const [initialDocumentNumber] = useState(defaultValues.num_doc);
  const nationalityOptions = [
    { label: "NACIONAL", value: "NACIONAL" },
    { label: "EXTRANJERO", value: "EXTRANJERO" },
  ];
  const statusLicenseOptions = [
    { label: "VIGENTE", value: "VIGENTE" },
    { label: "VENCIDA", value: "VENCIDA" },
    { label: "SUSPENDIDA", value: "SUSPENDIDA" },
    { label: "CANCELADA", value: "CANCELADA" },
    { label: "RETENIDA", value: "RETENIDA" },
    { label: "EN TRAMITE", value: "EN TRAMITE" },
  ];
  const { data: typesPerson = [], isLoading: isLoadingTypesPerson } =
    useAllTypeClient();
  const { data: clientOrigins = [], isLoading: isLoadingClientOrigins } =
    useAllClientOrigin();
  const { data: documentTypes = [], isLoading: isLoadingDocumentTypes } =
    useAllDocumentType();
  const { data: typeGenders = [], isLoading: isLoadingTypeGenders } =
    useAllTypeGender();
  const {
    data: typeMaritalStatus = [],
    isLoading: isLoadingTypeMaritalStatus,
  } = useAllMaritalStatus();
  const { data: personSegment = [], isLoading: isLoadingPersonSegment } =
    useAllPersonSegment();
  const { data: taxClassType = [], isLoading: isLoadingTaxClassType } =
    useAllTaxClassTypes({
      type: TYPE_BUSINESS_PARTNERS.CLIENTE,
    });
  const { data: economicActivity = [], isLoading: isLoadingEconomicActivity } =
    useAllEconomicActivity();

  // Watch para campos condicionales
  const maritalStatusId = form.watch("marital_status_id");
  const typePersonId = form.watch("type_person_id");
  const documentTypeId = form.watch("document_type_id");
  const documentNumber = form.watch("num_doc");
  const legalRepresentativeDni = form.watch("legal_representative_num_doc");
  const conductorDni = form.watch("driver_num_doc");
  const conyugeDni = form.watch("spouse_num_doc");
  const typePersonWatch = form.watch("type_person_id");
  const isMarried = maritalStatusId === BUSINESS_PARTNERS.MARITAL_STATUS_ID;
  const isJuridica = typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID;
  // Obtenemos los numeros de dígitos esperados para DNI y RUC
  const selectedDocumentTypeDni = documentTypes.find(
    (type) => type.id.toString() === BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID
  );
  const selectedDocumentTypeRuc = documentTypes.find(
    (type) => type.id.toString() === BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID
  );

  const numDigitsDni = selectedDocumentTypeDni?.code;
  const numDigitsRuc = selectedDocumentTypeRuc?.code;

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

  const hasDocumentChanged =
    mode === "update" ? documentNumber !== initialDocumentNumber : true;

  // Determinar si es RUC de persona natural (10...)
  const isRucNatural =
    validationType === "ruc" &&
    typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID &&
    documentNumber?.startsWith("10");

  // Extraer DNI del RUC natural (10 + DNI + dígito verificador)
  const extractedDni =
    isRucNatural && documentNumber?.length === Number(numDigitsRuc)
      ? documentNumber!.substring(2, 10)
      : documentNumber;

  // DNI directo o DNI extraído de RUC natural
  const shouldEnableDniValidation =
    !isFirstLoad &&
    hasDocumentChanged &&
    ((validationType === "dni" && shouldTriggerValidation) ||
      (isRucNatural && shouldTriggerValidation));

  // Validación RUC solo para persona jurídica (20...)
  const shouldEnableRucValidation =
    !isFirstLoad &&
    hasDocumentChanged &&
    validationType === "ruc" &&
    typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID &&
    shouldTriggerValidation;

  // Hooks de validación condicional
  const {
    data: dniData,
    isLoading: isDniLoading,
    error: dniError,
  } = useDniValidation(extractedDni, shouldEnableDniValidation, true);

  const {
    data: rucData,
    isLoading: isRucLoading,
    error: rucError,
  } = useRucValidation(documentNumber, shouldEnableRucValidation, true);

  const {
    data: conyugeDniData,
    isLoading: isConyugeDniLoading,
    error: conyugeDniError,
  } = useDniValidation(
    conyugeDni,
    !isFirstLoad && !!conyugeDni && conyugeDni.length === Number(numDigitsDni),
    true
  );

  const {
    data: legalRepDniData,
    isLoading: isLegalRepDniLoading,
    error: legalRepDniError,
  } = useDniValidation(
    legalRepresentativeDni,
    isJuridica &&
      !!legalRepresentativeDni &&
      !isFirstLoad &&
      legalRepresentativeDni.length === Number(numDigitsDni),
    true
  );

  const {
    data: conductorDniData,
    isLoading: isConductorDniLoading,
    error: conductorDniError,
  } = useLicenseValidation(
    conductorDni,
    !isFirstLoad &&
      !!conductorDni &&
      conductorDni.length === Number(numDigitsDni),
    true
  );

  // Datos consolidados
  const validationData = dniData || rucData;
  const validationError = dniError || rucError;

  // Estado de carga consolidado
  const isValidatingDocument = isDniLoading || isRucLoading;

  // Verificar si el cliente está en la base de datos y obtener su tipo
  const isFromDatabase = validationData?.source === "database";
  const businessPartnerType = validationData?.data?.type;

  // Determinar el mensaje de notificación
  const getNotificationMessage = () => {
    if (!isFromDatabase || !businessPartnerType) return null;

    if (
      businessPartnerType === TYPE_BUSINESS_PARTNERS.CLIENTE ||
      businessPartnerType === TYPE_BUSINESS_PARTNERS.AMBOS
    ) {
      return "El cliente ya está registrado en el sistema";
    }

    if (businessPartnerType === TYPE_BUSINESS_PARTNERS.PROVEEDOR) {
      return "Este cliente está como proveedor en el sistema";
    }

    return null;
  };

  const notificationMessage = getNotificationMessage();

  useEffect(() => {
    if (fromOpportunities) {
      form.setValue(
        "person_segment_id",
        BUSINESS_PARTNERS.PERSON_SEGMENT_DEFAULT_ID
      );
      form.setValue(
        "tax_class_type_id",
        BUSINESS_PARTNERS.TYPE_TAX_CLASS_DEFAULT_ID
      );
      form.setValue(
        "activity_economic_id",
        BUSINESS_PARTNERS.ACTIVITY_ECONOMIC_DEFAULT_ID
      );
      form.setValue("direction", "NO DEFINIDO");
    }
  }, [fromOpportunities, form]);

  useEffect(() => {
    // Skip on first load if we have lead data
    if (hasLoadedLeadData) {
      setHasLoadedLeadData(false);
      return;
    }

    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    if (typePersonWatch) {
      form.setValue("num_doc", "");
      form.setValue("first_name", "");
      form.setValue("paternal_surname", "");
      form.setValue("maternal_surname", "");
    }
    if (typePersonWatch === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID) {
      form.setValue("document_type_id", BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID);
    }
    if (typePersonWatch === BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID) {
      form.setValue("document_type_id", BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID);
    }
  }, [typePersonWatch]);

  // Efecto para auto-completar campos cuando se obtienen datos válidos
  useEffect(() => {
    if (isFirstLoad) return;

    if (validationData?.success && validationData.data) {
      if (dniData?.data && dniData.success && dniData.data.valid) {
        const dniInfo = dniData.data;
        const fullFirstName = dniInfo.first_name || "";
        const nameParts = fullFirstName.split(" ");
        const firstName = nameParts[0] || "";
        const middleName = nameParts.slice(1).join(" ") || "";
        form.setValue("first_name", firstName, { shouldValidate: true });
        form.setValue("middle_name", middleName, { shouldValidate: true });
        form.setValue("paternal_surname", dniInfo.paternal_surname || "", {
          shouldValidate: true,
        });
        form.setValue("maternal_surname", dniInfo.maternal_surname || "", {
          shouldValidate: true,
        });
      } else if (rucData?.data && rucData.success && rucData.data.valid) {
        const rucInfo = rucData.data;
        form.setValue("first_name", rucInfo.business_name || "", {
          shouldValidate: true,
        });
        form.setValue("paternal_surname", "", { shouldValidate: true });
        form.setValue("maternal_surname", "", { shouldValidate: true });
        form.setValue("full_name", rucInfo.business_name || "", {
          shouldValidate: true,
        });
        form.setValue("direction", rucInfo.full_address || "", {
          shouldValidate: true,
        });

        // Asignar estado y condición de la empresa
        const status = rucInfo.status || "NO PROCESADO";
        const condition = rucInfo.condition || "NO PROCESADO";
        setCompanyStatus(status);
        setCompanyCondition(condition);
        form.setValue("company_status", status, {
          shouldValidate: true,
        });
        form.setValue("company_condition", condition, {
          shouldValidate: true,
        });

        // Note: district_id will need to be set manually with FormSelectAsync
        // or you can implement a search by ubigeo if needed
      } else {
        form.setValue("first_name", "", { shouldValidate: true });
        form.setValue("paternal_surname", "", { shouldValidate: true });
        form.setValue("maternal_surname", "", { shouldValidate: true });
        setCompanyStatus("-");
        setCompanyCondition("-");
        form.setValue("company_status", "", { shouldValidate: true });
        form.setValue("company_condition", "", { shouldValidate: true });
      }
    }

    // Limpiar campos cuando hay error en la validación o datos inválidos
    const hasError =
      validationError ||
      (validationData && !validationData.success) ||
      (validationData?.data && !validationData.data.valid);

    if (hasError) {
      if (isJuridica) {
        form.setValue("full_name", "", {
          shouldValidate: true,
        });
        form.setValue("direction", "", {
          shouldValidate: true,
        });
        form.setValue("district_id", "", { shouldValidate: true });
        setCompanyStatus("-");
        setCompanyCondition("-");
        form.setValue("company_status", "", { shouldValidate: true });
        form.setValue("company_condition", "", { shouldValidate: true });
      } else {
        form.setValue("first_name", "", { shouldValidate: true });
        form.setValue("middle_name", "", { shouldValidate: true });
        form.setValue("paternal_surname", "", { shouldValidate: true });
        form.setValue("maternal_surname", "", { shouldValidate: true });
      }
    }
  }, [validationData, validationError, form, dniData, rucData, isJuridica]);

  // UseEffect específico para conyuge:
  useEffect(() => {
    if (isFirstLoad) return;

    if (conyugeDniData?.success && conyugeDniData.data) {
      const repInfo = conyugeDniData.data;
      form.setValue("spouse_full_name", repInfo.names || "");
    } else if (conyugeDniData && !conyugeDniData.success) {
      form.setValue("spouse_full_name", "");
    }
  }, [conyugeDniData, form]);

  // UseEffect específico para representante legal:
  useEffect(() => {
    if (isFirstLoad) return;

    if (legalRepDniData?.success && legalRepDniData.data) {
      const repInfo = legalRepDniData.data;
      form.setValue("legal_representative_name", repInfo.first_name || "");
      form.setValue(
        "legal_representative_paternal_surname",
        repInfo.paternal_surname || ""
      );
      form.setValue(
        "legal_representative_maternal_surname",
        repInfo.maternal_surname || ""
      );
    } else if (legalRepDniData && !legalRepDniData.success) {
      form.setValue("legal_representative_name", "");
      form.setValue("legal_representative_paternal_surname", "");
      form.setValue("legal_representative_maternal_surname", "");
    }
  }, [legalRepDniData, form]);

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    const [day, month, year] = dateString.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  // UseEffect específico para Conductor:
  useEffect(() => {
    if (isFirstLoad) return;

    if (conductorDniData?.success && conductorDniData.data) {
      const licenseInfo = conductorDniData.data;
      form.setValue("driving_license", licenseInfo.licencia.numero || "");
      form.setValue("driver_full_name", licenseInfo.full_name || "");
      const expirationDate = parseDate(licenseInfo.licencia.fecha_vencimiento);
      form.setValue("driving_license_expiration_date", expirationDate || "");
      form.setValue(
        "driving_license_category",
        licenseInfo.licencia.categoria || ""
      );
      form.setValue("status_license", licenseInfo.licencia.estado || "");
      form.setValue(
        "restriction",
        licenseInfo.licencia.restricciones || "NO DEFINIDO"
      );
    } else {
      form.setValue("driving_license", "");
      form.setValue("driver_full_name", "");
      form.setValue("driving_license_expiration_date", "");
      form.setValue("status_license", "");
      form.setValue("restriction", "NO DEFINIDO");
    }
  }, [conductorDniData, form]);

  // Agregar este useEffect después de los otros useEffect existentes
  useEffect(() => {
    if (!isJuridica) {
      const firstName = form.watch("first_name") || "";
      const middleName = form.watch("middle_name") || "";
      const paternalSurname = form.watch("paternal_surname") || "";
      const maternalSurname = form.watch("maternal_surname") || "";
      const fullNameParts = [
        firstName,
        middleName,
        paternalSurname,
        maternalSurname,
      ].filter((part) => part.trim() !== "");

      const generatedFullName = fullNameParts.join(" ");

      if (generatedFullName.trim() !== "") {
        form.setValue("full_name", generatedFullName);
      }
    }
  }, [
    form.watch("first_name"),
    form.watch("middle_name"),
    form.watch("paternal_surname"),
    form.watch("maternal_surname"),
    isJuridica,
    form,
  ]);

  // AQUÍ VAN LAS VARIABLES DE ESTADO DINÁMICAS
  const shouldDisableMainFields = Boolean(
    validationData?.success && validationData.data
  );
  const shouldDisableSpouseFields = Boolean(
    conyugeDniData?.success && conyugeDniData.data
  );
  const shouldDisableLegalRepFields = Boolean(
    legalRepDniData?.success && legalRepDniData.data
  );
  const shouldDisableLicenseFields = Boolean(
    conductorDniData?.success && conductorDniData.data
  );

  // Función para filtrar tipos de documento según tipo de persona
  const getFilteredDocumentTypes = () => {
    if (!typePersonWatch) return documentTypes;

    if (typePersonWatch === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID) {
      return documentTypes.filter(
        (doc) => doc.id.toString() == BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID
      );
    }
    if (typePersonWatch !== BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID) {
      return documentTypes;
    }

    return documentTypes;
  };

  const filteredDocumentTypes = getFilteredDocumentTypes();

  const isLoading =
    isLoadingClientOrigins ||
    isLoadingDocumentTypes ||
    isLoadingTypeGenders ||
    isLoadingTypeMaritalStatus ||
    isLoadingTypesPerson ||
    isLoadingPersonSegment ||
    isLoadingTaxClassType ||
    isLoadingEconomicActivity;

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* GRUPO 1: INFORMACIÓN PERSONAL */}
        <GroupFormSection
          title="Información Personal"
          icon={User}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 3 }}
          headerExtra={
            notificationMessage && (
              <div
                className={`px-2 py-1 rounded-md flex items-center gap-2 text-sm sm:text-base ${
                  businessPartnerType === TYPE_BUSINESS_PARTNERS.PROVEEDOR
                    ? "bg-blue-100 text-primary border border-blue-200"
                    : "bg-red-100 text-secondary border border-red-200"
                }`}
              >
                <Info className="size-4 shrink-0" />
                <span className="text-xs font-medium">
                  {notificationMessage}
                </span>
              </div>
            )
          }
        >
          {/* Fila 1: Datos básicos */}
          <FormSelect
            name="type_person_id"
            label="Tipo de Persona"
            placeholder="Selecciona tipo"
            options={typesPerson.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <FormSelect
            name="document_type_id"
            label="Tipo Documento"
            placeholder="Selecciona tipo"
            options={filteredDocumentTypes.map((item) => ({
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
              shouldValidate &&
              documentNumber && (
                <div>
                  {isValidatingDocument && (
                    <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full" />
                  )}
                  {validationData?.success && validationData.data && (
                    <div className="text-green-500">✓</div>
                  )}
                  {(validationError ||
                    (validationData &&
                      !validationData.data &&
                      validationData?.source !== "database")) && (
                    <div className="text-red-500">✗</div>
                  )}
                </div>
              )
            }
          />

          {/* Campos para Persona Jurídica */}
          {isJuridica && (
            <>
              <div className="col-span-full">
                <FormInput
                  control={form.control}
                  name="full_name"
                  label={
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span>Razón Social</span>
                      {/* Indicadores de Estado y Condición */}
                      {isJuridica &&
                        (companyStatus !== "-" || companyCondition !== "-") && (
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
                              Estado: {companyStatus}
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
                              Condición: {companyCondition}
                            </div>
                          </div>
                        )}
                    </div>
                  }
                  placeholder="Ingrese razón social"
                  disabled={shouldDisableMainFields}
                />
              </div>

              {/* Campos ocultos para enviar los datos */}
              <input type="hidden" {...form.register("company_status")} />
              <input type="hidden" {...form.register("company_condition")} />

              <FormSelect
                name="origin_id"
                label="Origen"
                placeholder="Selecciona origen"
                options={clientOrigins.map((item) => ({
                  label: item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
              />
            </>
          )}

          {/* Campos para Persona Natural */}
          {!isJuridica && (
            <>
              <FormInput
                control={form.control}
                name="first_name"
                label="Primer Nombre"
                placeholder="Ingrese primer nombres"
                disabled={shouldDisableMainFields}
              />

              <FormInput
                control={form.control}
                name="middle_name"
                label="Segundo Nombre"
                placeholder="Ingrese segundo nombres"
                disabled={shouldDisableMainFields}
              />

              <FormInput
                control={form.control}
                name="paternal_surname"
                label="Apellido Paterno"
                placeholder="Apellido paterno"
                disabled={shouldDisableMainFields}
              />

              <FormInput
                control={form.control}
                name="maternal_surname"
                label="Apellido Materno"
                placeholder="Apellido materno"
                disabled={shouldDisableMainFields}
              />

              <div className="col-span-1 md:col-span-2">
                <FormInput
                  control={form.control}
                  name="full_name"
                  label="Razón Social"
                  placeholder="Ingrese razón social"
                  disabled={true}
                />
              </div>

              {!fromOpportunities && (
                <DatePickerFormField
                  control={form.control}
                  name="birth_date"
                  label="Fecha de Nacimiento"
                  placeholder="Selecciona fecha"
                  captionLayout="dropdown"
                  endMonth={
                    new Date(
                      new Date().getFullYear() - LEGAL_AGE,
                      new Date().getMonth(),
                      new Date().getDate()
                    )
                  }
                  disabledRange={{
                    before: new Date(1900, 0, 1),
                    after: new Date(
                      new Date().getFullYear() - LEGAL_AGE,
                      new Date().getMonth(),
                      new Date().getDate()
                    ),
                  }}
                />
              )}

              <FormSelect
                name="gender_id"
                label="Sexo"
                placeholder="Selecciona sexo"
                options={typeGenders.map((item) => ({
                  label: item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
              />

              <FormSelect
                name="marital_status_id"
                label="Estado Civil"
                placeholder="Selecciona estado"
                options={typeMaritalStatus.map((item) => ({
                  label: item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
              />
            </>
          )}

          <FormSelect
            name="person_segment_id"
            label="Segmento"
            placeholder="Selecciona segmento"
            options={personSegment.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          {!isJuridica && (
            <>
              <FormSelect
                name="origin_id"
                label="Origen"
                placeholder="Selecciona origen"
                options={clientOrigins.map((item) => ({
                  label: item.description,
                  value: item.id.toString(),
                }))}
                control={form.control}
              />
            </>
          )}

          <FormSelect
            name="nationality"
            label="Nacionalidad"
            placeholder="Selecciona nacionalidad"
            options={nationalityOptions}
            control={form.control}
            strictFilter={true}
          />

          <div className="col-span-1 md:col-span-2">
            <FormSelectAsync
              name="district_id"
              label="Ubigeo"
              placeholder="Selecciona ubigeo"
              control={form.control}
              useQueryHook={useDistricts}
              mapOptionFn={(item) => ({
                label: item.name + " - " + item.province + " - " + item.ubigeo,
                value: item.id.toString(),
              })}
              perPage={10}
              debounceMs={500}
              disabled={shouldDisableMainFields && !isRucNatural && isJuridica}
            />
          </div>

          <FormSelect
            name="tax_class_type_id"
            label="Clase de Impuesto"
            placeholder="Selecciona clase"
            options={taxClassType.map((item) => ({
              label: item.description,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <FormInput
              control={form.control}
              name="direction"
              label="Dirección"
              placeholder="Ingrese dirección"
              disabled={shouldDisableMainFields && !isRucNatural && isJuridica}
            />
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <FormSelect
              name="activity_economic_id"
              label="Actividad Económica"
              placeholder="Selecciona actividad"
              options={economicActivity.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
            />
          </div>

          {/* Sección: Datos del Cónyuge (Solo si está casado) */}
          {!isJuridica && isMarried && !fromOpportunities && (
            <GroupFormSection
              title="Datos del Cónyuge"
              icon={Heart}
              iconColor="text-pink-600"
              bgColor="bg-pink-50"
              cols={{ sm: 1, md: 3 }}
              className="mt-8"
            >
              <FormInput
                control={form.control}
                name="spouse_num_doc"
                label={
                  <div className="flex items-center gap-2 relative">
                    DNI
                    <DocumentValidationStatus
                      shouldValidate={true}
                      documentNumber={conyugeDni || ""}
                      expectedDigits={8}
                      isValidating={isConyugeDniLoading}
                      leftPosition="right-0"
                    />
                  </div>
                }
                type="number"
                placeholder="Número de documento"
                maxLength={8}
                addonEnd={
                  <ValidationIndicator
                    show={!!conyugeDni}
                    isValidating={isConyugeDniLoading}
                    isValid={conyugeDniData?.success && !!conyugeDniData.data}
                    hasError={
                      !!conyugeDniError ||
                      (conyugeDniData && !conyugeDniData.success)
                    }
                  />
                }
              />

              <div className="col-span-1 md:col-span-2">
                <FormInput
                  control={form.control}
                  name="spouse_full_name"
                  label="Nombres Completos"
                  placeholder="Nombres Completos"
                  disabled={shouldDisableSpouseFields}
                />
              </div>
            </GroupFormSection>
          )}

          {/* Sección: Representante Legal (Solo si es Persona Jurídica y NO viene de oportunidades) */}
          {isJuridica && !fromOpportunities && (
            <GroupFormSection
              title="Representante Legal"
              icon={Scale}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
              cols={{ sm: 2, md: 3 }}
              className="mt-8"
            >
              <FormInput
                control={form.control}
                name="legal_representative_num_doc"
                label={
                  <div className="flex items-center gap-2 relative">
                    DNI
                    <DocumentValidationStatus
                      shouldValidate={true}
                      documentNumber={legalRepresentativeDni || ""}
                      expectedDigits={8}
                      isValidating={isLegalRepDniLoading}
                      leftPosition="right-0"
                    />
                  </div>
                }
                type="number"
                placeholder="Número de documento"
                maxLength={8}
                addonEnd={
                  <ValidationIndicator
                    show={!!legalRepresentativeDni}
                    isValidating={isLegalRepDniLoading}
                    isValid={legalRepDniData?.success && !!legalRepDniData.data}
                    hasError={
                      !!legalRepDniError ||
                      (legalRepDniData && !legalRepDniData.success)
                    }
                  />
                }
              />

              <FormInput
                control={form.control}
                name="legal_representative_name"
                label="Nombres"
                placeholder="Nombres"
                disabled={shouldDisableLegalRepFields}
              />

              <FormInput
                control={form.control}
                name="legal_representative_paternal_surname"
                label="Apellido Paterno"
                placeholder="Apellido paterno"
                disabled={shouldDisableLegalRepFields}
              />

              <FormInput
                control={form.control}
                name="legal_representative_maternal_surname"
                label="Apellido Materno"
                placeholder="Apellido materno"
                disabled={shouldDisableLegalRepFields}
              />
            </GroupFormSection>
          )}
        </GroupFormSection>

        {/* GRUPO 2: INFORMACIÓN ADICIONAL */}
        <GroupFormSection
          title="Información de Contacto"
          icon={Building2}
          iconColor="text-secondary"
          bgColor="bg-red-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormInput
            control={form.control}
            name="email"
            label="Email Principal"
            type="email"
            placeholder="email@ejemplo.com"
          />

          <FormInput
            control={form.control}
            name="phone"
            label="Teléfono Principal"
            placeholder="Ingrese teléfono"
          />

          <FormInput
            control={form.control}
            name="secondary_phone_contact_name"
            label="Contacto"
            placeholder="Nombre del contacto"
          />

          <FormInput
            control={form.control}
            name="secondary_email"
            label="Email Opcional"
            type="email"
            placeholder="email2@ejemplo.com"
          />

          <FormInput
            control={form.control}
            name="secondary_phone"
            label="Teléfono Opcional"
            placeholder="Teléfono 2"
          />
        </GroupFormSection>

        {/* GRUPO 3: LICENCIA - Solo se muestra si NO viene de oportunidades */}
        {!fromOpportunities && (
          <GroupFormSection
            title="Licencias"
            icon={FileText}
            iconColor="text-gray-600"
            bgColor="bg-gray-50"
            cols={{ sm: 2, md: 3 }}
          >
            <FormInput
              control={form.control}
              name="driver_num_doc"
              label={
                <div className="flex items-center gap-2 relative">
                  DNI
                  <DocumentValidationStatus
                    shouldValidate={true}
                    documentNumber={conductorDni || ""}
                    expectedDigits={8}
                    isValidating={isConductorDniLoading}
                    leftPosition="right-0"
                  />
                </div>
              }
              type="number"
              placeholder="Número de documento"
              maxLength={8}
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
              name="driver_full_name"
              label="Nombres Completo"
              placeholder="Nombres completos"
              disabled={shouldDisableLicenseFields}
            />

            <FormInput
              control={form.control}
              name="driving_license"
              label="Número de Licencia"
              placeholder="Número de licencia"
              disabled={shouldDisableLicenseFields}
            />

            <FormInput
              control={form.control}
              name="driving_license_category"
              label="Categoría"
              placeholder="Ingrese categoría"
              disabled={shouldDisableLicenseFields}
            />

            <DatePickerFormField
              control={form.control}
              name="driving_license_expiration_date"
              label="Fecha de Vencimiento"
              placeholder="Selecciona fecha"
              captionLayout="dropdown"
              disabled={shouldDisableLicenseFields}
            />

            <FormSelect
              name="status_license"
              label="Estado"
              placeholder="Selecciona estado"
              options={statusLicenseOptions}
              control={form.control}
              disabled={shouldDisableLicenseFields}
              strictFilter={true}
            />

            <FormInput
              control={form.control}
              name="restriction"
              label="Restricciones"
              placeholder="Restricciones"
              disabled={true}
              value={form.watch("restriction") || "NO DEFINIDO"}
            />
          </GroupFormSection>
        )}
        <div className="flex gap-4 w-full justify-end">
          <ConfirmationDialog
            trigger={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
            title="¿Cancelar registro?"
            variant="destructive"
            icon="warning"
            onConfirm={() => {
              router(ABSOLUTE_ROUTE!);
            }}
          />

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !form.formState.isValid ||
              isValidatingDocument ||
              isConyugeDniLoading ||
              isLegalRepDniLoading ||
              isConductorDniLoading
            }
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting
              ? "Guardando..."
              : `Guardar ${isJuridica ? "Empresa" : "Cliente"}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
