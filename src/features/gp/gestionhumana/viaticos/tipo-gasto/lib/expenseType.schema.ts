import { z } from "zod";

export const expenseTypeSchema = z.object({
  code: z
    .string({
      required_error: "El código es requerido",
    })
    .min(1, "El código es requerido")
    .max(50, "El código no puede exceder 50 caracteres"),
  name: z
    .string({
      required_error: "El nombre es requerido",
    })
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  full_name: z
    .string({
      required_error: "El nombre completo es requerido",
    })
    .min(1, "El nombre completo es requerido")
    .max(200, "El nombre completo no puede exceder 200 caracteres"),
  description: z.string().optional(),
  requires_receipt: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z
    .number({
      required_error: "El orden es requerido",
    })
    .min(0, "El orden debe ser mayor o igual a 0"),
  parent_id: z.number().nullable().optional(),
});

export type ExpenseTypeSchema = z.infer<typeof expenseTypeSchema>;
