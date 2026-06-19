"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSelect } from "@/shared/components/FormSelect";
import { Link } from "react-router-dom";
import { SCRUM_SPRINT } from "../lib/scrumSprint.constants";
import { scrumSprintSchema, ScrumSprintSchema } from "../lib/scrumSprint.schema";
import { ScrumProjectResource } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.interface";
import { useMemo } from "react";

interface Props {
  defaultValues: Partial<ScrumSprintSchema>;
  onSubmit: (data: ScrumSprintSchema) => void;
  isSubmitting?: boolean;
  projects?: ScrumProjectResource[];
}

const STATUS_OPTIONS = [
  { label: "Planeado", value: "planeado" },
  { label: "Activo", value: "activo" },
  { label: "Cerrado", value: "cerrado" },
];

export const ScrumSprintForm = ({ defaultValues, onSubmit, isSubmitting = false, projects = [] }: Props) => {
  const { ABSOLUTE_ROUTE } = SCRUM_SPRINT;

  const projectOptions = useMemo(
    () => projects.map((p) => ({ label: p.name, value: p.id.toString() })),
    [projects],
  );

  const form = useForm<ScrumSprintSchema>({
    resolver: zodResolver(scrumSprintSchema) as any,
    defaultValues: {
      project_id: "",
      name: "",
      goal: "",
      start_date: "",
      end_date: "",
      status: "planeado",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            control={form.control}
            name="project_id"
            label="Proyecto"
            placeholder="Selecciona un proyecto"
            options={projectOptions}
          />

          <FormInput
            control={form.control}
            name="name"
            label="Nombre del sprint"
            placeholder="Ej: Sprint 1 – Autenticación"
          />

          <FormInput
            control={form.control}
            name="start_date"
            label="Fecha de inicio"
            type="date"
          />

          <FormInput
            control={form.control}
            name="end_date"
            label="Fecha de fin"
            type="date"
          />

          <FormSelect
            control={form.control}
            name="status"
            label="Estado"
            placeholder="Selecciona el estado"
            options={STATUS_OPTIONS}
          />
        </div>

        <FormTextArea
          control={form.control}
          name="goal"
          label="Objetivo del sprint"
          placeholder="¿Qué se espera lograr al finalizar este sprint?"
        />

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? "Guardando..." : "Guardar sprint"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
