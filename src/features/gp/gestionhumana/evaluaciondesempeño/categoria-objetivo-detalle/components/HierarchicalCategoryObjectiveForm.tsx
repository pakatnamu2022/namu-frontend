"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  HierarchicalCategoryObjectiveSchema,
  hierarchicalCategoryObjectiveSchemaCreate,
} from "../lib/hierarchicalCategoryObjective.schema";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { Form } from "@/components/ui/form";
import { CATEGORY_OBJECTIVE } from "../lib/hierarchicalCategoryObjective.constants";
import { ObjectiveResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.interface";

interface Props {
  defaultValues: Partial<HierarchicalCategoryObjectiveSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  objectives: ObjectiveResource[];
  onCancel?: () => void;
  portalContainer?: HTMLElement | null; // SOLO SI ES UN FORM SELECT DENTRO DE UN DIALOG
}

export const HierarchicalCategoryObjectiveForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  objectives,
  onCancel,
  portalContainer,
}: Props) => {
  const { MODEL } = CATEGORY_OBJECTIVE;

  const form = useForm({
    resolver: zodResolver(hierarchicalCategoryObjectiveSchemaCreate),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            control={form.control}
            name="objective_id"
            label="Objetivo"
            placeholder="Selecciona un objetivo"
            options={objectives.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            portalContainer={portalContainer} // SE LE PASA AL SELECT FORM
          />
        </div>

        {/* <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
          </code>
        </pre> */}

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

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
