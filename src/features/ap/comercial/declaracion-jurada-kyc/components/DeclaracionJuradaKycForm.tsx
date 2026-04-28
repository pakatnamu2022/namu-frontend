"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, User, Shield, Users, Banknote, FileText } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import {
  declaracionJuradaKycSchema,
  declaracionJuradaKycSchemaUpdate,
  DeclaracionJuradaKycSchema,
} from "../lib/declaracionJuradaKyc.schema";
import {
  PEP_STATUS_OPTIONS,
  IS_PEP_RELATIVE_OPTIONS,
  THIRD_PEP_STATUS_OPTIONS,
  BENEFICIARY_TYPE_OPTIONS,
  THIRD_REPRESENTATION_TYPE_OPTIONS,
  ENTITY_REPRESENTATION_TYPE_OPTIONS,
  PEP_IS_ACTIVE,
} from "../lib/declaracionJuradaKyc.constants";
import { useWatch } from "react-hook-form";
import { CustomerKycDeclarationResource } from "../lib/declaracionJuradaKyc.interface";

interface Props {
  defaultValues: Partial<DeclaracionJuradaKycSchema>;
  onSubmit: (data: DeclaracionJuradaKycSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel: () => void;
  clientInfo?: CustomerKycDeclarationResource | null;
}

export default function DeclaracionJuradaKycForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  clientInfo,
}: Props) {
  const schema =
    mode === "create"
      ? declaracionJuradaKycSchema
      : declaracionJuradaKycSchemaUpdate;

  const form = useForm<DeclaracionJuradaKycSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      pep_relatives: [],
      pep_relative_data: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const pepStatus = useWatch({ control: form.control, name: "pep_status" });
  const isPepRelative = useWatch({ control: form.control, name: "is_pep_relative" });
  const beneficiaryType = useWatch({ control: form.control, name: "beneficiary_type" });

  const pepActive = PEP_IS_ACTIVE(pepStatus ?? "");
  const showThirdBlock = beneficiaryType === "TERCERO_NATURAL";
  const showEntityBlock =
    beneficiaryType === "PERSONA_JURIDICA" ||
    beneficiaryType === "ENTE_JURIDICO";

  const {
    fields: relativesFields,
    append: appendRelative,
    remove: removeRelative,
  } = useFieldArray({ control: form.control, name: "pep_relatives" as any });

  const {
    fields: pepRelativeDataFields,
    append: appendPepRelative,
    remove: removePepRelative,
  } = useFieldArray({ control: form.control, name: "pep_relative_data" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Datos del cliente (solo lectura si se carga del backend) */}
        {clientInfo && (
          <GroupFormSection
            title="Datos del Cliente"
            icon={User}
            color="gray"
            cols={{ sm: 1, md: 2, xl: 4 }}
          >
            <div>
              <p className="text-xs text-muted-foreground">Nombre Completo</p>
              <p className="font-semibold">{clientInfo.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documento</p>
              <p className="font-medium">
                {clientInfo.document_type} — {clientInfo.num_doc}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="font-medium">{clientInfo.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-sm break-all">
                {clientInfo.email || "—"}
              </p>
            </div>
            <div className="md:col-span-2 xl:col-span-2">
              <p className="text-xs text-muted-foreground">Dirección</p>
              <p className="font-medium text-sm">
                {[clientInfo.district, clientInfo.province, clientInfo.department]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado Civil</p>
              <p className="font-medium">{clientInfo.marital_status || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nacionalidad</p>
              <p className="font-medium">{clientInfo.nationality || "—"}</p>
            </div>
          </GroupFormSection>
        )}

        {/* IDs ocultos cuando el cliente viene precargado */}
        {!clientInfo && (
          <GroupFormSection
            title="Vinculación"
            icon={FileText}
            color="gray"
            cols={{ sm: 1, md: 2 }}
          >
            <FormInput
              control={form.control}
              name="business_partner_id"
              label="ID Cliente (Business Partner)"
              placeholder="Ej: 15"
              required
              type="number"
            />
            <FormInput
              control={form.control}
              name="company_id"
              label="ID Empresa"
              placeholder="Ej: 1"
              required
              type="number"
            />
            <FormInput
              control={form.control}
              name="purchase_request_quote_id"
              label="ID Cotización (opcional)"
              placeholder="Ej: 42"
              type="number"
              optional
            />
          </GroupFormSection>
        )}

        {/* Información Ocupacional */}
        <GroupFormSection
          title="Ocupación y Propósito"
          icon={FileText}
          color="blue"
          cols={{ sm: 1, md: 2, xl: 3 }}
        >
          <FormInput
            control={form.control}
            name="occupation"
            label="Ocupación"
            placeholder="Ej: Contador"
            optional
          />
          <FormInput
            control={form.control}
            name="fixed_phone"
            label="Teléfono Fijo"
            placeholder="Ej: 074-123456"
            optional
          />
          <DatePickerFormField
            control={form.control}
            name="declaration_date"
            label="Fecha de Declaración"
            placeholder="Seleccione fecha"
            required
          />
          <div className="md:col-span-2 xl:col-span-3">
            <FormTextArea
              control={form.control}
              name="purpose_relationship"
              label="Propósito de la Relación Comercial"
              placeholder="Ej: Adquisición de vehículo para uso personal"
              rows={2}
              optional
            />
          </div>
        </GroupFormSection>

        {/* Estado PEP del titular */}
        <GroupFormSection
          title="Situación PEP del Titular"
          icon={Shield}
          color="amber"
          cols={{ sm: 1, md: 2, xl: 4 }}
        >
          <FormSelect
            name="pep_status"
            label="¿Es / Fue PEP?"
            placeholder="Seleccione..."
            options={PEP_STATUS_OPTIONS}
            control={form.control}
            required
          />
          <FormSelect
            name="pep_collaborator_status"
            label="¿Es / Fue colaborador PEP?"
            placeholder="Seleccione..."
            options={PEP_STATUS_OPTIONS}
            control={form.control}
            required
          />

          {pepActive && (
            <>
              <FormInput
                control={form.control}
                name="pep_position"
                label="Cargo / Posición PEP"
                placeholder="Ej: Funcionario municipal"
                required
              />
              <FormInput
                control={form.control}
                name="pep_institution"
                label="Institución PEP"
                placeholder="Ej: Municipalidad de Chiclayo"
                required
              />
            </>
          )}

          <FormInput
            control={form.control}
            name="pep_spouse_name"
            label="Nombre del cónyuge (si aplica)"
            placeholder="Ej: María García"
            optional
          />
        </GroupFormSection>

        {/* Parientes PEP (array de strings) */}
        <GroupFormSection
          title="Parientes con Cargo Público"
          icon={Users}
          color="orange"
          cols={{ sm: 1 }}
          headerExtra={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() =>
                appendRelative("" as any)
              }
            >
              <Plus className="size-3" />
              Agregar
            </Button>
          }
        >
          {relativesFields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin parientes con cargo público registrados.
            </p>
          )}
          {relativesFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-end">
              <div className="flex-1">
                <FormInput
                  control={form.control}
                  name={`pep_relatives.${index}` as any}
                  label={`Pariente ${index + 1}`}
                  placeholder="Nombre completo"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                onClick={() => removeRelative(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </GroupFormSection>

        {/* Pariente PEP del declarante */}
        <GroupFormSection
          title="¿Es Pariente de PEP?"
          icon={Users}
          color="rose"
          cols={{ sm: 1, md: 2 }}
          headerExtra={
            isPepRelative === "SI_SOY" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  appendPepRelative({ pep_full_name: "", relationship: "" })
                }
              >
                <Plus className="size-3" />
                Agregar pariente
              </Button>
            )
          }
        >
          <div className="md:col-span-2">
            <FormSelect
              name="is_pep_relative"
              label="¿El declarante es pariente de PEP?"
              placeholder="Seleccione..."
              options={IS_PEP_RELATIVE_OPTIONS}
              control={form.control}
              required
            />
          </div>

          {isPepRelative === "SI_SOY" &&
            pepRelativeDataFields.map((field, index) => (
              <div
                key={field.id}
                className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/30"
              >
                <FormInput
                  control={form.control}
                  name={`pep_relative_data.${index}.pep_full_name`}
                  label="Nombre del PEP"
                  placeholder="Nombre completo"
                  required
                />
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <FormInput
                      control={form.control}
                      name={`pep_relative_data.${index}.relationship`}
                      label="Parentesco"
                      placeholder="Ej: Cónyuge, Padre"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => removePepRelative(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
        </GroupFormSection>

        {/* Beneficiario */}
        <GroupFormSection
          title="Beneficiario de la Operación"
          icon={Banknote}
          color="green"
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

          {/* PROPIO */}
          {beneficiaryType === "PROPIO" && (
            <div className="md:col-span-2 xl:col-span-2">
              <FormTextArea
                control={form.control}
                name="own_funds_origin"
                label="Origen de Fondos Propios"
                placeholder="Ej: Ingresos por actividad dependiente"
                rows={2}
                required
              />
            </div>
          )}

          {/* TERCERO NATURAL */}
          {showThirdBlock && (
            <>
              <FormInput
                control={form.control}
                name="third_full_name"
                label="Nombre del Tercero"
                placeholder="Nombre completo"
                required
              />
              <FormInput
                control={form.control}
                name="third_doc_type"
                label="Tipo de Documento"
                placeholder="Ej: DNI"
                optional
              />
              <FormInput
                control={form.control}
                name="third_doc_number"
                label="Número de Documento"
                placeholder="Ej: 12345678"
                optional
              />
              <FormSelect
                name="third_representation_type"
                label="Tipo de Representación"
                placeholder="Seleccione..."
                options={THIRD_REPRESENTATION_TYPE_OPTIONS}
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
              />
              <FormInput
                control={form.control}
                name="third_pep_institution"
                label="Institución PEP del Tercero"
                placeholder="Si aplica"
                optional
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

          {/* PERSONA JURÍDICA / ENTE JURÍDICO */}
          {showEntityBlock && (
            <>
              <FormInput
                control={form.control}
                name="entity_name"
                label="Nombre / Razón Social"
                placeholder="Nombre de la entidad"
                required
              />
              <FormInput
                control={form.control}
                name="entity_ruc"
                label="RUC"
                placeholder="Ej: 20123456789"
                optional
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
              />
              <div className="md:col-span-2 xl:col-span-3">
                <FormTextArea
                  control={form.control}
                  name="entity_funds_origin"
                  label="Origen de Fondos de la Entidad"
                  placeholder="Describa el origen de los fondos de la entidad"
                  rows={2}
                  required
                />
              </div>
            </>
          )}
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
