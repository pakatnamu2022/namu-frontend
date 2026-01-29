import { optionalStringId, requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const orderQuotationSchemaCreate = z.object({
  client_id: requiredStringId("Cliente es requerido"),
  vehicle_id: requiredStringId("Vehículo es requerido"),
  sede_id: requiredStringId("Sede es requerida"),
  quotation_date: z
    .union([z.literal(""), z.date()])
    .refine((val) => val !== "", {
      message: "Fecha de cotización es requerida",
    }),
  expiration_date: z.union([z.literal(""), z.date()]),
  observations: z.string().min(0).max(500).optional(),
  area_id: optionalStringId("Área es requerido"),
  currency_id: requiredStringId("Moneda es requerida"),
});

export const orderQuotationSchemaUpdate = orderQuotationSchemaCreate.partial();

export type OrderQuotationSchema = z.infer<typeof orderQuotationSchemaCreate>;
