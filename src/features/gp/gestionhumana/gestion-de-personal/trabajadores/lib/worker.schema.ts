import { z } from "zod";
import { requiredStringId } from "@/shared/lib/global.schema.ts";

export const periodSchemaCreate = z.object({
  name: z.string().max(100).min(1), // nombre obligatorio
  start_date: z.coerce.date(), // fecha de inicio
  end_date: z.coerce.date(), // fecha de fin
});

export const periodSchemaUpdate = periodSchemaCreate.partial();

export type WorkerSchema = z.infer<typeof periodSchemaCreate>;

// Schema para actualización de firma del asesor
export const workerSignatureSchemaUpdate = z.object({
  worker_signature: z.string().nullable(),
  supervisor_id: requiredStringId("Supervisor es requerido"),
});

export type WorkerSignatureSchema = z.infer<typeof workerSignatureSchemaUpdate>;
