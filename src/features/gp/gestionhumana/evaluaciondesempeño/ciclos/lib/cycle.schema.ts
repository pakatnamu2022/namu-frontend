import { z } from "zod";
import { requiredStringId } from "@/shared/lib/global.schema";
import { TYPE_EVALUATION_VALUES } from "../../evaluaciones/lib/evaluation.constans";

const baseCycleSchema = z.object({
  name: z.string().max(100).min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  cut_off_date: z.coerce.date(),
  // start_date_objectives: z.coerce.date(),
  // end_date_objectives: z.coerce.date(),
  period_id: requiredStringId("Selecciona un período"),
  parameter_id: requiredStringId("Selecciona un parámetro"),
  typeEvaluation: z
    .enum(TYPE_EVALUATION_VALUES, {
      message: "Selecciona un tipo de evaluación",
    })
    .default("0"),
});
// .refine(
//   (data) =>
//     data.end_date >= data.start_date_objectives &&
//     data.end_date >= data.end_date_objectives,
//   {
//     path: ["end_date"],
//     message:
//       "La fecha fin del ciclo debe ser mayor o igual a las fechas de definición de objetivos.",
//   }
// );

export const cycleSchemaCreate = baseCycleSchema;
export const cycleSchemaUpdate = baseCycleSchema;

export type CycleSchema = z.infer<typeof baseCycleSchema>;
