import { z } from "zod";

export const workerSchemaUpdate = z.object({
  name: z.string().max(100).min(1).optional(),
  document: z.string().max(20).min(1).optional(),
  sede: z.string().max(100).min(1).optional(),
  position: z.string().max(100).min(1).optional(),
  work_schedule_id: z.string().optional(),
  no_attendance_required: z.boolean().optional(),
  supervisor_id: z.string().optional(),
  worker_signature: z.string().nullable().optional(),
});

export type WorkerSchema = z.infer<typeof workerSchemaUpdate>;
