import { z } from "zod";
import { requiredStringId } from "@/shared/lib/global.schema";
import { TYPE_EVALUATION_VALUES } from "../../evaluaciones/lib/evaluation.constans";

const localDate = z.preprocess((val) => {
  if (val instanceof Date) return val;
  if (typeof val === "string") {
    const m = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return val;
}, z.date());

const baseCycleSchema = z.object({
  name: z.string().max(100).min(1),
  start_date: localDate,
  end_date: localDate,
  cut_off_date: localDate,
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
