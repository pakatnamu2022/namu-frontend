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
import { User, Building2, Loader, Info } from "lucide-react";
import { Input } from "@/components/ui/input";

import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllDocumentType } from "@/features/ap/configuraciones/maestros-general/tipos-documento/lib/documentTypes.hook";
import { useAllDistrict } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.hook";
import { useAllTypeClient } from "@/features/ap/configuraciones/maestros-general/tipos-persona/lib/typeClient.hook";
import {
  useDniValidation,
  useRucValidation,
} from "@/shared/hooks/useDocumentValidation";
import { useEffect, useState } from "react";
import {
  BUSINESS_PARTNERS,
  EMPRESA_AP,
  TYPE_BUSINESS_PARTNERS,
  VALIDATABLE_DOCUMENT,
} from "@/core/core.constants";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { CUSTOMERS_RP } from "@/features/ap/comercial/clientes/lib/customers.constants";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import {
  CustomersRpSchema,
  customersRpSchemaCreate,
  customersRpSchemaUpdate,
} from "../lib/customers-rp.schema";

interface CustomersRpFormProps {
  defaultValues: Partial<CustomersRpSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  isModal?: boolean;
}

export const CustomersRpForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: CustomersRpFormProps) => {
  const router = useNavigate();

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? customersRpSchemaCreate : customersRpSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      company_id: EMPRESA_AP.id,
      type: defaultValues?.type || TYPE_BUSINESS_PARTNERS.CLIENTE,
      nationality: "NACIONAL",
      tax_class_type_id: BUSINESS_PARTNERS.TYPE_TAX_CLASS_DEFAULT_ID,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = CUSTOMERS_RP;

  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");
  const [companyStatus, setCompanyStatus] = useState("-");
  const [companyCondition, setCompanyCondition] = useState("-");
  const [initialDocumentNumber] = useState(defaultValues.num_doc);
  const { data: typesPerson = [], isLoading: isLoadingTypesPerson } =
    useAllTypeClient();
  const { data: documentTypes = [], isLoading: isLoadingDocumentTypes } =
    useAllDocumentType();
  const { data: districts = [] } = useAllDistrict();

  // Watch para campos condicionales
  const typePersonId = form.watch("type_person_id");
  const documentTypeId = form.watch("document_type_id");
  const documentNumber = form.watch("num_doc");
  const typePersonWatch = form.watch("type_person_id");
  const isJuridica = typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID;
  // Obtenemos los numeros de digitos esperados para DNI y RUC
  const selectedDocumentTypeRuc = documentTypes.find(
    (type) => type.id.toString() === BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID
  );

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

  // Extraer DNI del RUC natural (10 + DNI + digito verificador)
  const extractedDni =
    isRucNatural && documentNumber?.length === Number(numDigitsRuc)
      ? documentNumber!.substring(2, 10)
      : documentNumber;

  // DNI directo o DNI extraido de RUC natural
  const shouldEnableDniValidation =
    !isFirstLoad &&
    hasDocumentChanged &&
    ((validationType === "dni" && shouldTriggerValidation) ||
      (isRucNatural && shouldTriggerValidation));

  // Validacion RUC solo para persona juridica (20...)
  const shouldEnableRucValidation =
    !isFirstLoad &&
    hasDocumentChanged &&
    validationType === "ruc" &&
    typePersonId === BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID &&
    shouldTriggerValidation;

  // Hooks de validacion condicional
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

  // Datos consolidados
  const validationData = dniData || rucData;
  const validationError = dniError || rucError;

  // Estado de carga consolidado
  const isValidatingDocument = isDniLoading || isRucLoading;

  // Verificar si el cliente esta en la base de datos y obtener su tipo
  const isFromDatabase = validationData?.source === "database";
  const businessPartnerType = validationData?.data?.type;

  // Determinar el mensaje de notificacion
  const getNotificationMessage = () => {
    if (!isFromDatabase || !businessPartnerType) return null;

    if (
      businessPartnerType === TYPE_BUSINESS_PARTNERS.CLIENTE ||
      businessPartnerType === TYPE_BUSINESS_PARTNERS.AMBOS
    ) {
      return "El cliente ya esta registrado en el sistema";
    }

    if (businessPartnerType === TYPE_BUSINESS_PARTNERS.PROVEEDOR) {
      return "Este cliente esta como proveedor en el sistema";
    }

    return null;
  };

  const notificationMessage = getNotificationMessage();

  useEffect(() => {
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

  // Efecto para auto-completar campos cuando se obtienen datos validos
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
        const ubigeo = rucInfo.ubigeo_sunat;
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

        // Asignar estado y condicion de la empresa
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

        const matchedDistrict = districts.find(
          (district) => district.ubigeo === ubigeo
        );
        if (matchedDistrict) {
          form.setValue("district_id", String(matchedDistrict.id), {
            shouldValidate: true,
          });
        }
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

    // Limpiar campos cuando hay error en la validacion o datos invalidos
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

  // Agregar este useEffect despues de los otros useEffect existentes
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

  // AQUI VAN LAS VARIABLES DE ESTADO DINAMICAS
  const shouldDisableMainFields = Boolean(
    validationData?.success && validationData.data
  );

  // Funcion para filtrar tipos de documento segun tipo de persona
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

  const isLoading = isLoadingDocumentTypes || isLoadingTypesPerson;

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* GRUPO 1: INFORMACION PERSONAL */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <User className="size-5 text-primary mr-2" />
                Informacion Personal
              </h3>

              {notificationMessage && (
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
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {/* Fila 1: Datos basicos */}
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

              <FormField
                control={form.control}
                name="num_doc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 relative">
                      Num. Documento
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
                          type="number"
                          placeholder={
                            selectedDocumentType
                              ? `Ingrese ${expectedDigits} digitos`
                              : "Ingrese numero"
                          }
                          {...field}
                          maxLength={expectedDigits || undefined}
                        />
                        {/* Indicador de estado */}
                        {shouldValidate && documentNumber && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos para Persona Juridica */}
              {isJuridica && (
                <>
                  <div className="col-span-full">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <div className="relative">
                            <FormLabel>Razon Social</FormLabel>
                            {/* Indicadores de Estado y Condicion */}
                            {isJuridica &&
                              (companyStatus !== "-" ||
                                companyCondition !== "-") && (
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

                                  {/* Condicion */}
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
                                    Condicion: {companyCondition}
                                  </div>
                                </div>
                              )}
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Ingrese razon social"
                              {...field}
                              disabled={shouldDisableMainFields}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Campos ocultos para enviar los datos */}
                  <input type="hidden" {...form.register("company_status")} />
                  <input
                    type="hidden"
                    {...form.register("company_condition")}
                  />
                </>
              )}

              {/* Campos para Persona Natural */}
              {!isJuridica && (
                <>
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ingrese primer nombres"
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
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segundo Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ingrese segundo nombres"
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
                    name="paternal_surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido Paterno</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Apellido paterno"
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
                    name="maternal_surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido Materno</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Apellido materno"
                            {...field}
                            disabled={shouldDisableMainFields}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-1 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razon Social</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ingrese razon social"
                              {...field}
                              disabled={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <FormSelect
                name="district_id"
                label="Ubigeo"
                placeholder="Selecciona ubigeo"
                options={districts.map((item) => ({
                  label:
                    item.name + " - " + item.province + " - " + item.ubigeo,
                  value: item.id.toString(),
                }))}
                control={form.control}
                strictFilter={true}
                disabled={
                  shouldDisableMainFields && !isRucNatural && isJuridica
                }
              />

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direccion</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese direccion"
                          {...field}
                          disabled={
                            shouldDisableMainFields &&
                            !isRucNatural &&
                            isJuridica
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* GRUPO 2: INFORMACION ADICIONAL */}
        <GroupFormSection
          title="Informacion de Contacto"
          icon={Building2}
          iconColor="text-secondary"
          bgColor="bg-red-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Principal</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@ejemplo.com"
                    {...field}
                  />
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
                <FormLabel>Telefono Principal</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese telefono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondary_phone_contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contacto</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del contacto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondary_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Opcional</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email2@ejemplo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondary_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono Opcional</FormLabel>
                <FormControl>
                  <Input placeholder="Telefono 2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>
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
              isSubmitting || !form.formState.isValid || isValidatingDocument
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
