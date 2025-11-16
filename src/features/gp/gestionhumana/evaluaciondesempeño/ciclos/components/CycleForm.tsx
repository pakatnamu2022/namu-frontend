"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CycleSchema,
  cycleSchemaCreate,
  cycleSchemaUpdate,
} from "../lib/cycle.schema";
import { Loader } from "lucide-react";
import Link from "next/link";
import { FormSelect } from "@/src/shared/components/FormSelect";
import { DateRangePickerFormField } from "@/src/shared/components/DateRangePickerFormField";
import { useEffect } from "react";
import CycleParameterInfo from "./CycleParameterInfo";
import { PeriodResource } from "../../periodos/lib/period.interface";
import { ParameterResource } from "../../parametros/lib/parameter.interface";
import { TYPE_EVALUATION } from "../../evaluaciones/lib/evaluation.constans";
import { DatePickerFormField } from "@/src/shared/components/DatePickerFormField";
import { Matcher } from "react-day-picker";

interface CycleFormProps {
  defaultValues: Partial<CycleSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  periods: PeriodResource[];
  parameters: ParameterResource[];
}

export const CycleForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  periods,
  parameters,
}: CycleFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? cycleSchemaCreate : cycleSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { watch, setValue } = form;

  const parameterId = watch("parameter_id");
  const startDate = watch("start_date");

  const selectedParameter = parameters.find(
    (p) => p.id.toString() === parameterId?.toString()
  );

  useEffect(() => {
    if (startDate) {
      setValue("cut_off_date", startDate);
    }
  }, [startDate]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Ciclo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Productividad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="typeEvaluation"
            label="Tipo de Evaluación"
            placeholder="Selecciona un tipo de evaluación"
            options={TYPE_EVALUATION}
            tooltip="Define el tipo de evaluación que se realizará en este ciclo."
          />

          <DateRangePickerFormField
            control={form.control}
            nameFrom="start_date"
            nameTo="end_date"
            label="Intérvalo del Ciclo"
            tooltip="Fechas que definen el período del ciclo de evaluación."
          />

          <DatePickerFormField
            control={form.control}
            name="cut_off_date"
            label="Fecha de Corte"
            placeholder="Elige una fecha"
            captionLayout="dropdown"
            disabledRange={
              {
                before: form.getValues("start_date"),
                after: form.getValues("end_date"),
              } as Matcher
            }
            tooltip={
              <div>
                Fecha límite para considerar a los participantes según su fecha
                de inicio.
                <li>
                  Ej: Si la fecha de corte es 30/09/2024, los participantes que
                  hayan iniciado antes de esa fecha serán incluidos en el ciclo.
                </li>
              </div>
            }
          />

          <FormSelect
            control={form.control}
            name="parameter_id"
            label="Parámetro"
            placeholder="Selecciona un parámetro"
            options={parameters.map((parameter) => ({
              value: parameter.id.toString(),
              label: parameter.name,
            }))}
            tooltip="El parámetro define los porcentajes de evaluación."
          />

          <FormSelect
            control={form.control}
            name="period_id"
            label="Periodo"
            placeholder="Selecciona un periodo"
            options={periods.map((period) => ({
              value: period.id.toString(),
              label: period.name,
            }))}
            tooltip="El periodo al que pertenece este ciclo."
          />
        </div>

        <CycleParameterInfo selectedParameter={selectedParameter} />

        {/* <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
          </code>
        </pre> */}

        <div className="flex gap-4 w-full justify-end">
          <Link href={mode === "create" ? "./" : "../"}>
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
            {isSubmitting ? "Guardando" : "Guardar Ciclo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
