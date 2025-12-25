import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

const invoiceBaseObject = z.object({
  groupNumber: z.number().min(1, "El número de grupo es requerido"),
  customer_id: requiredStringId("Cliente es requerido"),
  clientName: z
    .string()
    .min(3, "El nombre del cliente debe tener al menos 3 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "El nombre del cliente es requerido",
    }),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .refine((value) => value.trim() !== "", {
      message: "La descripción es requerida",
    }),
  amount: z
    .number()
    .min(0.01, "El monto debe ser mayor a 0")
    .refine((value) => value > 0, {
      message: "El monto debe ser mayor a 0",
    }),
  taxRate: z
    .number()
    .min(0, "La tasa de impuesto no puede ser negativa")
    .max(100, "La tasa de impuesto no puede ser mayor a 100"),
});

export const invoiceSchemaCreate = invoiceBaseObject;

export const invoiceSchemaUpdate = invoiceBaseObject.partial();

export type InvoiceSchema = z.infer<typeof invoiceSchemaCreate>;
