"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { BONUS } from "../lib/bonus.constant";
import {
  BonusImportSchema,
  bonusImportSchema,
} from "../lib/bonus.schema";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormSelect } from "@/shared/components/FormSelect";
import { FileForm } from "@/shared/components/FileForm";
import {
  useCurrentPayrollPeriod,
  usePayrollPeriods,
} from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { useGpMasters } from "@/features/gp/gp-master/lib/gpMaster.hook";
import { GP_MASTER_TYPE } from "@/features/gp/gp-master/lib/gpMaster.constants";
import { Option } from "@/core/core.interface";

interface BonusImportFormProps {
  companyId: string;
  companyName?: string;
  onSubmit: (data: BonusImportSchema, file: File) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const BonusImportForm = ({
  companyId,
  companyName,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: BonusImportFormProps) => {
  const { MODEL } = BONUS;
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<BonusImportSchema>({
    resolver: zodResolver(bonusImportSchema) as any,
    defaultValues: {
      period_id: undefined,
      type_id: undefined,
    },
    mode: "onChange",
  });

  const { data: currentPeriod } = useCurrentPayrollPeriod();

  useEffect(() => {
    if (
      currentPeriod &&
      companyId &&
      String(currentPeriod.company?.id) === companyId
    ) {
      form.setValue("period_id", String(currentPeriod.id), {
        shouldValidate: true,
      });
    }
  }, [currentPeriod, companyId, form]);

  const { data: gpMastersData } = useGpMasters({
    params: { type: GP_MASTER_TYPE.PAYROLL_BUNESES },
  });

  const typeOptions: Option[] = (gpMastersData?.data ?? []).map((item) => ({
    label: item.description,
    value: String(item.id),
  }));

  const handleSubmit = (data: BonusImportSchema) => {
    if (!file) return;
    onSubmit(data, file);
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

        <FormSelect
          name="type_id"
          label="Tipo de bono"
          placeholder="Seleccione tipo"
          options={typeOptions}
          control={form.control}
          required
        />

        <FormField
          control={form.control}
          name="type_id"
          render={() => (
            <FileForm
              label="Archivo Excel"
              accept=".xlsx,.xls"
              multiple={false}
              value={file}
              onChange={(f) => setFile(f as File | null)}
            />
          )}
        />

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

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
