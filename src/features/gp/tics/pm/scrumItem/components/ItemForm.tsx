"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSelect } from "@/shared/components/FormSelect";
import { scrumItemSchema, ScrumItemSchema } from "../lib/scrumItem.schema";
import { ScrumProjectResource } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.interface";
import { ScrumSprintResource } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.interface";
import { useMemo } from "react";

const TYPE_OPTIONS = [
  { label: "Tarea", value: "tarea" },
  { label: "Historia", value: "historia" },
  { label: "Función", value: "funcion" },
  { label: "Solicitud", value: "solicitud" },
  { label: "Error", value: "error" },
];

const STATUS_OPTIONS = [
  { label: "Backlog", value: "backlog" },
  { label: "Por hacer", value: "por_hacer" },
  { label: "En progreso", value: "en_progreso" },
  { label: "En revisión", value: "en_revision" },
  { label: "Hecho", value: "hecho" },
];

const PRIORITY_OPTIONS = [
  { label: "Alta", value: "alta" },
  { label: "Media", value: "media" },
  { label: "Baja", value: "baja" },
];

interface Props {
  defaultValues?: Partial<ScrumItemSchema>;
  onSubmit: (data: ScrumItemSchema) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  projects?: ScrumProjectResource[];
  sprints?: ScrumSprintResource[];
}

export const ItemForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  projects = [],
  sprints = [],
}: Props) => {
  const projectOptions = useMemo(
    () => projects.map((p) => ({ label: p.name, value: p.id.toString() })),
    [projects],
  );

  const sprintOptions = useMemo(
    () => [
      { label: "Sin sprint (Backlog)", value: "" },
      ...sprints.map((s) => ({ label: s.name, value: s.id.toString() })),
    ],
    [sprints],
  );

  const form = useForm<ScrumItemSchema>({
    resolver: zodResolver(scrumItemSchema),
    defaultValues: {
      project_id: "",
      sprint_id: "",
      type: "tarea",
      title: "",
      description: "",
      status: "backlog",
      priority: "media",
      story_points: "",
      estimated_hours: "",
      due_date: "",
      assigned_to: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="title"
            label="Título"
            placeholder="Ej: Implementar login con JWT"
          />

          <FormSelect
            control={form.control}
            name="project_id"
            label="Proyecto"
            placeholder="Selecciona un proyecto"
            options={projectOptions}
          />

          <FormSelect
            control={form.control}
            name="sprint_id"
            label="Sprint"
            placeholder="Selecciona un sprint (opcional)"
            options={sprintOptions}
          />

          <FormSelect
            control={form.control}
            name="type"
            label="Tipo"
            placeholder="Tipo de item"
            options={TYPE_OPTIONS}
          />

          <FormSelect
            control={form.control}
            name="status"
            label="Estado"
            placeholder="Estado"
            options={STATUS_OPTIONS}
          />

          <FormSelect
            control={form.control}
            name="priority"
            label="Prioridad"
            placeholder="Prioridad"
            options={PRIORITY_OPTIONS}
          />

          <FormInput
            control={form.control}
            name="story_points"
            label="Story points"
            placeholder="Ej: 5"
            type="number"
          />

          <FormInput
            control={form.control}
            name="estimated_hours"
            label="Horas estimadas"
            placeholder="Ej: 8"
            type="number"
          />

          <FormInput
            control={form.control}
            name="due_date"
            label="Fecha límite"
            type="date"
          />
        </div>

        <FormTextArea
          control={form.control}
          name="description"
          label="Descripción"
          placeholder="Detalla los criterios de aceptación, contexto, etc."
        />

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? "Guardando..." : "Guardar item"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
