import { requiredStringId } from "@/src/shared/lib/global.schema";
import { z } from "zod";
import { checkEvaluationDates } from "../lib/evaluation.actions";
import { TYPE_EVALUATION_VALUES } from "./evaluation.constans";

// esquema base (como ya lo tienes)
const baseEvaluationSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  typeEvaluation: z.enum(TYPE_EVALUATION_VALUES, {
    errorMap: (issue, ctx) => {
      switch (issue.code) {
        case z.ZodIssueCode.invalid_enum_value:
          return { message: "Selecciona un tipo de evaluación válido" };
        case z.ZodIssueCode.invalid_type:
          return { message: "El tipo de evaluación es requerido" };
        default:
          return { message: ctx.defaultError };
      }
    },
  }),
  objectivesPercentage: z.coerce.number().int().min(0).max(100),
  competencesPercentage: z.coerce.number().int().min(0).max(100),
  cycle_id: requiredStringId("El ciclo es obligatorio"),
  competence_parameter_id: requiredStringId(
    "El parámetro de competencia es obligatorio"
  ),
  final_parameter_id: requiredStringId("El parámetro final es obligatorio"),
});

// create → required + async
export const evaluationSchemaCreate = baseEvaluationSchema
  .superRefine((data, ctx) => {
    if (data.end_date < data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "La fecha de fin debe ser mayor que la fecha de inicio",
      });
    }
    const sum = data.objectivesPercentage + data.competencesPercentage;
    if (sum !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["objectivesPercentage"],
        message: "La suma de objetivos y competencias debe ser 100",
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["competencesPercentage"],
        message: "La suma de objetivos y competencias debe ser 100",
      });
    }
    if (data.typeEvaluation === "0") {
      if (data.objectivesPercentage !== 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["objectivesPercentage"],
          message: "Debe ser 100 cuando es evaluación de objetivos",
        });
      }
      if (data.competencesPercentage !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["competencesPercentage"],
          message: "Debe ser 0 cuando es evaluación de objetivos",
        });
      }
    }
  })
  .refine(
    async (data) => {
      // solo validar si ambas fechas existen
      if (!data.start_date || !data.end_date) return true;

      const res = await checkEvaluationDates(
        data.start_date.toISOString(),
        data.end_date.toISOString()
      );
      return res.isValid;
    },
    {
      message: "Ya existe una evaluación en el rango de fechas seleccionado",
      path: ["end_date"], // puedes mostrar en end_date o en ambos
    }
  );

// update → parcial (si también quieres async lo agregas igual que arriba)
export const evaluationSchemaUpdate = baseEvaluationSchema
  .partial()
  .superRefine((data, ctx) => {
    if (
      data.objectivesPercentage !== undefined &&
      data.competencesPercentage !== undefined
    ) {
      const sum = data.objectivesPercentage + data.competencesPercentage;
      if (sum !== 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["objectivesPercentage"],
          message: "La suma de objetivos y competencias debe ser 100",
        });
      }
    }
    if (data.typeEvaluation !== undefined && data.typeEvaluation === "0") {
      if (
        data.objectivesPercentage !== undefined &&
        data.objectivesPercentage !== 100
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["objectivesPercentage"],
          message: "Debe ser 100 cuando el tipo de evaluación es 0",
        });
      }
      if (
        data.competencesPercentage !== undefined &&
        data.competencesPercentage !== 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["competencesPercentage"],
          message: "Debe ser 0 cuando el tipo de evaluación es 0",
        });
      }
    }
  });

export type EvaluationSchema = z.infer<typeof evaluationSchemaCreate>;
