import { z } from "zod";

const weightSchema = z
  .number({
    error: "El peso es obligatorio",
  })
  .min(0, "El peso no puede ser negativo")
  .max(100, "El peso no puede ser mayor a 100");

export const evaluationModelSchemaCreate = z
  .object({
    leadership_weight: weightSchema,
    self_weight: weightSchema,
    par_weight: weightSchema,
    report_weight: weightSchema,
    categories: z
      .array(z.number())
      .min(1, "Debe seleccionar al menos una categoría"),
  })
  .refine(
    (data) => {
      const total =
        data.leadership_weight +
        data.self_weight +
        data.par_weight +
        data.report_weight;
      return total === 100;
    },
    {
      message: "La suma de los pesos debe ser igual a 100",
      path: ["leadership_weight"],
    }
  );

export const evaluationModelSchemaUpdate = evaluationModelSchemaCreate.partial();

export type EvaluationModelSchema = z.infer<
  typeof evaluationModelSchemaCreate
>;
