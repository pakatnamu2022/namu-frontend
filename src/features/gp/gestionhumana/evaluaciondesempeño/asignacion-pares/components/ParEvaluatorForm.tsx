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
import { MultiSelectTags } from "@/shared/components/MultiSelectTags";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";
import { ParEvaluatorResource } from "../lib/par-evaluator.interface";

interface PeriodFormProps {
  persons: WorkerResource[];
  existingEvaluators?: ParEvaluatorResource[];
  defaultValues: Partial<ParEvaluatorSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  showCancelButton?: boolean;
}

export const ParEvaluatorForm = ({
  persons,
  existingEvaluators = [],
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  showCancelButton = true,
}: PeriodFormProps) => {
  const { ABSOLUTE_ROUTE } = PAR_EVALUATOR;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? parEvaluatorSchemaCreate : parEvaluatorSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      mate_ids: defaultValues.mate_ids || [],
    },
    mode: "onChange",
  });

  // Filtrar personas que ya están asignadas como evaluadores
  const existingMateIds = existingEvaluators.map((e) => e.mate_id);
  const availablePersons = persons.filter(
    (p) => !existingMateIds.includes(p.id)
  );

  console.log(form.formState.errors);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 gap-4">
          {/* Mostrar evaluadores existentes */}
          {existingEvaluators.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Evaluadores Actuales:</p>
              <div className="flex flex-wrap gap-2">
                {existingEvaluators.map((evaluator) => (
                  <div
                    key={evaluator.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
                  >
                    {evaluator.mate.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MultiSelectTags para nuevos evaluadores */}
          <MultiSelectTags
            control={form.control}
            name="mate_ids"
            label="Agregar Evaluadores Par"
            placeholder="Selecciona evaluadores par"
            searchPlaceholder="Buscar evaluador..."
            emptyMessage="No se encontraron evaluadores disponibles."
            options={availablePersons}
            getDisplayValue={(person) => person.name}
            getSecondaryText={(person) => person.document || person.position}
            required={true}
          />
        </div>

        <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
          </code>
        </pre>

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
            {isSubmitting ? "Guardando" : `Guardar`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
