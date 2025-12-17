import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const perDiemRequestSchemaCreate = z.object({
  company_id: z.string().refine((value) => value.trim() !== "", {
    message: "La empresa es requerida",
  }),
  per_diem_category_id: z.string().refine((value) => value.trim() !== "", {
    message: "La categoría de viático es requerida",
  }),
  start_date: z.union([z.literal(""), z.date()], {
    message: "La fecha de inicio es requerida",
  }),
  end_date: z.union([z.literal(""), z.date()], {
    message: "La fecha de fin es requerida",
  }),
  purpose: z
    .string()
    .max(500)
    .refine((value) => value.trim() !== "", {
      message: "El propósito es requerido",
    }),
  notes: z.string().max(500).optional().default(""),
  district_id: requiredStringId("El distrito es requerido"),
});

export const perDiemRequestSchemaUpdate = z.object({
  employee_id: z.string().refine((value) => value.trim() !== "", {
    message: "El empleado es requerido",
  }),
  company_id: z.string().refine((value) => value.trim() !== "", {
    message: "La empresa es requerida",
  }),
  per_diem_category_id: z.string().refine((value) => value.trim() !== "", {
    message: "La categoría de viático es requerida",
  }),
  start_date: z.union([z.literal(""), z.date()], {
    message: "La fecha de inicio es requerida",
  }),
  end_date: z.union([z.literal(""), z.date()], {
    message: "La fecha de fin es requerida",
  }),
  purpose: z
    .string()
    .max(500)
    .refine((value) => value.trim() !== "", {
      message: "El propósito es requerido",
    }),
  notes: z.string().max(500).optional().default(""),
  status: z.string().max(50).optional(),
  paid: z.boolean().optional().default(false),
  payment_date: z.union([z.literal(""), z.date()]).optional(),
  settled: z.boolean().optional().default(false),
  settlement_date: z.union([z.literal(""), z.date()]).optional(),
  total_spent: z
    .number()
    .min(0, { message: "El total gastado debe ser mayor o igual a 0" })
    .optional()
    .default(0),
  balance_to_return: z.number().optional().default(0),
  district_id: requiredStringId("El distrito es requerido"),
});

export type PerDiemRequestSchema = z.infer<typeof perDiemRequestSchemaCreate>;
export type PerDiemRequestSchemaUpdate = z.infer<
  typeof perDiemRequestSchemaUpdate
>;
