import { z } from "zod";

export const discountRequestSchema = z.object({
  type: z.enum(["GLOBAL", "PARTIAL"]),
  requested_discount_percentage: z
    .number({ error: "Ingrese un porcentaje válido" })
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),
  requested_discount_amount: z
    .number({ error: "Ingrese un monto válido" })
    .min(0, "Debe ser mayor o igual a 0"),
  ap_order_quotation_id: z.number().int().positive().nullable().optional(),
  ap_order_quotation_detail_id: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
  item_type: z.enum(["PRODUCT", "LABOR"]),
});

export type DiscountRequestSchema = z.infer<typeof discountRequestSchema>;
