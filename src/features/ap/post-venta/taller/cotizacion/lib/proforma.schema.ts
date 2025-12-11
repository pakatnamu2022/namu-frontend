import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const orderQuotationSchemaCreate = z.object({
  vehicle_id: requiredStringId("Vehículo es requerido"),
  quotation_date: z
    .union([z.literal(""), z.date()])
    .refine((val) => val !== "", {
      message: "Fecha de cotización es requerida",
    }),
  expiration_date: z.union([z.literal(""), z.date()]),
  observations: z.string().min(0).max(500).optional(),
});

export const orderQuotationSchemaUpdate = orderQuotationSchemaCreate.partial();

export type OrderQuotationSchema = z.infer<typeof orderQuotationSchemaCreate>;
