"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { INSURANCE } from "../lib/insurance.constant";
import {
  InsuranceManualSchema,
  insuranceManualSchema,
} from "../lib/insurance.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormInput } from "@/shared/components/FormInput";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { usePayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import { Option } from "@/core/core.interface";

const INSURER_OPTIONS: Option[] = [
  { label: "FESALUD SA", value: "13297" },
  { label: "ONCOSALUD S.A.C.", value: "13298" },
];

interface InsuranceManualFormProps {
  defaultValues: Partial<InsuranceManualSchema>;
  onSubmit: (data: InsuranceManualSchema) => void;
  isSubmitting?: boolean;
  companyId?: string;
  mode?: "create" | "update";
  // Etiquetas del registro que se está editando, para que el combobox async
  // muestre el valor seleccionado de inmediato (el ID puede no estar en la
  // primera página del listado, así que sin esto se ve vacío al editar).
  defaultWorkerLabel?: string | null;
  defaultPeriodLabel?: string | null;
}

export const InsuranceManualForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  companyId,
  mode = "create",
  defaultWorkerLabel,
  defaultPeriodLabel,
}: InsuranceManualFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = INSURANCE;

  const { data: companies } = useAllCompanies();
  const companyOptions: Option[] = (companies ?? []).map((c) => ({
    label: c.name,
    value: String(c.id),
  }));

  const workerDefaultOption: Option | undefined =
    defaultValues.worker_id && defaultWorkerLabel
      ? { label: defaultWorkerLabel, value: defaultValues.worker_id }
      : undefined;

  const periodDefaultOption: Option | undefined =
    defaultValues.period_id && defaultPeriodLabel
      ? { label: defaultPeriodLabel, value: defaultValues.period_id }
      : undefined;

  const form = useForm<InsuranceManualSchema>({
    resolver: zodResolver(insuranceManualSchema) as any,
    defaultValues: {
      company_id: defaultValues.company_id ?? companyId ?? undefined,
      worker_id: defaultValues.worker_id ?? undefined,
      period_id: defaultValues.period_id ?? undefined,
      business_partner_id: defaultValues.business_partner_id ?? undefined,
      doc_number_affiliate: defaultValues.doc_number_affiliate ?? "",
      contracting_name: defaultValues.contracting_name ?? "",
      num_doc_contracting: defaultValues.num_doc_contracting ?? "",
      rate_with_tax: defaultValues.rate_with_tax ?? "",
    },
    mode: "onChange",
  });

  const selectedCompanyId = form.watch("company_id");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormSelect
            name="company_id"
            label="Empresa"
            placeholder="Seleccione empresa"
            options={companyOptions}
            control={form.control}
            required
            onValueChange={() => form.setValue("period_id", "")}
          />

          <FormSelectAsync
            name="worker_id"
            label="Trabajador"
            placeholder="Seleccione trabajador"
            control={form.control}
            required
            useQueryHook={useWorkers}
            defaultOption={workerDefaultOption}
            mapOptionFn={(item) => ({
              label: item.name,
              value: String(item.id),
            })}
          />

          <FormSelectAsync
            key={selectedCompanyId}
            name="period_id"
            label="Periodo"
            placeholder="Seleccione periodo"
            control={form.control}
            required
            disabled={!selectedCompanyId}
            useQueryHook={usePayrollPeriods}
            additionalParams={
              selectedCompanyId ? { company_id: selectedCompanyId } : {}
            }
            defaultOption={periodDefaultOption}
            mapOptionFn={(item) => ({
              label: item.name,
              value: String(item.id),
            })}
          />

          <FormSelect
            name="business_partner_id"
            label="Aseguradora"
            placeholder="Seleccione aseguradora"
            options={INSURER_OPTIONS}
            control={form.control}
            required
          />

          <FormInput
            name="doc_number_affiliate"
            label="N° Doc. Afiliado"
            placeholder="Ej: 12345678"
            control={form.control}
          />

          <FormInput
            name="contracting_name"
            label="Contratante"
            placeholder="Ej: PEREZ GOMEZ JUAN CARLOS"
            control={form.control}
          />

          <FormInput
            name="num_doc_contracting"
            label="N° Doc. Contratante"
            placeholder="Ej: 12345678"
            control={form.control}
          />

          <FormInput
            name="rate_with_tax"
            label="Tasa con IGV"
            placeholder="Ej: 150.00"
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
            {isSubmitting
              ? "Guardando..."
              : mode === "update"
                ? `Actualizar ${MODEL.name}`
                : `Registrar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
