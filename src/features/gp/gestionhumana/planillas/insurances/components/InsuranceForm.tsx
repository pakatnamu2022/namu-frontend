"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { INSURANCE } from "../lib/insurance.constant";
import { InsuranceSchema, insuranceSchema } from "../lib/insurance.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FileForm } from "@/shared/components/FileForm";
import { usePayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { Option } from "@/core/core.interface";
import { downloadInsuranceTemplate } from "../lib/insurance.actions";
import { errorToast } from "@/core/core.function";

const INSURER_OPTIONS: Option[] = [
  { label: "FESALUD SA", value: "13297" },
  { label: "ONCOSALUD S.A.C.", value: "13298" },
];

interface InsuranceFormProps {
  onSubmit: (data: InsuranceSchema, file: File) => void;
  isSubmitting?: boolean;
  companyId?: string;
  companyName?: string;
}

export const InsuranceForm = ({
  onSubmit,
  isSubmitting = false,
  companyId,
  companyName,
}: InsuranceFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = INSURANCE;
  const [file, setFile] = useState<File | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const form = useForm<InsuranceSchema>({
    resolver: zodResolver(insuranceSchema) as any,
    defaultValues: {
      business_partner_id: undefined,
      period_id: undefined,
    },
    mode: "onChange",
  });

  const businessPartnerId = form.watch("business_partner_id");

  const handleSubmit = (data: InsuranceSchema) => {
    if (!file) return;
    onSubmit(data, file);
  };

  const handleDownloadTemplate = async () => {
    if (!businessPartnerId) return;
    setIsDownloading(true);
    try {
      await downloadInsuranceTemplate(businessPartnerId);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al descargar la plantilla",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full"
      >
        {companyName && (
          <p className="text-sm text-muted-foreground">
            Empresa:{" "}
            <span className="font-medium text-foreground">{companyName}</span>
          </p>
        )}

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
            additionalParams={companyId ? { company_id: companyId } : {}}
            mapOptionFn={(item) => ({
              label: item.name,
              value: String(item.id),
            })}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!businessPartnerId || isDownloading}
            onClick={handleDownloadTemplate}
          >
            <Download className="size-4" />
            {isDownloading ? "Descargando..." : "Descargar plantilla"}
          </Button>
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
