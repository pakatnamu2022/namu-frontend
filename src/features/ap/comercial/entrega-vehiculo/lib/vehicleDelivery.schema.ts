import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const vehicleDeliverySchemaCreate = z
  .object({
    sede_id: requiredStringId("Selecciona una Sede"),
    vehicle_id: z.string().min(1, "El vehículo es requerido"),
    scheduled_delivery_date: z.date({
      error: "La fecha de entrega programada es requerida",
    }),
    wash_date: z.date({
      error: "La fecha de lavado es requerida",
    }),
    ap_class_article_id: requiredStringId("La clase de artículo es requerida"),
    observations: z.string().min(1, "Las observaciones son requeridas"),
  })
  .refine((data) => data.wash_date <= data.scheduled_delivery_date, {
    message:
      "La fecha de lavado no puede ser mayor a la fecha de entrega programada",
    path: ["wash_date"],
  });

export const vehicleDeliverySchemaUpdate = z
  .object({
    vehicle_id: z.string().min(1, "El vehículo es requerido"),
    scheduled_delivery_date: z.date({
      error: "La fecha de entrega programada es requerida",
    }),
    wash_date: z.date({
      error: "La fecha de lavado es requerida",
    }),
    ap_class_article_id: requiredStringId("La clase de artículo es requerida"),
    observations: z.string().min(1, "Las observaciones son requeridas"),
  })
  .refine((data) => data.wash_date <= data.scheduled_delivery_date, {
    message:
      "La fecha de lavado no puede ser mayor a la fecha de entrega programada",
    path: ["wash_date"],
  });

export type VehicleDeliverySchema = z.infer<typeof vehicleDeliverySchemaCreate>;
