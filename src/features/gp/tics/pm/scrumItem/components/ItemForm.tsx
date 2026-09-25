"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { scrumItemSchema, ScrumItemSchema } from "../lib/scrumItem.schema";
import { ScrumProjectResource } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.interface";
import { ScrumSprintResource } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.interface";
import { useEffect, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { getTodayLocalDateString, toDateOrUndefined, toLocalDateString } from "@/core/core.function";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addWorkingDays,
  countWorkingDays,
  sumWorkingHours,
  SUNDAY_DISABLED_MATCHER,
} from "../lib/workingHours";

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

// Escala Fibonacci estándar de Scrum: los saltos crecientes (5→8→13) evitan
// la falsa precisión de estimar "6 vs 7", y mantiene comparables los story
// points que ya ponderan el Gantt y la curva de esfuerzo.
const STORY_POINTS_OPTIONS = [1, 2, 3, 5, 8, 13, 21].map((n) => ({
  label: String(n),
  value: String(n),
}));

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
    resolver: zodResolver(scrumItemSchema) as any,
    defaultValues: {
      project_id: "",
      sprint_id: "",
      type: "tarea",
      title: "",
      description: "",
      status: "backlog",
      priority: "media",
      story_points: "1",
      estimated_hours: "",
      start_date: getTodayLocalDateString(),
      due_date: getTodayLocalDateString(),
      assigned_to: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const startDate = useWatch({ control: form.control, name: "start_date" });

  // La fecha fin ya NO se edita a mano: la base siempre es la fecha de
  // inicio, y "Días" (laborables, domingo no cuenta) es lo único que el
  // usuario ajusta. `days` arranca calculado del due_date que venga en
  // defaultValues (edición) para no perder lo ya guardado.
  const [days, setDays] = useState<number | "">(() => {
    const from = toDateOrUndefined(defaultValues?.start_date);
    const to = toDateOrUndefined(defaultValues?.due_date);
    if (!from || !to) return 1;
    const count = countWorkingDays(from, to);
    return count > 0 ? count : 1;
  });

  // Recalcula due_date (y las horas estimadas) cada vez que cambia la fecha
  // de inicio o los días: due_date deja de ser un campo que el usuario toca,
  // es siempre start_date + días laborables.
  useEffect(() => {
    const from = toDateOrUndefined(startDate);
    if (!from || !days || days < 1) return;
    const to = addWorkingDays(from, days);
    form.setValue("due_date", toLocalDateString(to), {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("estimated_hours", String(sumWorkingHours(from, to)), {
      shouldValidate: true,
      shouldDirty: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, days]);

  const handleDaysChange = (value: string) => {
    const n = Number(value);
    setDays(!value || Number.isNaN(n) || n < 1 ? "" : n);
  };

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

          <FormSelect
            control={form.control}
            name="story_points"
            label="Story points"
            placeholder="Selecciona la estimación"
            options={STORY_POINTS_OPTIONS}
          />

          <FormInput
            control={form.control}
            name="estimated_hours"
            label="Horas estimadas"
            placeholder="Ej: 8"
            type="number"
          />

          <div className="md:col-span-2 flex items-end gap-4">
            <div className="flex-1">
              <DatePickerFormField
                control={form.control}
                name="start_date"
                label="Fecha de inicio"
                placeholder="Selecciona la fecha de inicio"
                disabledRange={SUNDAY_DISABLED_MATCHER}
              />
            </div>
            <div className="w-24">
              <Label className="text-xs md:text-sm mb-1 block text-muted-foreground font-medium">
                Días
              </Label>
              <Input
                type="number"
                min={1}
                className="h-7 md:h-8 text-xs md:text-sm"
                value={days}
                onChange={(e) => handleDaysChange(e.target.value)}
              />
            </div>
          </div>
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
