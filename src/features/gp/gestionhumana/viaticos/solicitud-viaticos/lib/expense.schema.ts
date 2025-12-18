import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const expenseSchema = z
  .object({
    expense_date: z.date({
      error: "La fecha del gasto es requerida",
    }),
    concept: z
      .string({
        error: "El concepto es requerido",
      })
      .min(1, "El concepto es requerido"),
    receipt_amount: z
      .number({
        error: "El monto del comprobante es requerido",
      })
      .min(0, "El monto debe ser mayor o igual a 0"),
    company_amount: z
      .number({
        error: "El monto de la empresa es requerido",
      })
      .min(0, "El monto debe ser mayor o igual a 0"),
    employee_amount: z
      .number({
        error: "El monto del empleado es requerido",
      })
      .min(0, "El monto debe ser mayor o igual a 0"),
    receipt_type: z
      .string({
        error: "El tipo de comprobante es requerido",
      })
      .min(1, "El tipo de comprobante es requerido"),
    receipt_number: z.string().optional(),
    receipt_file: z
      .instanceof(File, {
        message: "El archivo del comprobante es requerido",
      })
      .optional(),
    notes: z.string().optional(),
    expense_type_id: requiredStringId("El tipo de gasto es requerido"),
  })
  .refine(
    (data) => {
      // El número de comprobante es requerido solo para factura o boleta
      if (
        (data.receipt_type === "invoice" || data.receipt_type === "ticket") &&
        (!data.receipt_number || data.receipt_number.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "El número de comprobante es requerido cuando el tipo es factura o boleta",
      path: ["receipt_number"],
    }
  );

export type ExpenseSchema = z.infer<typeof expenseSchema>;
