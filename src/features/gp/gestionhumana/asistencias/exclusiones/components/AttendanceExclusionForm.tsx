"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import {
  attendanceExclusionSchemaCreate,
  attendanceExclusionSchemaUpdate,
  AttendanceExclusionCreateSchema,
  AttendanceExclusionUpdateSchema,
} from "../lib/attendance-exclusion.schema";
import { ATTENDANCE_EXCLUSION } from "../lib/attendance-exclusion.constants";

const { MODEL } = ATTENDANCE_EXCLUSION;

type FormValues = AttendanceExclusionCreateSchema | AttendanceExclusionUpdateSchema;

interface Props {
  isEdit: boolean;
  defaultValues: Partial<FormValues>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  persons?: WorkerResource[];
  personLabel?: string;
  onCancel?: () => void;
  portalContainer?: HTMLElement | null;
}

export const AttendanceExclusionForm = ({
  isEdit,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  persons = [],
  personLabel,
  onCancel,
  portalContainer,
}: Props) => {
  const form = useForm({
    resolver: zodResolver(
      isEdit ? attendanceExclusionSchemaUpdate : attendanceExclusionSchemaCreate,
    ),
    defaultValues: {
      reason: "",
      active: true,
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          {isEdit ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Colaborador: </span>
              <span className="font-semibold">{personLabel}</span>
            </div>
          ) : (
            <FormSelect
              control={form.control}
              name="person_id"
              label="Colaborador"
              placeholder="Selecciona un colaborador"
              options={persons.map((p) => ({
                value: p.id.toString(),
                label: p.name,
              }))}
              strictFilter={true}
              required
              portalContainer={portalContainer}
            />
          )}

          <FormTextArea
            name="reason"
            label="Motivo"
            placeholder="Ej: Trabaja en campo"
            control={form.control}
            rows={3}
          />

          <FormSwitch
            name="active"
            label="Estado"
            text={form.watch("active") ? "Activo" : "Inactivo"}
            control={form.control}
          />
        </div>

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
