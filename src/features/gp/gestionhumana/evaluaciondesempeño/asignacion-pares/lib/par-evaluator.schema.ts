import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const parEvaluatorSchemaCreate = z.object({
  worker_id: requiredStringId("Seleccione un trabajador"),
  mate_id: requiredStringId("Seleccione un par"),
});

export const parEvaluatorSchemaUpdate = parEvaluatorSchemaCreate.partial();

export type ParEvaluatorSchema = z.infer<typeof parEvaluatorSchemaCreate>;
