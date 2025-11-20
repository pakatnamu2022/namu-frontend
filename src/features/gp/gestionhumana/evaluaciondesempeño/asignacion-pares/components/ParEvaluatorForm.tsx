"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  ParEvaluatorSchema,
  parEvaluatorSchemaCreate,
  parEvaluatorSchemaUpdate,
} from "../lib/par-evaluator.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { PAR_EVALUATOR } from "../lib/par-evaluator.constant";
import { FormSelect } from "@/shared/components/FormSelect";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";

interface PeriodFormProps {
  persons: WorkerResource[];
  defaultValues: Partial<ParEvaluatorSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  showCancelButton?: boolean;
}

export const ParEvaluatorForm = ({
  persons,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  showCancelButton = true,
}: PeriodFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = PAR_EVALUATOR;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? parEvaluatorSchemaCreate : parEvaluatorSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            control={form.control}
            name="mate_id"
            label="Evaluador Par"
            placeholder="Selecciona un evaluador par"
            options={persons.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            strictFilter={true}
          />
        </div>

        {/* <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
          </code>
        </pre> */}

        <div className="flex gap-4 w-full justify-end">
          {showCancelButton && (
            <Link to={ABSOLUTE_ROUTE}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : `Guardar ${MODEL}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
