"use client";

import { useMemo, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Building2, FileText, User, MapPin, Banknote } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import { useRucValidation } from "@/shared/hooks/useDocumentValidation";
import { NUM_DIGITS_RUC } from "@/features/ap/configuraciones/maestros-general/tipos-documento/lib/documentTypes.constants";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import {
  usePurchaseRequestQuote,
  usePurchaseRequestQuoteById,
} from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.hook";
import { PurchaseRequestQuoteResource } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";
import { useDistricts } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.hook";
import { DistrictResource } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.interface";
import {
  declaracionJuradaKycLegalSchema,
  DeclaracionJuradaKycLegalSchema,
} from "../lib/declaracionJuradaKyc.schema";
import {
  BENEFICIARY_TYPE_OPTIONS,
  ENTITY_REPRESENTATION_TYPE_OPTIONS,
  THIRD_DOC_TYPE_OPTIONS,
  THIRD_PEP_STATUS_OPTIONS,
  OFFICE_STREET_TYPES,
  REP_DOC_TYPES,
  REP_INSTRUMENT_TYPES,
  REP_REPRESENTATION_TYPES,
  THIRD_REPRESENTATION_TYPES_JURIDICA,
} from "../lib/declaracionJuradaKyc.constants";
import { EMPRESA_AP, BUSINESS_PARTNERS } from "@/core/core.constants";
import { CustomerKycDeclarationLegal } from "../lib/declaracionJuradaKyc.interface";

