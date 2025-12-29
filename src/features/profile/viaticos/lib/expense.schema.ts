import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const expenseSchema = z
  .object({
    expense_date: z.date({
      error: "La fecha del gasto es requerida",
    }),
    receipt_amount: z
      .number({
        error: "El monto del comprobante es requerido",
      })
      .min(0, "El monto debe ser mayor o igual a 0"),
    receipt_type: z
      .string({
        error: "El tipo de comprobante es requerido",
      })
      .min(1, "El tipo de comprobante es requerido"),
    receipt_number: z.string().optional(),
    ruc: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return /^\d+$/.test(val) && val.length <= 20;
        },
        {
          message: "El RUC debe contener solo números y máximo 20 dígitos",
        }
      ),
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
  )
  .refine(
    (data) => {
      // El RUC es requerido solo para factura o boleta
      if (
        (data.receipt_type === "invoice" || data.receipt_type === "ticket") &&
        (!data.ruc || data.ruc.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "El RUC es requerido cuando el tipo es factura o boleta",
      path: ["ruc"],
    }
  )
  .refine(
    (data) => {
      // El archivo es requerido solo cuando es factura (receipt_type === "invoice")
      if (data.receipt_type === "invoice" && !data.receipt_file) {
        return false;
      }
      return true;
    },
    {
      message:
        "El archivo del comprobante es requerido cuando el tipo es factura",
      path: ["receipt_file"],
    }
  );

export type ExpenseSchema = z.infer<typeof expenseSchema>;
