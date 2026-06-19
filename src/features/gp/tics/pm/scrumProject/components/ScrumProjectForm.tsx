"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSelect } from "@/shared/components/FormSelect";
import { Link } from "react-router-dom";
import { SCRUM_PROJECT } from "../lib/scrumProject.constants";
import { scrumProjectSchema, ScrumProjectSchema } from "../lib/scrumProject.schema";

interface Props {
  defaultValues: Partial<ScrumProjectSchema>;
  onSubmit: (data: ScrumProjectSchema) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { label: "Activo", value: "activo" },
  { label: "Archivado", value: "archivado" },
];

export const ScrumProjectForm = ({ defaultValues, onSubmit, isSubmitting = false }: Props) => {
  const { ABSOLUTE_ROUTE } = SCRUM_PROJECT;

  const form = useForm<ScrumProjectSchema>({
    resolver: zodResolver(scrumProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      status: "activo",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const color = form.watch("color");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="name"
            label="Nombre del proyecto"
            placeholder="Ej: Sistema de Ventas"
          />

          <div className="flex items-end gap-3">
            <FormInput
              control={form.control}
              name="color"
              label="Color"
              placeholder="#3B82F6"
            />
            <span
              className="size-9 rounded-md border shrink-0 mb-0.5"
              style={{ backgroundColor: color || "#3B82F6" }}
            />
          </div>

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
          name="description"
          label="Descripción"
          placeholder="Describe el objetivo del proyecto..."
        />

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? "Guardando..." : "Guardar proyecto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
