import { z } from "zod";

export const supportsSchema = z.object({
  activity_id: z.string().optional(),
  purchase_order_id: z.string().optional(),
  type: z.string().min(1, "El tipo de sustento es requerido"),
  document_series: z.string().optional(),
  document_number: z.string().optional(),
  issue_date: z.string().optional(),
  supplier_id: z.string().optional(),
  currency_id: z.string().optional(),
  amount: z.coerce.number().optional(),
  file_path: z.string().optional(),
  notes: z.string().optional(),
});

export type SupportsSchema = z.infer<typeof supportsSchema>;
