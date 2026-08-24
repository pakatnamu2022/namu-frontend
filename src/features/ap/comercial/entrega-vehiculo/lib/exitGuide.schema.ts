import { requiredStringId } from "@/shared/lib/global.schema";
import {
  scheduledDeliveryDate,
  scheduledDeliveryDateExtraordinary,
} from "./vehicleDelivery.schema";
import { z } from "zod";

export const exitGuideSchema = z
  .object({
    ap_class_article_id: requiredStringId("La clase de artículo es requerida"),
    sede_id: requiredStringId("Selecciona una Sede"),
    client_id: requiredStringId("El cliente es requerido"),
    vehicle_id: z.string().min(1, "El vehículo es requerido"),
    advisor_id: z.string().min(1, "El asesor es requerido"),
    scheduled_delivery_date: z.coerce.date({
      error: "La fecha de entrega programada es requerida",
    }),
    observations: z.string().optional(),
    is_extraordinary: z.boolean().optional(),
    extraordinary_reason: z
      .string()
      .max(500, "El motivo no puede exceder 500 caracteres")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const result = data.is_extraordinary
      ? scheduledDeliveryDateExtraordinary.safeParse(data.scheduled_delivery_date)
      : scheduledDeliveryDate.safeParse(data.scheduled_delivery_date);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ ...issue, path: ["scheduled_delivery_date"] });
      }
    }
    if (data.is_extraordinary && !data.extraordinary_reason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "El motivo de la entrega extraordinaria es obligatorio",
        path: ["extraordinary_reason"],
      });
    }
  });

export type ExitGuideSchema = z.infer<typeof exitGuideSchema>;
