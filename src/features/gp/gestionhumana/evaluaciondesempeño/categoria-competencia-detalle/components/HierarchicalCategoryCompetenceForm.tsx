"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  HierarchicalCategoryCompetenceSchema,
  hierarchicalCategoryCompetenceSchemaCreate,
} from "../lib/hierarchicalCategoryCompetence.schema";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { Form } from "@/components/ui/form";
import { CATEGORY_COMPETENCE } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.constants";
import { CompetenceResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.interface";

interface Props {
  defaultValues: Partial<HierarchicalCategoryCompetenceSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  competences: CompetenceResource[];
  onCancel?: () => void;
  portalContainer?: HTMLElement | null; // SOLO SI ES UN FORM SELECT DENTRO DE UN DIALOG
}

export const HierarchicalCategoryCompetenceForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  competences,
  onCancel,
  portalContainer,
}: Props) => {
  const { MODEL } = CATEGORY_COMPETENCE;

  const form = useForm({
    resolver: zodResolver(hierarchicalCategoryCompetenceSchemaCreate),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full formlayout">
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            control={form.control}
            name="objective_id"
            label="Objetivo"
            placeholder="Selecciona una competencia"
            options={competences.map((p) => ({
              value: p.id.toString(),
              label: p.nombre,
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