interface Props {
  defaultValues: Partial<DeclaracionJuradaKycLegalSchema>;
  onSubmit: (data: DeclaracionJuradaKycLegalSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel: () => void;
  legalInfo?: CustomerKycDeclarationLegal | null;
}

function usePartnerByIdForAsync(id: any) {
  return useCustomersById(Number(id) || 0);
}

function useQuoteByIdForAsync(id: any) {
  return usePurchaseRequestQuoteById(Number(id) || 0);
}

export default function DeclaracionJuradaKycLegalForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  legalInfo,
}: Props) {
  const form = useForm<DeclaracionJuradaKycLegalSchema>({
    resolver: zodResolver(declaracionJuradaKycLegalSchema) as any,
    defaultValues: {
      person_type: "JURIDICA",
      beneficiary_type: "PROPIO",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const [districtDefaultOption, setDistrictDefaultOption] = useState<
    { value: string; label: string } | undefined
  >(undefined);

  const { data: allSedes = [] } = useAllSedes({ empresa_id: EMPRESA_AP.id });
  const sedeOptions = useMemo(
    () => allSedes.map((s) => ({ value: String(s.id), label: s.description })),
    [allSedes],
  );

  const businessPartnerId = useWatch({
    control: form.control,
    name: "business_partner_id",
  });
  const { data: selectedPartner } = useCustomersById(
    Number(businessPartnerId) || 0,
  );

  useEffect(() => {
    if (!selectedPartner || legalInfo) return;
    form.setValue("company_name", selectedPartner.full_name ?? "", {
      shouldValidate: false,
    });
    form.setValue("ruc", selectedPartner.num_doc ?? "", {
      shouldValidate: false,
    });
    if (selectedPartner.legal_representative_full_name) {
      form.setValue(
        "rep_full_name",
        selectedPartner.legal_representative_full_name,
        { shouldValidate: false },
      );
    }
    if (selectedPartner.legal_representative_num_doc) {
      form.setValue(
        "rep_doc_number",
        selectedPartner.legal_representative_num_doc,
        { shouldValidate: false },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPartner]);

  const repDocType = useWatch({ control: form.control, name: "rep_doc_type" });
  const repInstrumentType = useWatch({
    control: form.control,
    name: "rep_instrument_type",
  });
  const beneficiaryType = useWatch({
    control: form.control,
    name: "beneficiary_type",
  });
  const entityRuc = useWatch({ control: form.control, name: "entity_ruc" });

  const showThirdBlock = beneficiaryType === "TERCERO_NATURAL";
  const showEntityBlock =
    beneficiaryType === "PERSONA_JURIDICA" ||
    beneficiaryType === "ENTE_JURIDICO";

  const {
    data: entityRucData,
    isLoading: isEntityRucLoading,
    error: entityRucError,
  } = useRucValidation(
    entityRuc ?? undefined,
    showEntityBlock && !!entityRuc && entityRuc.length === NUM_DIGITS_RUC,
  );

  useEffect(() => {
    if (!entityRucData) return;
    if (entityRucData.success && entityRucData.data?.valid) {
      form.setValue("entity_name", entityRucData.data.business_name, {
        shouldValidate: true,
      });
    } else {
      form.setValue("entity_name", "", { shouldValidate: true });
    }
  }, [entityRucData]);

  // Pre-cargar opción del distrito si existe
  useEffect(() => {
    if (legalInfo?.office_district_id && legalInfo.office_district) {
      const label = [
        legalInfo.office_district,
        legalInfo.office_province,
        legalInfo.office_department,
      ]
        .filter(Boolean)
        .join(" - ");
      setDistrictDefaultOption({
        value: String(legalInfo.office_district_id),
        label,
      });
    }
  }, [legalInfo]);

  const handleSubmit = (data: DeclaracionJuradaKycLegalSchema) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        {/* Info de empresa (solo lectura en edición) */}
        {legalInfo && (
          <GroupFormSection
            title="Datos de la Empresa"
            icon={Building2}
            color="gray"
            cols={{ sm: 1, md: 2, xl: 4 }}
          >
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground">Razón Social</p>
              <p className="font-semibold">
                {legalInfo.bp_company_name || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">RUC</p>
              <p className="font-medium">{legalInfo.bp_ruc || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="font-medium">{legalInfo.bp_phone || "—"}</p>
            </div>
            <div className="md:col-span-2 xl:col-span-2">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-sm break-all">
                {legalInfo.bp_email || "—"}
              </p>
            </div>
            <div className="md:col-span-2 xl:col-span-2">
              <DatePickerFormField
                control={form.control}
                name="declaration_date"
                label="Fecha de Declaración"
                placeholder="Seleccione fecha"
              />
            </div>
          </GroupFormSection>
        )}

        {/* Vinculación */}
        {!legalInfo && (
          <GroupFormSection
            title="Vinculación"
            icon={FileText}
            color="gray"
            cols={{ sm: 1, md: 2 }}
          >
            <FormSelectAsync
              name="business_partner_id"
              label="Empresa / Persona Jurídica"
              placeholder="Buscar empresa..."
              control={form.control}
              required
              useQueryHook={useCustomers}
              mapOptionFn={(c: CustomersResource) => ({
                value: String(c.id),
                label: c.full_name,
                description: `${c.document_type} ${c.num_doc}`,
              })}
              perPage={10}
              debounceMs={400}
              useFindByIdHook={usePartnerByIdForAsync}
              additionalParams={{
                document_type_id: BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID,
              }}
            />
            <FormSelect
              name="sede_id"
              label="Sede"
              placeholder="Seleccione sede..."
              control={form.control}
              required
              options={sedeOptions}
            />
            <FormSelectAsync
              name="purchase_request_quote_id"
              label="Cotización vinculada"
              placeholder="Buscar por correlativo..."
              control={form.control}
              useQueryHook={usePurchaseRequestQuote}
              mapOptionFn={(q: PurchaseRequestQuoteResource) => ({
                value: String(q.id),
                label: q.correlative,
                description: q.holder,
              })}
              perPage={10}
              debounceMs={400}
              useFindByIdHook={useQuoteByIdForAsync}
              allowClear
            />
            <DatePickerFormField
              control={form.control}
              name="declaration_date"
              label="Fecha de Declaración"
              placeholder="Seleccione fecha"
            />
          </GroupFormSection>
        )}

        {/* Datos de la empresa (campos 1-5) */}
        <GroupFormSection
          title="Información de la Empresa"
          icon={Building2}
          color="blue"
          cols={{ sm: 1, md: 2, xl: 3 }}
        >
          <FormInput
            control={form.control}
            name="company_name"
            label="Nombre / Razón Social"
            placeholder="Ej: Empresa SAC"
            optional
            uppercase
          />
          <FormInput
            control={form.control}
            name="ruc"
            label="RUC"
            placeholder="Ej: 20123456789"
            optional
            maxLength={NUM_DIGITS_RUC}
            onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
          />
          <FormInput
            control={form.control}
            name="foreign_registry_number"
            label="N° Registro Extranjero"
            placeholder="Si aplica"
            optional
            uppercase
          />
          <div className="md:col-span-2 xl:col-span-3">
            <FormTextArea
              control={form.control}
              name="business_purpose"
              label="Objeto Social"
              placeholder="Describe el objeto social de la empresa"
              rows={2}
              required
            />
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <FormTextArea
              control={form.control}
              name="final_beneficiaries"
              label="Beneficiarios Finales"
              placeholder="Nombres de los beneficiarios finales"
              rows={2}
              required
            />
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <FormTextArea
              control={form.control}
              name="purpose_relationship"
              label="Propósito de la Relación Comercial"
              placeholder="Ej: Adquisición de vehículo para uso empresarial"
              rows={2}
              required
            />
          </div>
        </GroupFormSection>

        {/* Representante (campo 6) */}
        <GroupFormSection
          title="Representante Legal"
          icon={User}
          color="amber"
          cols={{ sm: 1, md: 2, xl: 3 }}
        >
          <FormInput
            control={form.control}
            name="rep_full_name"
            label="Nombre Completo del Representante"
            placeholder="Nombre completo"
            required
            uppercase
          />
          <FormSelect
            name="rep_doc_type"
            label="Tipo de Documento"
            placeholder="Seleccione..."
            options={REP_DOC_TYPES}
            control={form.control}
            required
          />
          <FormInput
            control={form.control}
            name="rep_doc_number"
            label="N° Documento"
            placeholder="Número de documento"
            required
            uppercase
          />
          {repDocType === "OTRO" && (
            <FormInput
              control={form.control}
              name="rep_doc_other"
              label="Especifique documento"
              placeholder="Tipo de documento"
              required
              uppercase
            />
          )}
          <FormSelect
            name="rep_representation_type"
            label="Tipo de Representación"
            placeholder="Seleccione..."
            options={REP_REPRESENTATION_TYPES}
            control={form.control}
            required
          />
          <FormSelect
            name="rep_instrument_type"
            label="Tipo de Instrumento"
            placeholder="Seleccione..."
            options={REP_INSTRUMENT_TYPES}
            control={form.control}
            required
          />

          {/* Campos condicionales por tipo de instrumento */}
          {repInstrumentType === "ESCRITURA_PUBLICA" && (
            <>
              <DatePickerFormField
                control={form.control}
                name="rep_escritura_date"
                label="Fecha Escritura Pública"
                placeholder="Seleccione fecha"
              />
              <FormInput
                control={form.control}
                name="rep_notary_name"
                label="Notario"
                placeholder="Nombre del notario"
                optional
                uppercase
              />
              <FormInput
                control={form.control}
                name="rep_registry_partition"
                label="Partida Registral"
                placeholder="N° partida"
                optional
                uppercase
              />
              <FormInput
                control={form.control}
                name="rep_registry_seat"
                label="Asiento Registral"
                placeholder="Asiento"
                optional
                uppercase
              />
              <FormInput
                control={form.control}
                name="rep_registry_section"
                label="Sección Registral"
                placeholder="Sección"
                optional
                uppercase
              />
              <FormInput
                control={form.control}
                name="rep_registry_zone"
                label="Zona Registral"
                placeholder="Zona"
                optional
                uppercase
              />
            </>
          )}

          {repInstrumentType === "COPIA_CERTIFICADA_ACTA" && (
            <>
              <DatePickerFormField
                control={form.control}
                name="rep_acta_certified_date"
                label="Fecha de Certificación"
                placeholder="Seleccione fecha"
              />
              <DatePickerFormField
                control={form.control}
                name="rep_acta_date"
                label="Fecha del Acta"
                placeholder="Seleccione fecha"
              />
              <FormInput
                control={form.control}
                name="rep_registry_partition"
                label="Partida Registral"
                placeholder="N° partida"
                optional
                uppercase
              />
              <FormInput
                control={form.control}
                name="rep_registry_seat"
                label="Asiento Registral"
                placeholder="Asiento"
                optional
                uppercase
              />
              <FormInput
                control={form.control}
                name="rep_registry_section"
                label="Sección Registral"
                placeholder="Sección"
                optional
                uppercase
              />
              <FormInput
                control={form.control}
                name="rep_registry_zone"
                label="Zona Registral"
                placeholder="Zona"
                optional
                uppercase
              />
            </>
          )}

          {repInstrumentType === "OTROS" && (
            <FormInput
              control={form.control}
              name="rep_instrument_other"
              label="Especifique instrumento"
              placeholder="Descripción del instrumento"
              required
              uppercase
            />
          )}
        </GroupFormSection>

        {/* Dirección Oficina (campo 7) */}
        <GroupFormSection
          title="Dirección de Oficina"
          icon={MapPin}
          color="green"
          cols={{ sm: 1, md: 2, xl: 3 }}
        >
          <FormSelect
            name="office_street_type"
            label="Tipo de Vía"
            placeholder="Seleccione..."
            options={OFFICE_STREET_TYPES}
            control={form.control}
            required
          />
          <div className="md:col-span-1 xl:col-span-2">
            <FormInput
              control={form.control}
              name="office_street_name"
              label="Nombre de Vía"
              placeholder="Nombre de la calle, avenida, etc."
              required
              uppercase
            />
          </div>
          <FormInput
            control={form.control}
            name="office_number"
            label="Número"
            placeholder="N°"
            required
            uppercase
          />
          <FormInput
            control={form.control}
            name="office_int_number"
            label="Interior / Dpto."
            placeholder="Int., Dpto., Piso"
            optional
            uppercase
          />
          <FormInput
            control={form.control}
            name="office_urbanization"
            label="Urbanización"
            placeholder="Nombre de urbanización"
            optional
            uppercase
          />
          <div className="md:col-span-2 xl:col-span-2">
            <FormSelectAsync
              key={districtDefaultOption?.value || "office-district-select"}
              name="office_district_id"
              label="Distrito / Provincia / Departamento"
              placeholder="Buscar ubigeo..."
              control={form.control}
              useQueryHook={useDistricts}
              mapOptionFn={(item: DistrictResource) => ({
                value: String(item.id),
                label: `${item.name} - ${item.province} - ${item.department}`,
              })}
              perPage={10}
              debounceMs={400}
              required
              defaultOption={districtDefaultOption}
            />
          </div>
          <FormInput
            control={form.control}
            name="office_phone"
            label="Teléfono de Oficina"
            placeholder="Ej: 074-123456"
            optional
            uppercase
          />
        </GroupFormSection>

        {/* Beneficiario (campo 8) */}
        <GroupFormSection
          title="Beneficiario de la Operación"
          icon={Banknote}
          color="rose"
          cols={{ sm: 1, md: 2, xl: 3 }}
        >
          <FormSelect
            name="beneficiary_type"
            label="Tipo de Beneficiario"
            placeholder="Seleccione..."
            options={BENEFICIARY_TYPE_OPTIONS}
            control={form.control}
            required
          />

          {beneficiaryType === "PROPIO" && (
            <div className="md:col-span-2 xl:col-span-2">
              <FormTextArea
                control={form.control}
                name="own_funds_origin"
                label="Origen de Fondos Propios"
                placeholder="Ej: Ingresos por actividad empresarial"
                rows={2}
                required
              />
            </div>
          )}

          {showThirdBlock && (
            <>
              <FormInput
                control={form.control}
                name="third_full_name"
                label="Nombre del Tercero"
                placeholder="Nombre completo"
                required
                uppercase
              />
              <FormSelect
                name="third_doc_type"
                label="Tipo de Documento"
                placeholder="Seleccione..."
                options={THIRD_DOC_TYPE_OPTIONS}
                control={form.control}
              />
              <FormInput
                control={form.control}
                name="third_doc_number"
                label="Número de Documento"
                placeholder="N° documento"
                optional
                uppercase
              />
              <FormSelect
                name="third_representation_type"
                label="Tipo de Representación"
                placeholder="Seleccione..."
                options={THIRD_REPRESENTATION_TYPES_JURIDICA}
                control={form.control}
              />
              <FormSelect
                name="third_pep_status"
                label="¿Tercero es / fue PEP?"
                placeholder="Seleccione..."
                options={THIRD_PEP_STATUS_OPTIONS}
                control={form.control}
              />
              <FormInput
                control={form.control}
                name="third_pep_position"
                label="Cargo PEP del Tercero"
                placeholder="Si aplica"
                optional
                uppercase
              />
              <FormInput
                control={form.control}
                name="third_pep_institution"
                label="Institución PEP del Tercero"
                placeholder="Si aplica"
                optional
                uppercase
              />
              <div className="md:col-span-2 xl:col-span-3">
                <FormTextArea
                  control={form.control}
                  name="third_funds_origin"
                  label="Origen de Fondos del Tercero"
                  placeholder="Describa el origen de los fondos del tercero"
                  rows={2}
                  required
                />
              </div>
            </>
          )}

          {showEntityBlock && (
            <>
              <FormInput
                control={form.control}
                name="entity_name"
                label="Nombre / Razón Social"
                placeholder="Nombre de la entidad"
                required
                uppercase
                disabled={
                  !!entityRucData?.success && !!entityRucData.data?.valid
                }
              />
              <FormInput
                control={form.control}
                name="entity_ruc"
                label="RUC"
                placeholder="Ej: 20123456789"
                optional
                maxLength={NUM_DIGITS_RUC}
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                }}
                addonEnd={
                  <ValidationIndicator
                    positioned={false}
                    show={!!entityRuc}
                    isValidating={isEntityRucLoading}
                    isValid={
                      !!entityRucData?.success && !!entityRucData.data?.valid
                    }
                    hasError={
                      !!entityRucError ||
                      (!!entityRucData && !entityRucData.success)
                    }
                  />
                }
              />
              <FormSelect
                name="entity_representation_type"
                label="Tipo de Representación"
                placeholder="Seleccione..."
                options={ENTITY_REPRESENTATION_TYPE_OPTIONS}
                control={form.control}
              />
              <FormInput
                control={form.control}
                name="entity_final_beneficiary"
                label="Beneficiario Final"
                placeholder="Nombre del beneficiario final"
                optional
                uppercase
              />
              <div className="md:col-span-2 xl:col-span-3">
                <FormTextArea
                  control={form.control}
                  name="entity_funds_origin"
                  label="Origen de Fondos de la Entidad"
                  placeholder="Describa el origen de los fondos"
                  rows={2}
                  required
                />
              </div>
            </>
          )}

          <FormInput
            control={form.control}
            name="account_number"
            label="Número de Cuenta Bancaria"
            placeholder="N° de cuenta"
            optional
            uppercase
          />
        </GroupFormSection>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
                ? "Crear Declaración"
                : "Actualizar Declaración"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
