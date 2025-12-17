import { z } from "zod";

export const expenseSchema = z.object({
  expense_date: z.date({
    required_error: "La fecha del gasto es requerida",
  }),
  concept: z
    .string({
      required_error: "El concepto es requerido",
    })
    .min(1, "El concepto es requerido"),
  receipt_amount: z
    .number({
      required_error: "El monto del comprobante es requerido",
    })
    .min(0, "El monto debe ser mayor o igual a 0"),
  company_amount: z
    .number({
      required_error: "El monto de la empresa es requerido",
    })
    .min(0, "El monto debe ser mayor o igual a 0"),
  employee_amount: z
    .number({
      required_error: "El monto del empleado es requerido",
    })
    .min(0, "El monto debe ser mayor o igual a 0"),
  receipt_type: z
    .string({
      required_error: "El tipo de comprobante es requerido",
    })
    .min(1, "El tipo de comprobante es requerido"),
  receipt_number: z
    .string({
      required_error: "El número de comprobante es requerido",
    })
    .min(1, "El número de comprobante es requerido"),
  receipt_file: z
    .instanceof(File, {
      message: "El archivo del comprobante es requerido",
    })
    .optional(),
  notes: z.string().optional(),
  expense_type_id: z
    .number({
      required_error: "El tipo de gasto es requerido",
    })
    .min(1, "El tipo de gasto es requerido"),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
