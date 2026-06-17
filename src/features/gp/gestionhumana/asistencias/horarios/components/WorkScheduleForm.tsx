"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { FormInput } from "@/shared/components/FormInput";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  workScheduleSchema,
  type WorkScheduleSchema,
  type WorkScheduleDetailSchema,
} from "../lib/work-schedule.schema";
import { WORK_SCHEDULE, DAY_OF_WEEK_LABELS } from "../lib/work-schedule.constants";
import { WorkScheduleDayForm } from "./WorkScheduleDayForm";

const { ABSOLUTE_ROUTE, MODEL } = WORK_SCHEDULE;

interface WorkScheduleFormProps {
  defaultValues: Partial<WorkScheduleSchema>;
  onSubmit: (data: WorkScheduleSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

function timeStr(t: string | null | undefined) {
  return t ? t.slice(0, 5) : "—";
}

export function WorkScheduleForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: WorkScheduleFormProps) {
  const form = useForm<WorkScheduleSchema>({
    resolver: zodResolver(workScheduleSchema) as any,
    defaultValues: {
      name: defaultValues.name ?? "",
      checkin: defaultValues.checkin ?? "",
      lunch_out: defaultValues.lunch_out ?? "",
      lunch_in: defaultValues.lunch_in ?? "",
      checkout: defaultValues.checkout ?? "",
      details: defaultValues.details ?? [],
    },
    mode: "onChange",
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [editDayIndex, setEditDayIndex] = useState<number | null>(null);

  const usedDays = fields.map((f) => f.day_of_week);

  const handleDaySubmit = (data: WorkScheduleDetailSchema) => {
    if (editDayIndex !== null) {
      update(editDayIndex, data);
    } else {
      append(data);
    }
    setEditDayIndex(null);
    setDayModalOpen(false);
  };

  const handleOpenAdd = () => {
    setEditDayIndex(null);
    setDayModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditDayIndex(index);
    setDayModalOpen(true);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full"
      >
        <FormInput
          name="name"
          label="Nombre del horario"
          placeholder="Ej: Horario General"
          control={form.control}
          required
        />

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Horario general
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormInput
              name="checkin"
              label="Entrada"
              type="time"
              control={form.control}
              required
            />
            <FormInput
              name="lunch_out"
              label="Salida almuerzo"
              type="time"
              control={form.control}
              optional
            />
            <FormInput
              name="lunch_in"
              label="Regreso almuerzo"
              type="time"
              control={form.control}
              optional
            />
            <FormInput
              name="checkout"
              label="Salida"
              type="time"
              control={form.control}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Excepciones por día
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenAdd}
              disabled={fields.length >= 7}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar día
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              Sin excepciones — todos los días usan el horario general.
            </p>
          ) : (
            <div className="border rounded-md divide-y">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between px-4 py-2 text-sm"
                >
                  <span className="font-medium w-28">
                    {DAY_OF_WEEK_LABELS[field.day_of_week]}
                  </span>
                  <span className="tabular-nums font-mono text-xs text-muted-foreground flex gap-3">
                    <span>{timeStr(field.checkin)} → {timeStr(field.checkout)}</span>
                    {(field.lunch_out || field.lunch_in) && (
                      <span className="text-muted-foreground/60">
                        almuerzo {timeStr(field.lunch_out)}–{timeStr(field.lunch_in)}
                      </span>
                    )}
                  </span>
                  <div className="flex gap-1 ml-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleOpenEdit(index)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando..." : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>

      <GeneralModal
        open={dayModalOpen}
        onClose={() => {
          setEditDayIndex(null);
          setDayModalOpen(false);
        }}
        title={editDayIndex !== null ? "Editar excepción de día" : "Nueva excepción de día"}
        size="md"
      >
        <WorkScheduleDayForm
          defaultValues={
            editDayIndex !== null ? fields[editDayIndex] : undefined
          }
          usedDays={usedDays}
          onSubmit={handleDaySubmit}
          onCancel={() => {
            setEditDayIndex(null);
            setDayModalOpen(false);
          }}
        />
      </GeneralModal>
    </Form>
  );
}
