"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { WORKING_CONDITION } from "../lib/working-condition.constant";
import {
  WorkingConditionSchema,
  workingConditionSchema,
} from "../lib/working-condition.schema";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FileForm } from "@/shared/components/FileForm";
import { usePayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";

interface WorkingConditionFormProps {
  onSubmit: (data: WorkingConditionSchema, file: File) => void;
  isSubmitting?: boolean;
}

export const WorkingConditionForm = ({
  onSubmit,
  isSubmitting = false,
}: WorkingConditionFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = WORKING_CONDITION;
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<WorkingConditionSchema>({
    resolver: zodResolver(workingConditionSchema) as any,
    defaultValues: {
      period_id: undefined,
    },
    mode: "onChange",
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
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
              label="Archivo Excel"
              accept=".xlsx,.xls"
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
