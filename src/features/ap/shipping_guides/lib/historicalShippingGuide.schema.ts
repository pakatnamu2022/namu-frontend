import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const historicalShippingGuideSchema = z.object({
  vin: z
    .string()
    .min(1, "El VIN es requerido")
    .max(17, "El VIN no puede exceder 17 caracteres"),
  series: requiredStringId("La serie es requerida"),
  correlativo: requiredStringId("El correlativo es requerido"),
  issue_date: z.coerce.date({ error: "La fecha de emisión es requerida" }),
  sede_transmitter_id: requiredStringId("La sede del emisor es requerida"),
  advisor_id: requiredStringId("El asesor es requerido"),
  client_id: requiredStringId("El cliente es requerido"),
  notes: z.string().optional(),
});

export type HistoricalShippingGuideSchema = z.infer<
  typeof historicalShippingGuideSchema
>;
