import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const vehicleDeliverySchemaCreate = z.object({
  sede_id: requiredStringId("Selecciona una Sede"),
  vehicle_id: z.string().min(1, "El vehículo es requerido"),
  scheduled_delivery_date: z.coerce.date({
    error: "La fecha de entrega programada es requerida",
  }),
  ap_class_article_id: requiredStringId("La clase de artículo es requerida"),
  observations: z.string().min(1, "Las observaciones son requeridas"),
});

export const vehicleDeliverySchemaUpdate = z.object({
  vehicle_id: z.string().min(1, "El vehículo es requerido"),
  scheduled_delivery_date: z.coerce.date({
    error: "La fecha de entrega programada es requerida",
  }),
  ap_class_article_id: requiredStringId("La clase de artículo es requerida"),
  observations: z.string().min(1, "Las observaciones son requeridas"),
});

export type VehicleDeliverySchema = z.infer<typeof vehicleDeliverySchemaCreate>;
