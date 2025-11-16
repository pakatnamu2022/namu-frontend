import { z } from "zod";

export const metricSchemaCreate = z.object({
  name: z.string().max(100).min(1), // nombre obligatorio
  description: z.string().max(500).optional(),
});

export const metricSchemaUpdate = metricSchemaCreate.partial();

export type MetricSchema = z.infer<typeof metricSchemaCreate>;
