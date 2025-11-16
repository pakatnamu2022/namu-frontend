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
  EvaluationSchema,
  evaluationSchemaCreate,
  evaluationSchemaUpdate,
} from "../lib/evaluation.schema";
import { Loader } from "lucide-react";
import Link from "next/link";
import { FormSelect } from "@/src/shared/components/FormSelect";
import RequiredField from "@/src/shared/components/RequiredField";
import { CycleResource } from "../../ciclos/lib/cycle.interface";
import { DateRangePickerFormField } from "@/src/shared/components/DateRangePickerFormField";
import { EVALUATION, TYPE_EVALUATION } from "../lib/evaluation.constans";
import { ParameterResource } from "../../parametros/lib/parameter.interface";
import { useEffect } from "react";
import ParameterInfo from "../../parametros/components/ParameterInfo";

const { MODEL } = EVALUATION;

interface EvaluationFormProps {
  defaultValues: Partial<EvaluationSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  cycles: CycleResource[];
  parametersCompetence: ParameterResource[];
  parametersObjective: ParameterResource[];
  parametersFinal: ParameterResource[];
}

export const EvaluationForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  cycles = [],
  parametersCompetence = [],
  parametersFinal = [],
}: EvaluationFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? evaluationSchemaCreate : evaluationSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { watch, setValue, trigger } = form;

  const typeEvaluation = watch("typeEvaluation");
  const objectivesPercentage = watch("objectivesPercentage");
  const competencesPercentage = watch("competencesPercentage");
  const competenceParameterId = watch("competence_parameter_id");
  const finalParameterId = watch("final_parameter_id");
  const cycleId = watch("cycle_id");
  const cycleSelected = cycles.find((cycle) => cycle.id === Number(cycleId));

  useEffect(() => {
    if (cycleSelected) {
      setValue("typeEvaluation", cycleSelected.typeEvaluation);
      trigger("typeEvaluation");
    }
  }, [cycleSelected]);

  useEffect(() => {
    if (typeEvaluation === "0") {
      setValue("objectivesPercentage", 100);
      setValue("competencesPercentage", 0);
    }
    trigger("typeEvaluation");
    trigger("objectivesPercentage");
    trigger("competencesPercentage");
  }, [typeEvaluation, objectivesPercentage, competencesPercentage]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre de Evaluación <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Agosto 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DateRangePickerFormField
            control={form.control}
            nameFrom="start_date"
            nameTo="end_date"
            label="Rango de la evaluación"
          />

          <FormSelect
            control={form.control}
            name="cycle_id"
            label={() => (
              <FormLabel className="inline-flex">
                Ciclo <RequiredField />
              </FormLabel>
            )}
            placeholder="Selecciona el ciclo"
            options={cycles.map((cycle) => ({
              label: cycle.name,
              value: cycle.id.toString(),
            }))}
          />

          <FormSelect
            disabled={true}
            control={form.control}
            name="typeEvaluation"
            label={() => (
              <FormLabel className="inline-flex">
                Tipo de Evaluación <RequiredField />
              </FormLabel>
            )}
            placeholder="Selecciona el tipo de evaluación"
            options={TYPE_EVALUATION}
          />

          <FormField
            control={form.control}
            name="objectivesPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Objetivos (%) <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    max={100}
                    placeholder="Ej: 20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="competencesPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Competencias (%) <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={typeEvaluation === "0"}
                    type="number"
                    max={100}
                    placeholder="Ej: 80"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="competence_parameter_id"
            label={() => (
              <FormLabel className="inline-flex">
                Parámetro de Competencias <RequiredField />
              </FormLabel>
            )}
            placeholder="Selecciona el parámetro"
            options={parametersCompetence.map((cycle) => ({
              label: cycle.name,
              value: cycle.id.toString(),
            }))}
          />

          <FormSelect
            control={form.control}
            name="final_parameter_id"
            label={() => (
              <FormLabel className="inline-flex">
                Parámetro de Evaluación <RequiredField />
              </FormLabel>
            )}
            placeholder="Selecciona el parámetro"
            options={parametersFinal.map((cycle) => ({
              label: cycle.name,
              value: cycle.id.toString(),
            }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {competenceParameterId && (
              <ParameterInfo
                parameter={parametersCompetence.find(
                  (param) =>
                    param.id ===
                    Number(form.getValues().competence_parameter_id)
                )}
              />
            )}
          </div>
          <div className="md:col-start-2">
            {finalParameterId && (
              <ParameterInfo
                parameter={parametersFinal.find(
                  (param) =>
                    param.id === Number(form.getValues().final_parameter_id)
                )}
              />
            )}
          </div>
        </div>

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
              className={`mr-2 h-4 w-4 ${
                !isSubmitting ? "hidden" : "animate-spin"
              }`}
            />
            {isSubmitting ? "Guardando" : "Guardar " + MODEL.name}
          </Button>
        </div>
      </form>
    </Form>
  );
};
