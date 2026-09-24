"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSelect } from "@/shared/components/FormSelect";
import { DateRangePickerFormField } from "@/shared/components/DateRangePickerFormField";
import { scrumItemSchema, ScrumItemSchema } from "../lib/scrumItem.schema";
import { ScrumProjectResource } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.interface";
import { ScrumSprintResource } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.interface";
import { useEffect, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { addDays, differenceInCalendarDays } from "date-fns";
import { getTodayLocalDateString, toDateOrUndefined, toLocalDateString } from "@/core/core.function";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const [startDate, dueDate] = useWatch({
    control: form.control,
    name: ["start_date", "due_date"],
  });

  const dayCount = useMemo(() => {
    const from = toDateOrUndefined(startDate);
    const to = toDateOrUndefined(dueDate);
    if (!from || !to) return null;
    const diff = differenceInCalendarDays(to, from) + 1;
    return diff > 0 ? diff : null;
  }, [startDate, dueDate]);

  // Auto-calcula horas estimadas (8h por día) cada vez que cambia el rango
  // de fechas o la cantidad de días. El usuario puede ajustarlas a mano
  // después, pero un nuevo cambio de fechas las vuelve a recalcular.
  useEffect(() => {
    if (dayCount === null) return;
    form.setValue("estimated_hours", String(dayCount * 8), {
      shouldValidate: true,
      shouldDirty: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayCount]);

  const handleDaysChange = (value: string) => {
    const days = Number(value);
    if (!value || Number.isNaN(days) || days < 1) return;
    const from = toDateOrUndefined(startDate) ?? new Date();
    if (!startDate) {
      form.setValue("start_date", toLocalDateString(from), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    form.setValue("due_date", toLocalDateString(addDays(from, days - 1)), {
      shouldValidate: true,
      shouldDirty: true,
    });
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
              <DateRangePickerFormField
                control={form.control}
                nameFrom="start_date"
                nameTo="due_date"
                label="Fecha de inicio y fin"
                placeholder="Selecciona el rango de fechas"
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
                value={dayCount ?? ""}
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
