import { requiredStringId } from "@/shared/lib/global.schema";
import { getDeliverySlotsForDay } from "./vehicleDelivery.constants";
import { z } from "zod";

const isValidDeliverySlot = (date: Date) => {
  const slots = getDeliverySlotsForDay(date);
  if (slots.length === 0) return false;
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
  return slots.includes(time);
};

const isFromTomorrowOnward = (date: Date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return date >= tomorrow;
};

const scheduledDeliveryDate = z.coerce
  .date({
    error: "La fecha de entrega programada es requerida",
  })
  .refine(isFromTomorrowOnward, {
    message: "La entrega debe programarse a partir de mañana",
  })
  .refine(isValidDeliverySlot, {
    message:
      "Horario inválido. Lun-Vie: 9, 10, 11, 12, 15, 16 y 17h. Sáb: 10, 11 y 12h. No se atiende domingos.",
  });

export const vehicleDeliverySchemaCreate = z.object({
  sede_id: requiredStringId("Selecciona una Sede"),
  vehicle_id: z.string().min(1, "El vehículo es requerido"),
  scheduled_delivery_date: scheduledDeliveryDate,
  ap_class_article_id: requiredStringId("La clase de artículo es requerida"),
  observations: z.string().min(1, "Las observaciones son requeridas"),
});

export const vehicleDeliverySchemaUpdate = z.object({
  vehicle_id: z.string().min(1, "El vehículo es requerido"),
  scheduled_delivery_date: scheduledDeliveryDate,
  ap_class_article_id: requiredStringId("La clase de artículo es requerida"),
  observations: z.string().min(1, "Las observaciones son requeridas"),
});

export type VehicleDeliverySchema = z.infer<typeof vehicleDeliverySchemaCreate>;
