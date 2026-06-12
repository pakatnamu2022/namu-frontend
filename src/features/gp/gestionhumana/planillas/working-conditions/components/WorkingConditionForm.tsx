"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { WORKING_CONDITION } from "../lib/working-condition.constant";
import {
  WorkingConditionSchema,
  workingConditionSchema,
} from "../lib/working-condition.schema";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FileForm } from "@/shared/components/FileForm";
import {
  useCurrentPayrollPeriod,
  usePayrollPeriods,
} from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";

interface WorkingConditionFormProps {
  companyId: string;
  onSubmit: (data: WorkingConditionSchema, file: File) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const WorkingConditionForm = ({
  companyId,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: WorkingConditionFormProps) => {
  const { MODEL } = WORKING_CONDITION;
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<WorkingConditionSchema>({
    resolver: zodResolver(workingConditionSchema) as any,
    defaultValues: {
      period_id: undefined,
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

  const handleSubmit = (data: WorkingConditionSchema) => {
    if (!file) return;
    onSubmit(data, file);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full"
      >
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

        <FormField
          control={form.control}
          name="period_id"
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
