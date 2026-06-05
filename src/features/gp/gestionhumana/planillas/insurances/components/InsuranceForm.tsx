"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { INSURANCE } from "../lib/insurance.constant";
import { InsuranceSchema, insuranceSchema } from "../lib/insurance.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FileForm } from "@/shared/components/FileForm";
import { usePayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { Option } from "@/core/core.interface";

const INSURER_OPTIONS: Option[] = [
  { label: "FESALUD SA", value: "13297" },
  { label: "ONCOSALUD S.A.C.", value: "13298" },
];

interface InsuranceFormProps {
  onSubmit: (data: InsuranceSchema, file: File) => void;
  isSubmitting?: boolean;
}

export const InsuranceForm = ({
  onSubmit,
  isSubmitting = false,
}: InsuranceFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = INSURANCE;
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<InsuranceSchema>({
    resolver: zodResolver(insuranceSchema) as any,
    defaultValues: {
      business_partner_id: undefined,
      period_id: undefined,
    },
    mode: "onChange",
  });

  const handleSubmit = (data: InsuranceSchema) => {
    if (!file) return;
    onSubmit(data, file);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormSelect
            name="business_partner_id"
            label="Aseguradora"
            placeholder="Seleccione aseguradora"
            options={INSURER_OPTIONS}
            control={form.control}
            required
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
        </div>

        <FormField
          control={form.control}
          name="period_id"
          render={() => (
            <FileForm
              label="Archivo"
              accept=".xlsx,.xls,.csv"
              multiple={false}
              value={file}
              onChange={(f) => setFile(f as File | null)}
            />
          )}
        />

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid || !file}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Importando..." : `Importar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
