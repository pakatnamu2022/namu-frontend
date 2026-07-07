import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const exitGuideSchema = z.object({
  ap_class_article_id: requiredStringId("La clase de artículo es requerida"),
  sede_id: requiredStringId("Selecciona una Sede"),
  vehicle_id: z.string().min(1, "El vehículo es requerido"),
  advisor_id: z.string().min(1, "El asesor es requerido"),
  scheduled_delivery_date: z
    .string()
    .min(1, "La fecha de entrega programada es requerida"),
  observations: z.string().optional(),
});

export type ExitGuideSchema = z.infer<typeof exitGuideSchema>;
