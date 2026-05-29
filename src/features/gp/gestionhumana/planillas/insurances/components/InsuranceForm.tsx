"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { InsuranceSchema, insuranceSchema } from "../lib/insurance.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { INSURANCE } from "../lib/insurance.constant";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { usePayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { useSuppliers } from "@/features/ap/comercial/proveedores/lib/suppliers.hook";
import { Option } from "@/core/core.interface";

const GENDER_OPTIONS: Option[] = [
  { label: "Masculino", value: "M" },
  { label: "Femenino", value: "F" },
];

const DOC_TYPE_OPTIONS: Option[] = [
  { label: "DNI", value: "DNI" },
  { label: "Carnet de Extranjería", value: "CE" },
  { label: "Pasaporte", value: "PASAPORTE" },
];

const PAYMENT_FREQUENCY_OPTIONS: Option[] = [
  { label: "Mensual", value: "MENSUAL" },
  { label: "Bimestral", value: "BIMESTRAL" },
  { label: "Trimestral", value: "TRIMESTRAL" },
  { label: "Semestral", value: "SEMESTRAL" },
  { label: "Anual", value: "ANUAL" },
];

interface InsuranceFormProps {
  defaultValues: Partial<InsuranceSchema>;
  onSubmit: (data: InsuranceSchema) => void;
  isSubmitting?: boolean;
}

export const InsuranceForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: InsuranceFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = INSURANCE;

  const form = useForm<InsuranceSchema>({
    resolver: zodResolver(insuranceSchema) as any,
    defaultValues: {
      worker_id: defaultValues.worker_id ?? undefined,
      period_id: defaultValues.period_id ?? undefined,
      business_partner_id: defaultValues.business_partner_id ?? undefined,
      family_group_number: defaultValues.family_group_number ?? "",
      relationship: defaultValues.relationship ?? "",
      doc_type_affiliate: defaultValues.doc_type_affiliate ?? "",
      doc_number_affiliate: defaultValues.doc_number_affiliate ?? "",
      gender: defaultValues.gender ?? "",
      paternal_surname: defaultValues.paternal_surname ?? "",
      maternal_surname: defaultValues.maternal_surname ?? "",
      first_name: defaultValues.first_name ?? "",
      second_name: defaultValues.second_name ?? "",
      entry_date: defaultValues.entry_date ?? "",
      birth_date: defaultValues.birth_date ?? "",
      condition: defaultValues.condition ?? "",
      program: defaultValues.program ?? "",
      plan: defaultValues.plan ?? "",
      payment_frequency: defaultValues.payment_frequency ?? "",
      type: defaultValues.type ?? "",
      rate_without_tax: defaultValues.rate_without_tax ?? 0,
      tax: defaultValues.tax ?? 0,
      rate_with_tax: defaultValues.rate_with_tax ?? 0,
      period_from: defaultValues.period_from ?? "",
      period_until: defaultValues.period_until ?? "",
      affiliation_continuity_date:
        defaultValues.affiliation_continuity_date ?? "",
      affiliation_from: defaultValues.affiliation_from ?? "",
      affiliation_until: defaultValues.affiliation_until ?? "",
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormSelectAsync
            name="worker_id"
            label="Trabajador"
            placeholder="Seleccione trabajador"
            control={form.control}
            required
            useQueryHook={useWorkers}
            mapOptionFn={(item) => ({
              label: item.name,
              value: String(item.id),
            })}
          />

          <FormSelectAsync
            name="period_id"
            label="Periodo"
            placeholder="Seleccione periodo"
            control={form.control}
            required
            useQueryHook={usePayrollPeriods}
            mapOptionFn={(item) => ({
              label: item.name + " - " + item.company.name,
              value: String(item.id),
            })}
          />

          <FormSelectAsync
            name="business_partner_id"
            label="Socio de Negocio"
            placeholder="Seleccione socio de negocio"
            control={form.control}
            required
            useQueryHook={useSuppliers}
            mapOptionFn={(item) => ({
              label: item.full_name,
              value: String(item.id),
            })}
          />

          <FormInput
            name="family_group_number"
            label="N° Grupo Familiar"
            placeholder="Ej: 001"
            control={form.control}
            required
          />

          <FormInput
            name="relationship"
            label="Parentesco"
            placeholder="Ej: Titular, Cónyuge, Hijo"
            control={form.control}
            required
          />

          <FormSelect
            name="doc_type_affiliate"
            label="Tipo de Documento"
            placeholder="Seleccione tipo"
            options={DOC_TYPE_OPTIONS}
            control={form.control}
            required
          />

          <FormInput
            name="doc_number_affiliate"
            label="N° de Documento"
            placeholder="Ej: 12345678"
            control={form.control}
            required
          />

          <FormSelect
            name="gender"
            label="Género"
            placeholder="Seleccione género"
            options={GENDER_OPTIONS}
            control={form.control}
            required
          />

          <FormInput
            name="paternal_surname"
            label="Apellido Paterno"
            placeholder="Apellido paterno"
            control={form.control}
            required
          />

          <FormInput
            name="maternal_surname"
            label="Apellido Materno"
            placeholder="Apellido materno"
            control={form.control}
            required
          />

          <FormInput
            name="first_name"
            label="Primer Nombre"
            placeholder="Primer nombre"
            control={form.control}
            required
          />

          <FormInput
            name="second_name"
            label="Segundo Nombre"
            placeholder="Segundo nombre (opcional)"
            control={form.control}
          />

          <DatePickerFormField
            name="entry_date"
            label="Fecha de Ingreso"
            control={form.control}
          />

          <DatePickerFormField
            name="birth_date"
            label="Fecha de Nacimiento"
            control={form.control}
          />

          <FormInput
            name="condition"
            label="Condición"
            placeholder="Ej: Regular"
            control={form.control}
            required
          />

          <FormInput
            name="program"
            label="Programa"
            placeholder="Ej: EPS"
            control={form.control}
            required
          />

          <FormInput
            name="plan"
            label="Plan"
            placeholder="Ej: Plan Básico"
            control={form.control}
            required
          />

          <FormSelect
            name="payment_frequency"
            label="Frecuencia de Pago"
            placeholder="Seleccione frecuencia"
            options={PAYMENT_FREQUENCY_OPTIONS}
            control={form.control}
            required
          />

          <FormInput
            name="type"
            label="Tipo"
            placeholder="Ej: EPS"
            control={form.control}
            required
          />

          <FormInput
            name="rate_without_tax"
            label="Tasa sin IGV"
            type="number"
            min={0}
            step="0.01"
            placeholder="Ej: 100.00"
            control={form.control}
            required
          />

          <FormInput
            name="tax"
            label="IGV"
            type="number"
            min={0}
            step="0.01"
            placeholder="Ej: 18.00"
            control={form.control}
            required
          />

          <FormInput
            name="rate_with_tax"
            label="Tasa con IGV"
            type="number"
            min={0}
            step="0.01"
            placeholder="Ej: 118.00"
            control={form.control}
            required
          />

          <DatePickerFormField
            name="period_from"
            label="Periodo Desde"
            control={form.control}
          />

          <DatePickerFormField
            name="period_until"
            label="Periodo Hasta"
            control={form.control}
          />

          <DatePickerFormField
            name="affiliation_continuity_date"
            label="Fecha Continuidad Afiliación"
            control={form.control}
          />

          <DatePickerFormField
            name="affiliation_from"
            label="Afiliación Desde"
            control={form.control}
          />

          <DatePickerFormField
            name="affiliation_until"
            label="Afiliación Hasta"
            control={form.control}
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
            {isSubmitting ? "Guardando" : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
