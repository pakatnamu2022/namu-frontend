"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { PayrollPeriodResource } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.interface";
import {
  exclusionSchemaCreate,
  ExclusionCreateSchema,
} from "../lib/exclusion.schema";
import { PAYROLL_EXCLUSION, EXCLUSION_CONCEPTS } from "../lib/exclusion.constants";

const { MODEL } = PAYROLL_EXCLUSION;

interface Props {
  defaultValues: Partial<ExclusionCreateSchema>;
  onSubmit: (data: ExclusionCreateSchema) => void;
  isSubmitting?: boolean;
  workers?: WorkerResource[];
  periods?: PayrollPeriodResource[];
  onCancel?: () => void;
  portalContainer?: HTMLElement | null;
}

export const ExclusionForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  workers = [],
  periods = [],
  onCancel,
  portalContainer,
}: Props) => {
  const form = useForm({
    resolver: zodResolver(exclusionSchemaCreate),
    defaultValues: {
      worker_id: "",
      period_id: "",
      concept: "FAMILY_ALLOWANCE",
      reason: "",
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
            name="worker_id"
            label="Trabajador"
            placeholder="Selecciona un trabajador"
            options={workers.map((w) => ({
              value: w.id.toString(),
              label: w.name,
            }))}
            strictFilter={true}
            required
            portalContainer={portalContainer}
          />

          <FormSelect
            control={form.control}
            name="period_id"
            label="Periodo"
            placeholder="Selecciona un periodo"
            options={periods.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            required
            portalContainer={portalContainer}
          />

          <FormSelect
            control={form.control}
            name="concept"
            label="Concepto a excluir"
            placeholder="Selecciona un concepto"
            options={EXCLUSION_CONCEPTS}
            required
            portalContainer={portalContainer}
          />

          <FormTextArea
            name="reason"
            label="Motivo"
            placeholder="Ej: Ya se descontó manualmente en la boleta"
            control={form.control}
            rows={3}
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
