import { z } from "zod";

export const reportFilterSchema = z.object({
  format: z.enum(["excel", "pdf"]),
});

export type ReportFilterSchema = z.infer<typeof reportFilterSchema>;
